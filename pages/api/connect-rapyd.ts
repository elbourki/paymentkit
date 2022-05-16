import { gql } from "@apollo/client";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions, User } from "lib/auth";
import { client } from "lib/graphql";
import Rapyd from "lib/rapyd";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(
  async (
    req: NextApiRequest,
    res: NextApiResponse<User | { message: string }>
  ) => {
    if (!req.session.user || req.session.user.account)
      return res.status(401).end();
    try {
      await new Rapyd(
        req.body.access_key,
        req.body.secret_key,
        req.body.sandbox
      ).getCurrencies();
      const account = (
        await client.mutate({
          mutation: gql`
            mutation (
              $access_key: String
              $secret_key: String
              $sandbox: Boolean
            ) {
              insert_accounts_one(
                object: {
                  access_key: $access_key
                  secret_key: $secret_key
                  sandbox: $sandbox
                }
              ) {
                id
              }
            }
          `,
          variables: req.body,
        })
      ).data.insert_accounts_one;
      await client.mutate({
        mutation: gql`
          mutation ($id: uuid!, $account_id: uuid!) {
            update_users_by_pk(
              pk_columns: { id: $id }
              _set: { account_id: $account_id }
            ) {
              id
            }
          }
        `,
        variables: { id: req.session.user.id, account_id: account.id },
      });
      req.session.user.account = account;
      await req.session.save();
      res.json(req.session.user);
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ message: "Please check your credentials and try again" });
    }
  },
  sessionOptions
);
