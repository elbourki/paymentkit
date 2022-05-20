import type { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions, User } from "lib/auth";
import { magic } from "lib/magic";
import { client, hasura_jwt } from "lib/graphql";
import { gql } from "@apollo/client";
import { knock } from "lib/knock";
import jwt from "jsonwebtoken";

export default withIronSessionApiRoute(
  async (
    req: NextApiRequest,
    res: NextApiResponse<User | { message: string }>
  ) => {
    try {
      const didToken = magic.utils.parseAuthorizationHeader(
        req.headers.authorization || ""
      );
      magic.token.validate(didToken);
      const metadata = await magic.users.getMetadataByToken(didToken);
      const user = (
        await client.mutate({
          mutation: gql`
            mutation ($email: String) {
              insert_users_one(
                object: { email: $email }
                on_conflict: {
                  constraint: users_email_key
                  update_columns: email
                }
              ) {
                id
                email
                account {
                  id
                  payment_methods_categories
                  default_currency
                  allow_tips
                  sandbox
                }
              }
            }
          `,
          variables: {
            email: metadata.email,
          },
        })
      ).data.insert_users_one;
      const hasura_token = hasura_jwt(user.id, user.account?.id);
      await knock.users.identify(user.id, {
        email: user.email,
      });
      const current_time = Math.floor(Date.now() / 1000);
      const knock_token = jwt.sign(
        {
          sub: user.id,
          iat: current_time,
          exp: current_time + 60 * 60,
        },
        (process.env.KNOCK_SIGNING_KEY || "").replaceAll("\\n", "\n"),
        {
          algorithm: "RS256",
        }
      );
      req.session.user = {
        hasura_token,
        knock_token,
        id: user.id,
        email: user.email,
        account: user.account,
      };
      await req.session.save();
      res.json(req.session.user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },
  sessionOptions
);
