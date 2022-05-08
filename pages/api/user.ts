import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions, User } from "lib/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(
  async (req: NextApiRequest, res: NextApiResponse<User | {}>) => {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.json({});
    }
  },
  sessionOptions
);
