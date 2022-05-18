import { NextPageWithLayout } from "typings/types";
import { useEffect, useState } from "react";
import AppLayout from "components/layouts/app";
import { useMap } from "usehooks-ts";
import { amount } from "lib/shared";
import classNames from "classnames";
import fetchJson from "lib/fetch";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import MajesticonsEditPen2Line from "~icons/majesticons/edit-pen-2-line";
import MajesticonsTrashLine from "~icons/majesticons/trash-line";
import MajesticonsPlusCircleLine from "~icons/majesticons/plus-circle-line";
import MajesticonsMinusCircleLine from "~icons/majesticons/minus-circle-line";
import MajesticonsInboxLine from "~icons/majesticons/inbox-line";
import defaultProductImage from "public/assets/product-default-image.png";

const Product: React.FC<{
  product: any;
  basket: Omit<Map<string, number>, "set" | "clear" | "delete">;
  actions: {
    quantityDecrease: (s: string, c: string) => void;
    quantityIncrease: (s: string, c: string) => void;
    deleteProduct: (i: string) => Promise<void>;
  };
  currency?: string;
}> = ({ product, basket, actions, currency }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await actions.deleteProduct(product.id);
    setDeleting(false);
  };

  return (
    <div className="border-2 p-3 flex flex-col gap-3 rounded-md">
      <div className="flex items-center gap-2">
        <Image
          className="rounded-md shrink-0"
          src={product.images[0] || defaultProductImage}
          width={35}
          height={35}
          alt={product.name}
        />
        <h3 className="font-semibold flex-grow">{product.name}</h3>
        <Link href={`/app/products/${product.id}`}>
          <a className="border-2 p-1 rounded-md text-sm">
            <MajesticonsEditPen2Line />
          </a>
        </Link>
        <button
          className={classNames("border-2 p-1 rounded-md text-sm", {
            "opacity-50 pointer-events-none cursor-not-allowed": deleting,
          })}
          onClick={handleDelete}
        >
          <MajesticonsTrashLine />
        </button>
      </div>
      {product.skus.map((sku: any) => (
        <div className="flex justify-between items-center" key={sku.id}>
          <span className="text-slate-700 font-semibold text-sm">
            {amount(sku.price, sku.currency)}
          </span>
          <div className="flex items-center gap-2">
            {basket.get(sku.id) && (
              <>
                <button
                  className="border-2 p-1 rounded-md text-sm"
                  onClick={() => actions.quantityDecrease(sku.id, sku.currency)}
                >
                  <MajesticonsMinusCircleLine />
                </button>
                <span className="px-1 text-center text-sm">
                  {basket.get(sku.id)}
                </span>
              </>
            )}

            <button
              className={classNames("border-2 p-1 rounded-md text-sm", {
                "opacity-50 pointer-events-none cursor-not-allowed":
                  currency && currency !== sku.currency,
              })}
              onClick={() => actions.quantityIncrease(sku.id, sku.currency)}
            >
              <MajesticonsPlusCircleLine />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const Products: NextPageWithLayout = () => {
  const { data: products, mutate } = useSWR<any[]>("/api/products");
  const [basket, actions] = useMap<string, number>([]);
  const [currency, setCurrency] = useState<string>();
  const [loading, setLoading] = useState(false);

  const skus = (products || []).map(({ skus }) => skus).flat();
  const items = Array.from(basket).map(([sku_id, quantity]) => ({
    sku: skus.find(({ id }) => id === sku_id),
    quantity,
  }));
  const total = items.reduce(
    (total, item) => total + item.quantity * item.sku.price,
    0
  );

  const quantityIncrease = (sku_id: string, currency: string) => {
    const current = basket.get(sku_id) || 0;
    actions.set(sku_id, current + 1);
    setCurrency(currency);
  };

  const quantityDecrease = (sku_id: string, _currency: string) => {
    const current = basket.get(sku_id) || 0;
    if (current <= 1) actions.remove(sku_id);
    else actions.set(sku_id, current - 1);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("You're about to delete a product. Are you sure?")) return;
    await fetchJson("/api/products/delete", {
      method: "POST",
      json: { id },
    });
    await mutate();
  };

  const createPayment = async () => {
    setLoading(true);
  };

  useEffect(() => {
    if (!basket.size) setCurrency(undefined);
  }, [basket]);

  if (!products)
    return (
      <div className="flex justify-center items-center flex-col flex-grow">
        <div className="animate-spin spinner" />
        <h3 className="mt-4 text-sm font-semibold">Loading...</h3>
      </div>
    );

  return (
    <div className="p-6 flex-grow flex flex-col gap-6 max-w-md self-center w-full relative">
      <div className="font-semibold flex justify-between items-center">
        <h1 className="text-lg">Products</h1>
        <Link href="/app/products/new">
          <a className="text-sm border-2 py-1 px-3 rounded-md">New product</a>
        </Link>
      </div>
      {products.length ? (
        products.map((product) => (
          <Product
            key={product.id}
            product={product}
            basket={basket}
            actions={{ quantityIncrease, quantityDecrease, deleteProduct }}
            currency={currency}
          />
        ))
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center">
          <MajesticonsInboxLine fontSize={30} />
          <span className="font-medium mt-4">
            You haven&apos;t added any products yet
          </span>
        </div>
      )}
      <button
        className={classNames(
          "btn !transition-bottom mt-auto sticky bottom-0 opacity-0 md:bottom-0",
          {
            loading,
            "bottom-24 opacity-100": total && currency,
          }
        )}
        disabled={loading}
        onClick={createPayment}
      >
        Create payment - {total && currency ? amount(total, currency) : "$0"}
      </button>
    </div>
  );
};

Products.getLayout = function getLayout(page) {
  return <AppLayout>{page}</AppLayout>;
};

export default Products;
