export default async function fetchJson<JSON = unknown>(
  input: RequestInfo,
  init?: RequestInit & {
    json?: any;
  }
): Promise<JSON> {
  if (init?.json) {
    init.body = JSON.stringify(init.json);
    init.headers = { ...init.headers, "Content-Type": "application/json" };
  }
  const response = await fetch(input, init);
  const data = await response.json();

  if (response.ok) return data;

  console.error(data);
  throw new FetchError({
    message: response.statusText,
    response,
    data,
  });
}

export class FetchError extends Error {
  response: Response;
  data: {
    message: string;
  };
  constructor({
    message,
    response,
    data,
  }: {
    message: string;
    response: Response;
    data: {
      message: string;
    };
  }) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError);
    }

    this.name = "FetchError";
    this.response = response;
    this.data = data ?? { message: message };
  }
}
