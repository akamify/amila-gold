/**
 * Wholesale WhatsApp: set digits-only or E.164 in env (exposed to browser).
 * Example: NEXT_PUBLIC_WHOLESALE_WHATSAPP=919876543210
 */
export function getWholesaleWhatsAppUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_WHOLESALE_WHATSAPP ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "919120868474";
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "#";

  const text =
    process.env.NEXT_PUBLIC_WHOLESALE_WHATSAPP_MESSAGE?.trim() ||
    "Hello, I would like to inquire about Amila Gold jaggery wholesale.";
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}
