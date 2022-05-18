import { gql } from "@apollo/client";
import { client } from "lib/graphql";
import Rapyd from "lib/rapyd";
import { NextApiRequest, NextApiResponse } from "next";

const checkout = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    [k: string]: string[];
  }>
) => {
  const { id, country, card } = req.body;
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
  let allowed_categories;
  if (card) allowed_categories = ["card"];
  else allowed_categories = payment.account.payment_methods_categories;
  const { data: methods } = await new Rapyd(
    payment.account.access_key,
    payment.account.secret_key,
    payment.account.sandbox
  ).getPaymentMethods({ country });
  let currencies: {
    [k: string]: Set<string>;
  } = {};
  for (let method of methods) {
    if (!allowed_categories.includes(method.category)) continue;
    for (let currency of method.currencies) {
      if (currency in currencies) currencies[currency].add(method.category);
      else currencies[currency] = new Set([method.category]);
    }
  }
  res.json(
    Object.fromEntries(
      Object.entries(currencies).map(([k, v]) => [k, Array.from(v)])
    )
  );
};

export default checkout;
