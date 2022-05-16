import classNames from "classnames";
import AppLayout from "components/layouts/app";
import CurrencyInput, { formatValue } from "react-currency-input-field";
import { NextPageWithLayout } from "typings/types";
import currencies from "lib/data/currencies.json";
import { useEffect, useState } from "react";
import Select, { SingleValueProps, ValueContainerProps } from "react-select";
import MajesticonsChevronDownLine from "~icons/majesticons/chevron-down-line";
import Input from "components/input";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import fetchJson, { FetchError } from "lib/fetch";

const SingleValue = (props: SingleValueProps<any>) => (
  <>
    <span className="text-sm">{props.data.code}</span>
    <MajesticonsChevronDownLine className="ml-1" />
  </>
);

const ValueContainer = (props: ValueContainerProps<any>) => (
  <>{props.children}</>
);

const IndicatorsContainer = () => <></>;

type FormValues = {
  amount: string;
  currency: typeof currencies[number];
  description: string;
};

const NewPayment: NextPageWithLayout = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      currency: currencies.find(({ code }) => code === "USD") || currencies[0],
    },
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);
  const currency = watch("currency");

  useEffect(() => {
    setValue("amount", "", {
      shouldValidate: true,
    });
  }, [currency, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      await fetchJson("/api/payments/new", {
        method: "POST",
        json: data,
      });
    } catch (error) {
      if (error instanceof FetchError) {
        setError("description", { message: error.data.message });
      } else {
        console.error(error);
      }
    }
    setLoading(false);
  };

  return (
    <form className="flex flex-col flex-grow" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="amount"
        control={control}
        rules={{ validate: (s) => !!parseFloat(s) }}
        render={({ field: { value, onChange } }) => (
          <CurrencyInput
            className="text-center flex-grow w-full border-0 text-6xl !outline-none !ring-0 font-bold pl-6 rtl:pr-6"
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
        )}
      />
      <div className="p-6 self-center flex flex-col gap-6 w-full max-w-md">
        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              isMulti={false}
              isSearchable={false}
              options={currencies}
              styles={{
                control: () => ({
                  background: "#f3f4f6",
                  textAlign: "center",
                  borderRadius: "9999px",
                  fontWeight: "bold",
                  padding: "4px 14px",
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }),
                option: (p) => ({
                  ...p,
                  fontWeight: "500",
                }),
              }}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: "#0d9488",
                  primary75: "#0d9488",
                  primary50: "#ccfbf1",
                  primary25: "#f0fdfa",
                },
              })}
              menuPlacement="top"
              getOptionValue={(option) => option?.code || ""}
              getOptionLabel={(option) =>
                [option?.code, option?.name].filter(Boolean).join(" - ")
              }
              className={"flex justify-center"}
              components={{
                SingleValue,
                ValueContainer,
                IndicatorsContainer,
              }}
            />
          )}
        />
        <Input
          id="description"
          placeholder="Payment description"
          register={register}
          errors={errors}
          validation={{
            required: true,
          }}
        />
        <button
          className={classNames("btn", { loading })}
          disabled={!isValid || loading}
          type="submit"
        >
          Create payment
        </button>
      </div>
    </form>
  );
};

NewPayment.getLayout = function getLayout(page) {
  return <AppLayout>{page}</AppLayout>;
};

export default NewPayment;
