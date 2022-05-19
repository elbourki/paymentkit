import { gql } from "@apollo/client";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/auth";
import { client } from "lib/graphql";
import { nanoid } from "lib/nanoid";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(
  async (req: NextApiRequest, res: NextApiResponse<{ id: string }>) => {
    if (!req.session.user?.account) return res.status(401).end();
    const { currency, amount, description, products } = req.body;
    const id = (
      await client.mutate({
        mutation: gql`
          mutation (
            $short_id: String
            $account_id: uuid
            $amount: numeric
            $currency: String
            $description: String
            $products: [products_insert_input!]!
          ) {
            insert_payments_one(
              object: {
                short_id: $short_id
                account_id: $account_id
                amount: $amount
                currency: $currency
                description: $description
                products: { data: $products }
              }
            ) {
              id
            }
          }
        `,
        variables: {
          short_id: nanoid(),
          account_id: req.session.user.account.id,
          currency: currency.code,
          amount,
          description,
          products: products || [],
        },
      })
    ).data.insert_payments_one.id;
    res.json({ id });
  },
  sessionOptions
);
