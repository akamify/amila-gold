export type FlyToCartOptions = {
  imageUrl: string;
  fromRect: DOMRect;
  cartSelector?: string;
  durationMs?: number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

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
  const lift = Math.min(180, Math.max(80, Math.abs(dx) * 0.18));

  const p0 = start;
  const p1 = { x: start.x + dx * 0.25, y: start.y - lift };
  const p2 = { x: start.x + dx * 0.75, y: end.y - lift * 0.35 };
  const p3 = end;

  const node = document.createElement('img');
  node.src = options.imageUrl;
  node.alt = '';
  node.decoding = 'async';
  node.loading = 'eager';
  node.style.position = 'fixed';
  node.style.left = '0px';
  node.style.top = '0px';
  node.style.width = '44px';
  node.style.height = '44px';
  node.style.borderRadius = '999px';
  node.style.objectFit = 'cover';
  node.style.pointerEvents = 'none';
  node.style.zIndex = '9999';
  node.style.willChange = 'transform, opacity';
  node.style.boxShadow = '0 18px 40px rgba(0,0,0,0.18)';
  node.style.opacity = '0';

  document.body.appendChild(node);

  const durationMs = Math.max(500, Math.min(1400, options.durationMs ?? 900));
  const startTs = performance.now();

  let rafId = 0;
  const tick = (now: number) => {
    const raw = (now - startTs) / durationMs;
    const t = clamp01(raw);
    const eased = easeOutCubic(t);

    const pos = cubicBezier(eased, p0, p1, p2, p3);
    const size = 44 - eased * 30; // shrink to minimal

    const opacity = t < 0.05 ? t / 0.05 : t > 0.85 ? (1 - t) / 0.15 : 1;
    const rotate = dx >= 0 ? eased * 12 : -eased * 12;

    node.style.opacity = String(opacity);
    node.style.transform = `translate(${pos.x - size / 2}px, ${pos.y - size / 2}px) rotate(${rotate}deg)`;
    node.style.width = `${size}px`;
    node.style.height = `${size}px`;

    if (t < 1) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      node.remove();
      window.cancelAnimationFrame(rafId);
    }
  };

  rafId = window.requestAnimationFrame(tick);
}
