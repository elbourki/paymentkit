import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import jwt from "jsonwebtoken";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: `https://${process.env.NEXT_PUBLIC_HASURA_INSTANCE}/v1/graphql`,
    headers: {
      "X-Hasura-Admin-Secret": process.env.HASURA_ADMIN_SECRET,
    },
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
      errorPolicy: "ignore",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});

export const hasura_jwt = (user_id: string, account_id?: string) =>
  jwt.sign(
    {
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": ["user"],
        "x-hasura-default-role": "user",
        "x-hasura-user-id": user_id,
        "x-hasura-account-id": account_id,
      },
    },
    process.env.HASURA_JWT_SECRET || ""
  );
