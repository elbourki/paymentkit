import GuestLayout from "components/layouts/guest";
import { NextPageWithLayout } from "typings/types";
import { GetServerSideProps } from "next";
import { gql } from "@apollo/client";
import { client } from "lib/graphql";
import { amount } from "lib/shared";
import pluralize from "pluralize";
import Image from "next/image";
import defaultProductImage from "public/assets/product-default-image.png";
import { RapydPayment } from "components/payments/rapyd";
import Link from "next/link";
import Script from "next/script";
import Head from "next/head";

const Pay: NextPageWithLayout<{ payment: any; country: string }> = ({
  payment,
  country,
}) => {
  const formatted = amount(payment.amount, payment.currency);

  return (
    <>
      <Head>
        <title>Pay {formatted}</title>
      </Head>
      <div className="bg-white w-full max-w-md border-2 border-gray-100 rounded-md">
        <div className="text-center border-b-2 border-gray-100 p-6">
          <h3 className="font-bold mb-2 text-2xl">{formatted}</h3>
          <p className="text-sm text-gray-500 font-medium">
            {payment.description ||
              `${payment.products.length} ${pluralize(
                "item",
                payment.products.length
              )}`}
          </p>
        </div>
        {payment.products.length ? (
          <div className="border-b-2 border-gray-100 p-6 flex flex-col gap-6">
            {payment.products.map((product: any) => (
              <div className="flex items-center gap-3" key={product.id}>
                <Image
                  className="rounded-md shrink-0"
                  src={product.image || defaultProductImage}
                  width={35}
                  height={35}
                  alt={product.name}
                />
                <h3 className="font-semibold flex-grow">{product.name}</h3>
                <span className="shrink-0  text-sm text-slate-700">
                  {product.quantity} x{" "}
                  {amount(product.amount, payment.currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <></>
        )}
        <div className="p-6">
          <RapydPayment
            payment_id={payment.id}
            payment_status={payment.status}
            default_country={country}
          />
        </div>
      </div>
      <Link href="/">
        <a className="font-medium text-xs text-slate-700" target="_blank">
          Powered by PaymentKit
        </a>
      </Link>
      <Script
        src={`https://${
          payment.account.sandbox ? "sandbox" : ""
        }checkouttoolkit.rapyd.net`}
      />
    </>
  );
};

Pay.getLayout = function getLayout(page) {
  return <GuestLayout col={true}>{page}</GuestLayout>;
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const country = req.headers["x-vercel-ip-country"] || "US";
  const payment = (
    await client.query({
      query: gql`
        query ($short_id: String = "") {
          payments(where: { short_id: { _eq: $short_id } }) {
            id
            description
            amount
            currency
            status
            products {
              id
              name
              image
              amount
              quantity
            }
            account {
              sandbox
            }
          }
        }
      `,
      variables: {
        short_id: params?.short_id,
      },
    })
  ).data.payments.at(0);
  if (!payment)
    return {
      notFound: true,
    };
  return {
    props: { payment, country },
  };
};

export default Pay;
