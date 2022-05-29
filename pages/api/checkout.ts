import { gql } from "@apollo/client";
import { client } from "lib/graphql";
import Rapyd from "lib/rapyd";
import { NextApiRequest, NextApiResponse } from "next";

const checkout = async (
  req: NextApiRequest,
  res: NextApiResponse<{ id: string; sandbox: boolean }>
) => {
  const { id, country, currency, payment_category, tip } = req.body;
  const payment = (
    await client.query({
      query: gql`
        query ($id: uuid!) {
          payments_by_pk(id: $id) {
            id
            short_id
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
  let tip_amount = 0;
  if (tip && tip > 0 && tip <= 100)
    tip_amount = (parseInt(tip) / 100) * payment.amount;
  const redirect_url = `${process.env.NEXT_PUBLIC_SHORT_URL}/${payment.short_id}`;
  const { data: checkout } = await new Rapyd(
    payment.account.access_key,
    payment.account.secret_key,
    payment.account.sandbox
  ).createCheckout({
    country,
    amount: payment.amount + tip_amount,
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
      tip_amount,
    },
    cancel_checkout_url: redirect_url,
    complete_checkout_url: redirect_url,
  });
  res.json({ id: checkout.id, sandbox: payment.account.sandbox });
};

export default checkout;
