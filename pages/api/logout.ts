import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/auth";
import { magic } from "lib/magic";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.session.user)
      await magic.users.logoutByToken(req.session.user.token);
    req.session.destroy();
    res.status(200).send(null);
  },
  sessionOptions
);
