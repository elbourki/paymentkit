import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/auth";
import Rapyd from "lib/rapyd";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.session.user?.account) return res.status(401).end();
    const { name, price, currency, image } = req.body;
    const rapyd = await Rapyd.forAccount(req.session.user.account.id);
    const { data: product } = await rapyd.createProduct({
      name,
      type: "goods",
      images: [image],
      metadata: {
        service: "paymentkit",
      },
    });
    await rapyd.createSKU({
      product: product.id,
      currency,
      price,
      inventory: {
        type: "infinite",
      },
    });
    res.status(200).send({});
  },
  sessionOptions
);
