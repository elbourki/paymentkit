import { gql } from "@apollo/client";
import { client } from "lib/graphql";
import Rapyd from "lib/rapyd";
import { NextApiRequest, NextApiResponse } from "next";

const checkout = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    id: string;
    status: string;
    complete_payment_url: string;
  }>
) => {
  const { id, checkoutId, card } = req.body;
  const payment = (
    await client.query({
      query: gql`
        query ($id: uuid!) {
          payments_by_pk(id: $id) {
            account {
              access_key
              secret_key
              sandbox
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
  ).getCheckout(checkoutId);
  if (
    checkout.metadata?.payment_id !== id &&
    !["CLO", "ACT"].includes(checkout.payment.status)
  )
    return res.status(400).end();
  const status = checkout.payment.status === "CLO" ? "paid" : "pending";
  await client.mutate({
    mutation: gql`
      mutation ($id: uuid!, $paid_via: String) {
        update_payments_by_pk(
          pk_columns: { id: $id }
          _set: { status: "paid", paid_via: $paid_via }
        ) {
          id
        }
      }
    `,
    variables: {
      id,
      status,
      paid_via: card ? "manual" : checkout.payment.payment_method_type_category,
    },
  });
  res.json({
    id,
    status,
    complete_payment_url: checkout.payment.complete_payment_url,
  });
};

export default checkout;
