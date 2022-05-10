import { createHmac, randomBytes } from "node:crypto";
import fetchJson from "./fetch";

class Rapyd {
  constructor(
    private _access_key: string,
    private _secret_key: string,
    private _sandbox = false
  ) {}

  getCurrencies() {
    return this.request("/v1/data/currencies");
  }

  private request(
    path: string,
    init?: RequestInit & {
      json?: any;
    }
  ) {
    if (!init) init = {};
    const base_url = `https://${this._sandbox ? "sandbox" : ""}api.rapyd.net`;
    const method = init.method || "GET";
    const salt = randomBytes(8).toString("hex");
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.generateSignature(
      method,
      path,
      salt,
      timestamp,
      init.json || init.body || ""
    );
    init.headers = {
      ...(init.headers || {}),
      access_key: this._access_key,
      salt,
      timestamp,
      signature,
    };
    return fetchJson(base_url + path, init);
  }

  private generateSignature(
    method: string,
    path: string,
    salt: string,
    timestamp: string,
    body: any
  ): string {
    let body_string = "";
    if (body) {
      body_string = JSON.stringify(body);
      body_string = body_string == "{}" ? "" : body_string;
    }

    return this.hashSignature(
      method.toLowerCase() +
        path +
        salt +
        timestamp +
        this._access_key +
        this._secret_key +
        body_string,
      this._secret_key
    );
  }

  private hashSignature(signature: string, key: string): string {
    const hash = createHmac("sha256", key);
    hash.update(signature);
    const hashSignature = Buffer.from(hash.digest("hex")).toString("base64");

    return hashSignature;
  }
}

export default Rapyd;
