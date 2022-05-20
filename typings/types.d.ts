import { NextPage } from "next";
import { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";

declare global {
  interface Window {
    RapydCheckoutToolkit: any;
  }
}

export type NextPageWithLayout<P = {}> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> &
  Pick<T, TRequired>;

interface RapydCountry {
  id: number;
  name: string;
  iso_alpha2: string;
  iso_alpha3: string;
  currency_code: string;
  currency_name: string;
  currency_sign: string;
  phone_code: string;
}

interface RapydCurrency {
  code: string;
  name: string;
  symbol: string;
  numeric_code: string;
  digits_after_decimal_separator: number;
}

interface RapydProduct {
  id: string;
  name: string;
  images: string[];
  type: "goods" | "services";
  metadata?: {
    [k: string]: any;
  };
  [k: string]: any;
}

interface RapydSKU {
  id: string;
  currency: string;
  inventory: {
    type: "finite" | "infinite" | "bucket";
    quantity?: number;
    value?: string;
  };
  price: number;
  product: string;
  metadata?: {
    [k: string]: any;
  };
  [k: string]: any;
}

interface RapydCheckout {
  id: string;
  amount: number;
  currency: string;
  country: string;
  description: string;
  payment_method_type_categories: string[];
  fixed_side: "sell" | "buy";
  requested_currency: string;
  metadata?: {
    [k: string]: any;
  };
  [k: string]: any;
}

interface RapydPaymentMethod {
  id: string;
  category: string;
  currencies: string[];
  [k: string]: any;
}
