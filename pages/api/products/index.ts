import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "lib/auth";
import { RapydProduct } from "typings/types";
import Rapyd from "lib/rapyd";

export default withIronSessionApiRoute(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.session.user?.account) return res.status(401).end();
    const rapyd = await Rapyd.forAccount(req.session.user.account.id);
    let products: RapydProduct[] = [];
    while (true) {
      const data = (
        await rapyd.getProducts({
          limit: 100,
          ending_before: products.at(-1)?.id,
        })
      ).data;
      products = [...products, ...data];
      if (data.length < 100 || data.length === 0) break;
    }
    res.json(
      products.filter((product) => product.metadata?.service === "paymentkit")
    );
  },
  sessionOptions
);
