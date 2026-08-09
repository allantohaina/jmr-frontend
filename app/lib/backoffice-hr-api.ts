type HrApiResponse<T = unknown> = {
  status?: "success" | "error";
  message?: string;
  data: T;
};

type RequestBody = Record<string, unknown> | FormData;

const DEFAULT_BACKEND_API_URL = "https://api.jmrtextile.com/api";

function getBackendApiUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_API_URL).replace(/\/+$/, "");
}

function readMessage(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  return undefined;
}

function toBody(body?: RequestBody) {
  if (!body) {
    return undefined;
  }

  return body instanceof FormData ? body : JSON.stringify(body);
}

function getRuntimeLabel() {
  return typeof window === "undefined" ? "server" : "browser";
}

function logRequest(runtime: string, method: string, path: string, attempt: number, total: number) {
  console.info(`[HR API][${runtime}] ${method} ${path} (${attempt}/${total})`);
}

function logSuccess(runtime: string, method: string, path: string, status: number) {
  console.info(`[HR API][${runtime}] ${status} ${method} ${path}`);
}

function logFailure(runtime: string, method: string, path: string, error: unknown) {
  console.error(`[HR API][${runtime}] failed ${method} ${path}`, error);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<HrApiResponse<T>> {
  const headers = new Headers(init.headers);
  const isFormData = init.body instanceof FormData;
  const runtime = getRuntimeLabel();
  const method = (init.method ?? "GET").toString().toUpperCase();
  const targetPath = `/hr${path}`;
  const targetUrl = `${getBackendApiUrl()}${targetPath}`;
  const token = typeof window === "undefined" ? null : localStorage.getItem("jmr_token");

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  logRequest(runtime, method, targetUrl, 1, 1);

  try {
    const response = await fetch(targetUrl, {
      ...init,
      headers,
      cache: "no-store",
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      throw new Error(`Reponse invalide du serveur (${response.status})`);
    }

    if (!response.ok) {
      throw new Error(readMessage(payload) || "Une erreur est survenue.");
    }

    logSuccess(runtime, method, targetPath, response.status);

    if (payload && typeof payload === "object" && "data" in payload) {
      return payload as HrApiResponse<T>;
    }

    return {
      status: "success",
      data: payload as T,
    };
  } catch (error) {
    logFailure(runtime, method, targetPath, error);
    throw error;
  }
}

export const backofficeHrAPI = {
  get: async <T>(path: string) =>
    request<T>(path, {
      method: "GET",
    }),
  post: async <T>(path: string, body: RequestBody) =>
    request<T>(path, {
      method: "POST",
      body: toBody(body),
    }),
};
