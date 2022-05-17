import { gql } from "@apollo/client";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/auth";
import { client } from "lib/graphql";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(
  async (req: NextApiRequest, res: NextApiResponse<{ id: string }>) => {
    if (!req.session.user?.account) return res.status(401).end();
    const { payment_methods_categories, default_currency, allow_tips } =
      req.body;
    const account = (
      await client.mutate({
        mutation: gql`
          mutation (
            $id: uuid!
            $payment_methods_categories: jsonb
            $default_currency: String
            $allow_tips: Boolean
          ) {
            update_accounts_by_pk(
              pk_columns: { id: $id }
              _set: {
                payment_methods_categories: $payment_methods_categories
                default_currency: $default_currency
                allow_tips: $allow_tips
              }
            ) {
              id
              payment_methods_categories
              default_currency
              allow_tips
            }
          }
        `,
        variables: {
          id: req.session.user.account.id,
          payment_methods_categories,
          default_currency,
          allow_tips,
        },
      })
    ).data.update_accounts_by_pk;
    req.session.user.account = account;
    await req.session.save();
    res.json(req.session.user);
  },
  sessionOptions
);
