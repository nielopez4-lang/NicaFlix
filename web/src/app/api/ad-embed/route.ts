import {
  DIRECT_LINK_URL,
  buildNativeAdSlotHtml,
  getInvokeScriptUrl,
  resolveZoneId,
} from "@/lib/monetag-config";

export const dynamic = "force-dynamic";

/** HTML embebible — banner nativo Monetag (MultiTag + invoke.js). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zoneId = resolveZoneId(searchParams.get("zone"));
  const minHeight = Math.max(
    90,
    Number.parseInt(searchParams.get("h") ?? "250", 10) || 250,
  );
  const invokeUrl = zoneId ? getInvokeScriptUrl(zoneId) : "";

  const body = zoneId
    ? buildNativeAdSlotHtml(zoneId, minHeight, invokeUrl)
    : `<!DOCTYPE html><html><body style="background:#0f0f14;min-height:${minHeight}px"></body></html>`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
