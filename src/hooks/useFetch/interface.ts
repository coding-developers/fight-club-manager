export interface Options {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  body?: Record<string, unknown> | FormData;
  params?: Record<string, unknown>;
}

export interface FetchResponse<T> {
  data: T;
  message: string | null;
}
