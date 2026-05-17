const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export type ApiError = {
  message: string;
  statusCode: number;
};

export type AuthTokens = {
  access_token: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export type ShortUrl = {
  id: string;
  shortcode: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  status: "Active" | "Expired";
  createdAt: string;
  expiresAt: string;
};

export type UrlAnalytics = {
  totalClicks: number;
  todayClicks: number;
  topCountries: { country: string | null; clicks: number }[];
};

export type UserOverview = {
  totalUrls: number;
  activeUrls: number;
  expiredUrl: number;
  totalClicks: number;
};

export type AdminOverview = {
  totalUsers: number;
  totalUrls: number;
  totalClicks: number;
  usersToday: number;
  urlsToday: number;
  clicksToday: number;
};

export type Pagination = {
  page: number;
  limit: number;
  totalUrls?: number;
  totalPages?: number;
  totalPage?: number;
};

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    credentials: "include", // for refresh token cookie
  });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      errMsg = errBody.message || errMsg;
    } catch {}
    throw { message: errMsg, statusCode: res.status } as ApiError;
  }

  // Handle empty response (204, 200 with no body)
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string,
): Promise<AuthTokens> {
  return request<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(token: string): Promise<void> {
  return request("/auth/logout", { method: "POST", token });
}

export async function refreshToken(): Promise<
  AuthTokens & { refresh_token: string }
> {
  return request("/auth/refresh", { method: "POST" });
}

// ─── User ────────────────────────────────────────────────────────────────────

export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  return request<User>("/user/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getUserById(id: string, token: string): Promise<User> {
  return request<User>(`/user/${id}`, { token });
}

export async function changePassword(
  id: string,
  data: { password: string; newPassword: string },
  token: string,
): Promise<User> {
  return request<User>(`/user/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteAccount(id: string, token: string): Promise<void> {
  return request(`/user/${id}`, { method: "DELETE", token });
}

// ─── URL ─────────────────────────────────────────────────────────────────────

export async function createShortUrl(
  originalUrl: string,
  expiresAt: string,
  token: string,
): Promise<{ data: string }> {
  return request<{ data: string }>("/url", {
    method: "POST",
    body: JSON.stringify({ originalUrl, expiresAt }),
    token,
  });
}

export async function deleteUrl(id: string, token: string): Promise<void> {
  return request(`/url/${id}`, { method: "DELETE", token });
}

export async function extendUrl(
  id: string,
  token: string,
): Promise<{ msg: string; data: unknown }> {
  return request(`/url/extend/${id}`, { method: "PATCH", token });
}

export async function regenerateUrl(
  id: string,
  token: string,
): Promise<{ msg: string; data: unknown }> {
  return request(`/url/regenerate/${id}`, { method: "PATCH", token });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getUserOverview(token: string): Promise<UserOverview> {
  return request<UserOverview>("/dashboard/user/overview", { token });
}

export async function getUserUrls(
  page: number,
  limit: number,
  token: string,
): Promise<{ data: ShortUrl[]; pagination: Pagination }> {
  return request(`/dashboard/user/urls?page=${page}&limit=${limit}`, { token });
}

export async function getUrlAnalytics(
  id: string,
  token: string,
): Promise<UrlAnalytics> {
  return request<UrlAnalytics>(`/dashboard/user/${id}`, { token });
}

export async function getAdminOverview(token: string): Promise<AdminOverview> {
  return request<AdminOverview>("/dashboard/admin/overview", { token });
}

export async function getAdminUsers(
  page: number,
  limit: number,
  token: string,
): Promise<{ data: User[]; pagination: { page: number; totalPage: number } }> {
  return request(`/dashboard/admin/users?page=${page}&limit=${limit}`, {
    token,
  });
}
