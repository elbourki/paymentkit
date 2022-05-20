import { gql, useSubscription } from "@apollo/client";
import AppLayout from "components/layouts/app";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "typings/types";
import MajesticonsArrowLeftLine from "~icons/majesticons/arrow-left-line";
import payment_methods_categories from "lib/data/payment_methods_categories.json";
import defaultProductImage from "public/assets/product-default-image.png";
import { amount } from "lib/shared";
import Link from "next/link";
import Image from "next/image";

const statuses: { [k: string]: string } = {
  unpaid: "Unpaid",
  paid: "Paid",
  pending: "Pending",
};

const Collect: NextPageWithLayout = () => {
  const {
    query: { id },
  } = useRouter();
  const { loading, data, error } = useSubscription(
    gql`
      subscription ($id: uuid!) {
        payments_by_pk(id: $id) {
          id
          amount
          currency
          description
          products {
            id
            name
            image
            amount
            quantity
          }
          paid_via
          tip_amount
          status
          created_at
        }
      }
    `,
    {
      variables: {
        id,
      },
    }
  );

  if (loading)
    return (
      <div className="flex justify-center items-center flex-col flex-grow">
        <div className="animate-spin spinner" />
        <h3 className="mt-4 text-sm font-semibold">Loading...</h3>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center flex-col flex-grow">
        <h3 className="mt-4 text-sm font-semibold">Something went wrong</h3>
      </div>
    );

  const payment = data.payments_by_pk;

  return (
    <div className="p-6 flex-grow flex flex-col gap-6 max-w-md self-center w-full">
      <div>
        <Link href="/app/payments">
          <a className="flex gap-2 items-center mb-2 text-sm font-medium">
            <MajesticonsArrowLeftLine />
            Back
          </a>
        </Link>
        <h1 className="font-bold text-2xl">
          {amount(payment.amount, payment.currency)}
        </h1>
      </div>
      <div className="border-2 rounded-md divide-y-2">
        {payment.description && (
          <div className="flex justify-between text-sm font-medium p-3">
            <span>Description</span>
            <span>{payment.description}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-medium p-3">
          <span>Created</span>
          <span>
            {new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }).format(new Date(payment.created_at))}
          </span>
        </div>
        <div className="flex justify-between text-sm font-medium p-3">
          <span>Status</span>
          <span>{statuses[payment.status]}</span>
        </div>
        {payment.paid_via && (
          <div className="flex justify-between text-sm font-medium p-3">
            <span>Paid via</span>
            <span>
              {payment_methods_categories.find(
                ({ value }) => value === payment.paid_via
              )?.label || "Manual payment"}
            </span>
          </div>
        )}
        {payment.tip_amount ? (
          <div className="flex justify-between text-sm font-medium p-3">
            <span>Tip amount</span>
            <span>{amount(payment.tip_amount, payment.currency)}</span>
          </div>
        ) : null}
      </div>
      {payment.products.length ? (
        <div className="border-2 rounded-md flex flex-col divide-y-2">
          <div className="p-3 text-sm font-medium">Products</div>
          {payment.products.map((product: any) => (
            <div className="flex items-center gap-3 p-3" key={product.id}>
              <Image
                className="rounded-md shrink-0"
                src={product.image || defaultProductImage}
                width={30}
                height={30}
                alt={product.name}
              />
              <h3 className="font-semibold text-sm flex-grow">
                {product.name}
              </h3>
              <span className="shrink-0 text-sm text-slate-700">
                {product.quantity} x {amount(product.amount, payment.currency)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}
      {payment.status === "unpaid" && (
        <Link href={`/app/payments/${payment.id}/collect`}>
          <button className="btn mt-auto">Collect payment</button>
        </Link>
      )}
    </div>
  );
};

Collect.getLayout = function getLayout(page) {
  return <AppLayout>{page}</AppLayout>;
};

export default Collect;
