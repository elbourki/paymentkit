import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

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
