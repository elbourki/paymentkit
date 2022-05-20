import defaultProductImage from "public/assets/product-default-image.png";
import MajesticonsInboxLine from "~icons/majesticons/inbox-line";
import { NextPageWithLayout, RapydProduct } from "typings/types";
import { gql, useSubscription } from "@apollo/client";
import { amount, icon_mapping } from "lib/shared";
import AppLayout from "components/layouts/app";
import pluralize from "pluralize";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

const Payment: React.FC<{
  payment: any;
}> = ({ payment }) => {
  const Icon = icon_mapping[payment.paid_via] || icon_mapping["unpaid"];
  const products_count = payment.products_aggregate.aggregate.count;

  return (
    <Link href={`/app/payments/${payment.id}`}>
      <a className="p-3 flex items-center gap-3">
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
      </a>
    </Link>
  );
};

const Product: React.FC<{
  product: RapydProduct;
}> = ({ product }) => {
  const sku = product.skus.at(0);

  return (
    <div className="p-3 flex items-center gap-3">
      <Image
        className="rounded-md shrink-0"
        src={product.images[0] || defaultProductImage}
        width={41.6}
        height={41.6}
        alt={product.name}
      />
      <div className="flex-grow">
        <h4 className="text-sm font-medium">{product.name}</h4>
        <span className="text-xs">{product.sales} sold</span>
      </div>
      <span className="font-bold text-sm">
        {amount(sku.price, sku.currency)}
      </span>
    </div>
  );
};

const App: NextPageWithLayout = () => {
  const { data: products } = useSWR<RapydProduct[]>("/api/products");
  const {
    loading: paymentsLoading,
    data: paymentsData,
    error: paymentsError,
  } = useSubscription(
    gql`
      subscription {
        payments(order_by: { created_at: desc }, limit: 8) {
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
  const {
    loading: salesLoading,
    data: salesData,
    error: salesError,
  } = useSubscription(
    gql`
      subscription {
        product_sales {
          product_id
          quantity
        }
      }
    `
  );
  const currentHour = new Date().getHours();

  if (!products || paymentsLoading || salesLoading)
    return (
      <div className="flex justify-center items-center flex-col flex-grow">
        <div className="animate-spin spinner" />
        <h3 className="mt-4 text-sm font-semibold">Loading...</h3>
      </div>
    );

  if (paymentsError || salesError)
    return (
      <div className="flex justify-center items-center flex-col flex-grow">
        <h3 className="mt-4 text-sm font-semibold">Something went wrong</h3>
      </div>
    );

  const payments = paymentsData.payments;
  const sales = salesData.product_sales;
  const top_products = products
    .map((product) => ({
      ...product,
      sales: sales.find((s: any) => s.product_id === product.id)?.quantity || 0,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 8);

  return (
    <div className="p-6 w-full max-w-5xl self-center">
      <div className="font-semibold flex justify-between items-center mb-6">
        <h1 className="text-lg">
          {currentHour < 12 && currentHour > 4
            ? "Good morning"
            : currentHour < 17 && currentHour > 12
            ? "Good afternoon"
            : "Good evening"}
        </h1>
        <Link href="/app/payments/new">
          <a className="text-sm border-2 py-1 px-3 rounded-md">New payment</a>
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex flex-col border-2 rounded-md divide-y-2 min-h-[500px] w-full">
          <div className="p-3 text-sm font-medium">Recent payments</div>
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
        <div className="flex flex-col border-2 rounded-md divide-y-2 min-h-[500px] w-full">
          <div className="p-3 text-sm font-medium">Top products</div>
          {top_products.length ? (
            top_products.map((product: any) => (
              <Product key={product.id} product={product} />
            ))
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-3">
              <MajesticonsInboxLine fontSize={30} />
              <span className="mt-4 text-sm font-semibold">
                You haven&apos;t added any products yet
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

App.getLayout = function getLayout(page) {
  return <AppLayout>{page}</AppLayout>;
};

export default App;
