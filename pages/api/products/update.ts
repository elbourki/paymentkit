import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/auth";
import Rapyd from "lib/rapyd";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.session.user?.account) return res.status(401).end();
    const { id, name, price, currency } = req.body;
    const rapyd = await Rapyd.forAccount(req.session.user.account.id);
    const { data: product } = await rapyd.updateProduct(id, {
      name,
    });
    await rapyd.updateSKU(product.skus[0].id, {
      currency,
      price,
    });
    res.status(200).send({});
  },
  sessionOptions
);
