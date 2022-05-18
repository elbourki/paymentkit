import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/auth";
import Rapyd from "lib/rapyd";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.session.user?.account) return res.status(401).end();
    const rapyd = await Rapyd.forAccount(req.session.user.account.id);
    const products = (
      await rapyd.getProducts({
        limit: 100,
      })
    ).data.filter((product) => product.metadata?.service === "paymentkit");
    res.json(products);
  },
  sessionOptions
);
