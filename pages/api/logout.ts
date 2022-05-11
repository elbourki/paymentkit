import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(
  async (req: NextApiRequest, res: NextApiResponse) => {
    req.session.destroy();
    res.status(200).send({});
  },
  sessionOptions
);
