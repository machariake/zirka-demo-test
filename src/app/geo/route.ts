/**
 * The visitor's country, as a two-letter code, for the language suggestion.
 *
 * Read from the header the host adds (Vercel, or Cloudflare in front of it);
 * no lookup service and nothing stored. Only ever fetched by a browser that is
 * set to English and has not already chosen a language.
 */
export async function GET(request: Request) {
  const raw = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "";
  const country = raw.trim().toUpperCase();
  return Response.json(
    { country: /^[A-Z]{2}$/.test(country) ? country : null },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
