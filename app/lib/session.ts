export interface UserSession {
    token: string;
    email: string;
    expiresAt?: string;
}

const TOKEN_KEY = 'streetriot_user_token';
const EMAIL_KEY = 'streetriot_user_email';
const EXPIRES_AT_KEY = 'streetriot_user_expires_at';
const CART_ID_KEY = 'streetriot_cart_id';
const CHECKOUT_PROMO_KEY = 'streetriot_checkout_promo';
const BROWSER_PROXY_BASE = '/api/backend';
export const USER_SESSION_CHANGED_EVENT = 'streetriot:user-session-changed';
/** Optional extra API origin (e.g. staging). Do not point at another product’s backend. */
const OPTIONAL_BACKEND_FALLBACK = String(
    process.env.NEXT_PUBLIC_BACKEND_FALLBACK || ''
).trim();

function normalizeBackendUrl(input: string) {
    let value = String(input || '').trim();
    if (!value) return '';

    // Allow same-origin proxy paths.
    if (value.startsWith('/')) {
        return value.replace(/\/$/, '');
    }

    // Common typo guard for Railway domain.
    value = value.replace(/\.railiway\.app/gi, '.railway.app');

    if (!/^https?:\/\//i.test(value)) {
        value = `https://${value}`;
    }

    return value.replace(/\/$/, '');
}

function isBrowser() {
    return typeof window !== 'undefined';
}

function notifyUserSessionChanged() {
    if (!isBrowser()) return;
    window.dispatchEvent(new Event(USER_SESSION_CHANGED_EVENT));
}

export function getBackendBaseUrl() {
    return getBackendBaseUrlCandidates()[0] || 'http://localhost:8080';
}

export function getBackendBaseUrlCandidates() {
    const configuredRaw = String(process.env.NEXT_PUBLIC_BACKEND_URL || '').trim();
    const configured = normalizeBackendUrl(configuredRaw);
    const typoFixedFromRaw = normalizeBackendUrl(configuredRaw.replace(/\.railiway\.app/gi, '.railway.app'));
    const list: string[] = [];

    // In browsers, prefer same-origin proxy to avoid cross-origin failures.
    if (isBrowser()) {
        list.push(BROWSER_PROXY_BASE);
    }

    if (configured) list.push(configured);
    if (typoFixedFromRaw && !list.includes(typoFixedFromRaw)) list.push(typoFixedFromRaw);

    const optionalFb = normalizeBackendUrl(OPTIONAL_BACKEND_FALLBACK);
    if (optionalFb && !list.includes(optionalFb)) list.push(optionalFb);

    if (process.env.NODE_ENV !== 'production') {
        if (!list.includes('http://localhost:8080')) list.push('http://localhost:8080');
    }

    if (!list.length) list.push('http://localhost:8080');
    return list;
}

export function getUserSession(): UserSession | null {
    if (!isBrowser()) return null;
    const token = window.localStorage.getItem(TOKEN_KEY) || '';
    const email = window.localStorage.getItem(EMAIL_KEY) || '';
    const expiresAt = window.localStorage.getItem(EXPIRES_AT_KEY) || '';
    if (!token || !email) return null;

    if (expiresAt) {
        const expiryMs = Date.parse(expiresAt);
        if (Number.isFinite(expiryMs) && expiryMs <= Date.now()) {
            clearUserSession();
            return null;
        }
    }

    return expiresAt ? { token, email, expiresAt } : { token, email };
}

export function setUserSession(session: UserSession) {
    if (!isBrowser()) return;
    window.localStorage.setItem(TOKEN_KEY, session.token);
    window.localStorage.setItem(EMAIL_KEY, session.email);
    if (session.expiresAt) {
        window.localStorage.setItem(EXPIRES_AT_KEY, session.expiresAt);
    } else {
        window.localStorage.removeItem(EXPIRES_AT_KEY);
    }
    notifyUserSessionChanged();
}

export function clearUserSession() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(EMAIL_KEY);
    window.localStorage.removeItem(EXPIRES_AT_KEY);
    notifyUserSessionChanged();
}

export function getUserEmail() {
    return getUserSession()?.email || '';
}

export function getUserToken() {
    return getUserSession()?.token || '';
}

export function getCartId() {
    if (!isBrowser()) return '';
    return window.localStorage.getItem(CART_ID_KEY) || '';
}

export function setCartId(cartId: string) {
    if (!isBrowser()) return;
    if (!cartId) {
        window.localStorage.removeItem(CART_ID_KEY);
        return;
    }
    window.localStorage.setItem(CART_ID_KEY, cartId);
}

export interface CheckoutPromoState {
    code: string;
    discountAmount: number;
    description: string;
}

export function getCheckoutPromoState(): CheckoutPromoState | null {
    if (!isBrowser()) return null;
    try {
        const raw = window.localStorage.getItem(CHECKOUT_PROMO_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<CheckoutPromoState>;
        const code = String(parsed?.code || '').trim().toUpperCase();
        if (!code) return null;
        return {
            code,
            discountAmount: Number(parsed?.discountAmount || 0),
            description: String(parsed?.description || ''),
        };
    } catch {
        return null;
    }
}

export function setCheckoutPromoState(state: CheckoutPromoState | null) {
    if (!isBrowser()) return;
    if (!state || !state.code) {
        window.localStorage.removeItem(CHECKOUT_PROMO_KEY);
        return;
    }
    window.localStorage.setItem(
        CHECKOUT_PROMO_KEY,
        JSON.stringify({
            code: String(state.code || '').trim().toUpperCase(),
            discountAmount: Number(state.discountAmount || 0),
            description: String(state.description || ''),
        }),
    );
}

export function clearCheckoutPromoState() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(CHECKOUT_PROMO_KEY);
}
