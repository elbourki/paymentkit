import { gql } from "@apollo/client";
import { createHmac, randomBytes } from "node:crypto";
import {
  OptionalExceptFor,
  RapydCheckout,
  RapydCountry,
  RapydCurrency,
  RapydProduct,
  RapydSKU,
} from "typings/types";
import fetchJson from "./fetch";
import { client } from "./graphql";

interface Response<T> {
  status: {
    error_code: string;
    status: string;
    message: string;
    response_code: string;
    operation_id: string;
  };
  data: T;
}

class Rapyd {
  constructor(
    private _access_key: string,
    private _secret_key: string,
    private _sandbox = false
  ) {}

  getCurrencies() {
    return this.request<Response<RapydCurrency[]>>("/v1/data/currencies");
  }

  getCountries() {
    return this.request<Response<RapydCountry[]>>("/v1/data/countries");
  }

  getPaymentMethods(params: {
    country: string;
    currency?: string;
    [k: string]: any;
  }) {
    const query = new URLSearchParams();
    for (let param in params) {
      if (params[param]) query.append(param, params[param]);
    }
    return this.request<Response<any[]>>(
      `/v1/payment_methods/country?${query.toString()}`
    );
  }

  createCheckout(
    params: OptionalExceptFor<RapydCheckout, "country" | "currency">
  ) {
    return this.request<Response<RapydCheckout>>("/v1/checkout", {
      method: "POST",
      json: params,
    });
  }

  getCheckout(id: string) {
    return this.request<Response<RapydCheckout>>(`/v1/checkout/${id}`);
  }

  getProducts(
    params: {
      limit?: number;
      ending_before?: string;
      starting_after?: string;
      [k: string]: any;
    } = {}
  ) {
    const query = new URLSearchParams();
    for (let param in params) {
      if (params[param]) query.append(param, params[param]);
    }
    return this.request<Response<RapydProduct[]>>(
      `/v1/products?${query.toString()}`
    );
  }

  getProduct(id: string) {
    return this.request<Response<RapydProduct>>(`/v1/products/${id}`);
  }

  createProduct(params: OptionalExceptFor<RapydProduct, "type" | "name">) {
    return this.request<Response<RapydProduct>>("/v1/products", {
      method: "POST",
      json: params,
    });
  }

  updateProduct(id: string, params: Pick<RapydProduct, "name" | "metadata">) {
    return this.request<Response<RapydProduct>>(`/v1/products/${id}`, {
      method: "POST",
      json: params,
    });
  }

  deleteProduct(id: string) {
    return this.request<Response<Pick<RapydProduct, "id">>>(
      `/v1/products/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  createSKU(
    params: OptionalExceptFor<
      RapydSKU,
      "currency" | "inventory" | "price" | "product"
    >
  ) {
    return this.request<Response<RapydSKU>>("/v1/skus", {
      method: "POST",
      json: params,
    });
  }

  updateSKU(id: string, params: Pick<RapydProduct, "currency" | "price">) {
    return this.request<Response<RapydProduct>>(`/v1/skus/${id}`, {
      method: "POST",
      json: params,
    });
  }

  private request<T>(
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
    return fetchJson<T>(base_url + path, init);
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

  static async forAccount(account_id: string) {
    const account = (
      await client.query({
        query: gql`
          query ($id: uuid!) {
            accounts_by_pk(id: $id) {
              access_key
              secret_key
              sandbox
            }
          }
        `,
        variables: {
          id: account_id,
        },
      })
    ).data.accounts_by_pk;
    return new this(account.access_key, account.secret_key, account.sandbox);
  }
}

export default Rapyd;
