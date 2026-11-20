import "server-only";

export function getSupabaseConfiguration():
  | { configured: true; url: string; key: string }
  | { configured: false } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return { configured: false };
  if (!URL.canParse(url)) return { configured: false };

  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return { configured: false };
  }

  return { configured: true, url, key };
}
