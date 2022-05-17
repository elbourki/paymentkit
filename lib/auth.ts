import { IronSessionOptions } from "iron-session";
import Router from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

export type User = {
  hasura_token: string;
  knock_token: string;
  id: string;
  email: string;
  account: null | {
    id: string;
    payment_methods_categories: string[];
    default_currency: string;
    allow_tips: boolean;
  };
};

declare module "iron-session" {
  interface IronSessionData {
    user?: User;
  }
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "paymentkit-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
} = {}) {
  const { data: user, mutate: mutateUser } = useSWR<User>("/api/user");

  useEffect(() => {
    if (!redirectTo || !user) return;

    if (
      (redirectTo && !redirectIfFound && !user.id) ||
      (redirectIfFound && user.id)
    )
      Router.push(redirectTo);
  }, [user, redirectIfFound, redirectTo]);

  return { user, mutateUser };
}
