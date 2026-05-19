export type FlyToCartOptions = {
  imageUrl: string;
  fromRect: DOMRect;
  cartSelector?: string;
  durationMs?: number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeInQuad = (t: number) => t * t;

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
};

const getCartRect = (selector: string) => {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return null;
  return el.getBoundingClientRect();
};

const cubicBezier = (
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
) => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
};

export function flyImageToCart(options: FlyToCartOptions) {
  if (typeof window === 'undefined') return;
  if (prefersReducedMotion()) return;

  const cartSelector = options.cartSelector || '[data-cart-target]';
  const cartRect = getCartRect(cartSelector);
  if (!cartRect) return;

  const from = options.fromRect;

  const start = {
    x: from.left + from.width * 0.5,
    y: from.top + from.height * 0.45,
  };
  const end = {
    x: cartRect.left + cartRect.width * 0.5,
    y: cartRect.top + cartRect.height * 0.5,
  };

  const dx = end.x - start.x;
  const travel = Math.hypot(dx, end.y - start.y);
  const lift = Math.min(220, Math.max(90, travel * 0.22));
  const leftKick = Math.min(180, Math.max(70, Math.abs(dx) * 0.25));

  const p0 = start;
  // first go left (or further left if already going left), then swing right into cart
  const p1 = { x: start.x - leftKick, y: start.y - lift };
  const p2 = { x: end.x + Math.min(120, Math.max(40, Math.abs(dx) * 0.12)), y: end.y - lift * 0.35 };
  const p3 = end;

  const node = document.createElement('img');
  node.src = options.imageUrl;
  node.alt = '';
  node.decoding = 'async';
  node.loading = 'eager';
  node.style.position = 'fixed';
  node.style.left = '0px';
  node.style.top = '0px';
  const startSize = Math.max(64, Math.min(148, Math.min(from.width, from.height) * 0.28));
  const endSize = 14;
  const startH = startSize;
  const startW = Math.max(16, Math.round(startSize * 0.75)); // 3:4-ish shape (not circle)
  const endH = endSize;
  const endW = Math.max(10, Math.round(endSize * 0.75));
  node.style.width = `${startW}px`;
  node.style.height = `${startH}px`;
  node.style.borderRadius = `${Math.max(10, Math.round(startSize * 0.22))}px`;
  node.style.objectFit = 'cover';
  node.style.pointerEvents = 'none';
  node.style.zIndex = '9999';
  node.style.willChange = 'transform, opacity';
  node.style.boxShadow = '0 18px 40px rgba(0,0,0,0.18)';
  node.style.opacity = '0';

  document.body.appendChild(node);

  const autoDuration = 720 + (startSize - 64) * 10; // bigger start => slower total
  const durationMs = Math.max(550, Math.min(1700, options.durationMs ?? autoDuration));
  const startTs = performance.now();

  let rafId = 0;
  const tick = (now: number) => {
    const raw = (now - startTs) / durationMs;
    const t = clamp01(raw);
    // slow -> fast travel
    const eased = easeInQuad(t);
    // slow -> fast shrink (large -> small)
    const shrinkT = easeInCubic(t);

    const pos = cubicBezier(eased, p0, p1, p2, p3);
    const h = startH + (endH - startH) * shrinkT;
    const w = startW + (endW - startW) * shrinkT;
    const radius = Math.max(8, Math.round(h * 0.22));

    const opacity = t < 0.06 ? t / 0.06 : t > 0.86 ? (1 - t) / 0.14 : 1;
    const rotate = dx >= 0 ? easeOutCubic(t) * 16 : -easeOutCubic(t) * 16;

    node.style.opacity = String(opacity);
    node.style.transform = `translate(${pos.x - w / 2}px, ${pos.y - h / 2}px) rotate(${rotate}deg)`;
    node.style.width = `${w}px`;
    node.style.height = `${h}px`;
    node.style.borderRadius = `${radius}px`;

    if (t < 1) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      node.remove();
      window.cancelAnimationFrame(rafId);
    }
  };

  rafId = window.requestAnimationFrame(tick);
}
