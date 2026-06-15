import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getBackendApiUrls } from "@/app/lib";

function isRetryableBackendError(error: unknown) {
  return error instanceof TypeError || (error instanceof Error && /fetch failed/i.test(error.message));
}

function isRetryableBackendStatus(status: number) {
  return status === 502 || status === 503 || status === 504;
}

const BACKEND_API_URLS = getBackendApiUrls();

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

async function proxyToBackend(request: NextRequest, context: RouteContext) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      {
        message: "Authentification requise.",
      },
      { status: 401 },
    );
  }

  const { path = [] } = await context.params;
  const search = request.nextUrl.search || "";
  const endpointPath = `/hr/${path.join("/")}${search}`;
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const contentType = request.headers.get("content-type");
  const rawBody =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  if (contentType && rawBody) {
    headers.set("Content-Type", contentType);
  }

  try {
    for (let index = 0; index < BACKEND_API_URLS.length; index += 1) {
      const targetUrl = `${BACKEND_API_URLS[index]}${endpointPath}`;
      console.info(`[API][proxy] ${request.method} ${endpointPath} -> ${targetUrl} (${index + 1}/${BACKEND_API_URLS.length})`);

      try {
        const upstream = await fetch(targetUrl, {
          method: request.method,
          headers,
          body: rawBody,
          cache: "no-store",
        });

        if (!upstream.ok && isRetryableBackendStatus(upstream.status) && index < BACKEND_API_URLS.length - 1) {
          console.warn(`[API][proxy] retry ${request.method} ${endpointPath} because status ${upstream.status} from ${targetUrl}`);
          continue;
        }

        const payload = await upstream.text();
        console.info(`[API][proxy] ${upstream.status} ${request.method} ${endpointPath} via ${targetUrl}`);

        return new NextResponse(payload || null, {
          status: upstream.status,
          headers: {
            "content-type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
          },
        });
      } catch (error) {
        if (index < BACKEND_API_URLS.length - 1 && isRetryableBackendError(error)) {
          console.warn(`[API][proxy] retry ${request.method} ${endpointPath} because network error at ${targetUrl}`, error);
          continue;
        }

        console.error(`[API][proxy] failed ${request.method} ${endpointPath} via ${targetUrl}`, error);
        throw error;
      }
    }
  } catch (error) {
    console.error("HR proxy request failed:", error);

    return NextResponse.json(
      {
        message: "Le backend RH est actuellement inaccessible.",
      },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context);
}
