import { gql } from "@apollo/client";
import { client } from "lib/graphql";
import Rapyd from "lib/rapyd";
import { NextApiRequest, NextApiResponse } from "next";

const checkout = async (
  req: NextApiRequest,
  res: NextApiResponse<{ id: string; sandbox: boolean }>
) => {
  const { id, country, currency, payment_category } = req.body;
  const payment = (
    await client.query({
      query: gql`
        query ($id: uuid!) {
          payments_by_pk(id: $id) {
            amount
            currency
            description
            account {
              access_key
              secret_key
              sandbox
              payment_methods_categories
            }
          }
        }
      `,
      variables: {
        id,
      },
    })
  ).data.payments_by_pk;
  const { data: checkout } = await new Rapyd(
    payment.account.access_key,
    payment.account.secret_key,
    payment.account.sandbox
  ).createCheckout({
    country,
    amount: payment.amount,
    currency: payment.currency,
    description: payment.description,
    ...(payment.currency !== currency
      ? {
          fixed_side: "buy",
          requested_currency: currency,
        }
      : {}),
    payment_method_type_categories: [payment_category],
    metadata: {
      payment_id: payment.id,
    },
  });
  res.json({ id: checkout.id, sandbox: payment.account.sandbox });
};

export default checkout;
