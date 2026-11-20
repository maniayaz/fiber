import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfiguration } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const configuration = getSupabaseConfiguration();
  if (!configuration.configured) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(configuration.url, configuration.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(`Could not refresh the Supabase session: ${error.message}`);
  }

  return response;
}

export const config = {
  matcher: "/admin/:path*",
};
