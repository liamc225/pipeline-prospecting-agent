export interface DemoAccessValidationInput {
  host?: string | null;
  expectedToken?: string | null;
  providedToken?: string | null;
}

export interface DemoAccessError {
  error: string;
  status: number;
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function isLocalHost(host?: string | null): boolean {
  if (!host) return false;
  const normalized = host.split(":")[0].toLowerCase();
  return LOCAL_HOSTS.has(normalized);
}

export function validateDemoAccess({
  host,
  expectedToken,
  providedToken,
}: DemoAccessValidationInput): DemoAccessError | null {
  if (!expectedToken) {
    return isLocalHost(host)
      ? null
      : {
          status: 403,
          error:
            "Public demo access is disabled. Set DEMO_ACCESS_TOKEN and provide it with the request.",
        };
  }

  if (providedToken !== expectedToken) {
    return {
      status: 401,
      error: "Invalid demo token.",
    };
  }

  return null;
}
