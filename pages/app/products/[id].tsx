import AppLayout from "components/layouts/app";
import { withIronSessionSsr } from "iron-session/next";
import useUser, { sessionOptions } from "lib/auth";
import { theme } from "lib/shared";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Select from "react-select";
import { NextPageWithLayout } from "typings/types";
import currencies from "lib/data/currencies.json";
import classNames from "classnames";
import { ChangeEvent, useEffect, useState } from "react";
import fetchJson from "lib/fetch";
import Input from "components/input";
import CurrencyInput, { formatValue } from "react-currency-input-field";
import Rapyd from "lib/rapyd";
import { useSWRConfig } from "swr";
import Router from "next/router";

type FormValues = {
  name: string;
  currency: string;
  price: string;
  image: string;
};

const NewProduct: NextPageWithLayout<{ product: any }> = ({ product }) => {
  const { user } = useUser();
  const { mutate } = useSWRConfig();
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    control,
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      name: product.name,
      currency: product.currency || user?.account?.default_currency,
      price: product.price,
    },
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);
  const currency_code = watch("currency");
  const currency =
    currencies.find(({ code }) => code === currency_code) || currencies[0];

  console.log(product);

  const changeImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return setValue("image", "");
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      setValue("image", reader.result?.toString() || "")
    );
    reader.readAsDataURL(e.target.files?.[0]);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    console.log(data);
    try {
      if (product.id === "new")
        await fetchJson("/api/products/create", {
          method: "POST",
          json: data,
        });
      else
        await fetchJson("/api/products/update", {
          method: "POST",
          json: { id: product.id, ...data },
        });
    } catch (error) {
      console.error(error);
    }
    await mutate("/api/products");
    Router.push("/app/products");
    setLoading(false);
  };

  useEffect(() => {
    register("image");
  }, [register]);

  return (
    <form
      className="flex flex-col gap-6 flex-grow p-6 max-w-md self-center w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        id="name"
        label="Product name"
        register={register}
        errors={errors}
        validation={{
          required: true,
        }}
      />
      <Controller
        name="currency"
        control={control}
        rules={{
          required: true,
        }}
        render={({ field, fieldState: { error } }) => (
          <label>
            <span className="block font-medium text-sm mb-1">Currency</span>
            <Select
              {...field}
              onChange={(val) => field.onChange(val?.code)}
              value={currencies.find((c) => c.code === field.value)}
              isMulti={false}
              options={currencies}
              styles={{
                control: (p, { isFocused }) => ({
                  ...p,
                  background: isFocused
                    ? "#f0fdfa"
                    : error
                    ? "#fef2f2"
                    : undefined,
                  borderColor: isFocused
                    ? "#14b8a6"
                    : error
                    ? "#fecaca"
                    : "#e5e7eb",
                  borderWidth: "2px",
                  fontSize: "0.875rem",
                  boxShadow: "none",
                  transition: "border-color 150ms 100ms",
                  minHeight: "44px",
                  ":hover": {
                    borderColor: isFocused ? "#14b8a6" : "#e5e7eb",
                  },
                }),
                option: (p) => ({
                  ...p,
                  fontWeight: "500",
                  fontSize: "0.875rem",
                }),
                input: (p) => ({
                  ...p,
                  input: {
                    boxShadow: "none !important",
                  },
                }),
              }}
              theme={theme}
              getOptionValue={(option) => option?.code || ""}
              getOptionLabel={(option) =>
                [option?.code, option?.name].filter(Boolean).join(" - ")
              }
            />
          </label>
        )}
      />
      <Controller
        name="price"
        control={control}
        rules={{ validate: (s) => !!parseFloat(s) }}
        render={({ field: { value, onChange } }) => (
          <label>
            <span className="block font-medium text-sm mb-1">Price</span>
            <CurrencyInput
              className="input"
              autoComplete="off"
              placeholder={formatValue({
                value: "0",
                decimalScale: currency.digits_after_decimal_separator,
                intlConfig: { locale: "en-US", currency: currency.code },
              })}
              allowNegativeValue={false}
              maxLength={9}
              intlConfig={{ locale: "en-US", currency: currency.code }}
              decimalsLimit={currency.digits_after_decimal_separator}
              onValueChange={onChange}
              value={value}
            />
          </label>
        )}
      />
      {product.id === "new" && (
        <label>
          <span className="block font-medium text-sm mb-1">Product image</span>
          <input className="input !py-0" type="file" onChange={changeImage} />
        </label>
      )}
      <button
        className={classNames("btn mt-auto", { loading })}
        disabled={!isValid || loading}
        type="submit"
      >
        {product.id === "new" ? "Add product" : "Update product"}
      </button>
    </form>
  );
};

NewProduct.getLayout = function getLayout(page) {
  return <AppLayout>{page}</AppLayout>;
};

export const getServerSideProps = withIronSessionSsr(async function ({
  params,
  req,
}) {
  const id = params?.id?.toString() || "new";
  if (!req.session.user?.account || id === "new")
    return {
      props: { product: { id: "new", name: "" } },
    };
  const rapyd = await Rapyd.forAccount(req.session.user.account.id);
  const { data: product } = await rapyd.getProduct(id);
  const sku = product.skus.at(0);
  return {
    props: {
      product: {
        id,
        name: product.name,
        currency: sku.currency,
        price: sku.price,
      },
    },
  };
},
sessionOptions);

export default NewProduct;
