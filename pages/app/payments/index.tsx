import { useSubscription, gql } from "@apollo/client";
import { NextPageWithLayout } from "typings/types";
import AppLayout from "components/layouts/app";
import MajesticonsInboxLine from "~icons/majesticons/inbox-line";
import { amount, icon_mapping } from "lib/shared";
import Link from "next/link";
import pluralize from "pluralize";

const Payment: React.FC<{
  payment: any;
}> = ({ payment }) => {
  const Icon = icon_mapping[payment.paid_via] || icon_mapping["unpaid"];
  const products_count = payment.products_aggregate.aggregate.count;

  return (
    <Link href={`/app/payments/${payment.id}`}>
      <a>
        <div className="border-2 p-3 rounded-md flex items-center gap-3">
          <span className="bg-gray-100 rounded-full p-2.5">
            <Icon fontSize={18} />
          </span>
          <div className="flex-grow">
            <h4 className="text-sm font-medium">
              {payment.description ||
                `${products_count} ${pluralize("item", products_count)}`}
            </h4>
            <span className="text-xs">
              {new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }).format(new Date(payment.created_at))}
            </span>
          </div>
          <span className="font-bold text-sm">
            {amount(payment.amount, payment.currency)}
          </span>
        </div>
      </a>
    </Link>
  );
};

const Payments: NextPageWithLayout = () => {
  const { loading, error, data } = useSubscription(
    gql`
      subscription {
        payments(order_by: { created_at: desc }) {
          id
          amount
          currency
          description
          products_aggregate {
            aggregate {
              count
            }
          }
          paid_via
          status
          created_at
        }
      }
    `
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

  const payments = data.payments;

  return (
    <div className="p-6 flex-grow flex flex-col gap-6 max-w-md self-center w-full relative">
      <div className="font-semibold flex justify-between items-center">
        <h1 className="text-lg">Payments</h1>
        <Link href="/app/payments/new">
          <a className="text-sm border-2 py-1 px-3 rounded-md">New payment</a>
        </Link>
      </div>
      {payments.length ? (
        payments.map((payment: any) => (
          <Payment key={payment.id} payment={payment} />
        ))
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <MajesticonsInboxLine fontSize={30} />
          <span className="mt-4 text-sm font-semibold">
            You haven&apos;t requested any payments yet
          </span>
        </div>
      )}
    </div>
  );
};

Payments.getLayout = function getLayout(page) {
  return <AppLayout>{page}</AppLayout>;
};

export default Payments;
