export type ApiError =
  | { kind: "http"; status: number }
  | { kind: "network" }
  | { kind: "timeout" }
  | { kind: "parse" };

export type ApiResult<T> =
  { ok: true; data: T } | { ok: false; error: ApiError };
