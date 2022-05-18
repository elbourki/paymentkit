import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/auth";
import Rapyd from "lib/rapyd";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.session.user?.account) return res.status(401).end();
    const { id } = req.body;
    const rapyd = await Rapyd.forAccount(req.session.user.account.id);
    await rapyd.deleteProduct(id);
    res.status(200).send({});
  },
  sessionOptions
);
