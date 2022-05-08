import type { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions, User } from "lib/auth";
import { magic } from "lib/magic";
import { client } from "lib/graphql";
import { gql } from "@apollo/client";
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
                }
              }
            }
          `,
          variables: {
            email: metadata.email,
          },
        })
      ).data.insert_users_one;
      const token = jwt.sign(
        {
          "https://hasura.io/jwt/claims": {
            "x-hasura-allowed-roles": ["user"],
            "x-hasura-default-role": "user",
            "x-hasura-user-id": user.id,
          },
        },
        process.env.HASURA_JWT_SECRET || ""
      );

      req.session.user = {
        token,
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
