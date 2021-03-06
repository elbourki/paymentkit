import fetchJson from "lib/fetch";
import { useState, useEffect, useCallback } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { amount, styles, theme } from "lib/shared";
import { useMap } from "usehooks-ts";
import classNames from "classnames";
import Select from "react-select";
import countries from "lib/data/countries.json";
import currencies from "lib/data/currencies.json";
import payment_methods_categories from "lib/data/payment_methods_categories.json";
import MajesticonsCheckCircleLine from "~icons/majesticons/check-circle-line";
import MajesticonsClockLine from "~icons/majesticons/clock-line";
import MajesticonsExclamationCircleLine from "~icons/majesticons/exclamation-circle-line";
import Input from "components/input";
import { RadioGroup } from "@headlessui/react";

const tip_options = [0, 15, 20, 25];

type FormValues = {
  country: string;
  currency?: string;
  payment_category?: string;
  tip: number;
};

export const RapydPayment: React.FC<{
  payment: any;
  card?: boolean;
  default_country?: string;
  tips: boolean;
}> = ({ payment, card, default_country, tips }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "error" | "verifying" | "pending" | "paid" | "unpaid"
  >(payment.status);
  const [checkoutId, setCheckoutId] = useState<string>();
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [options, actions] = useMap<string, string[]>([]);
  const {
    handleSubmit,
    formState: { isValid, errors },
    control,
    watch,
    register,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      country: default_country,
      tip: 0,
    },
    mode: "onChange",
  });
  const [selected, setSelected] = useState<number | undefined>(0);
  const country = watch("country");
  const currency = watch("currency");
  const tip = watch("tip");

  useEffect(() => {
    (async () => {
      if (!country) return;
      setValue("currency", undefined);
      setLoadingOptions(true);
      const options = await fetchJson<{ [k: string]: string[] }>(
        "/api/options",
        {
          method: "POST",
          json: { id: payment.id, country, card },
        }
      );
      actions.setAll(Object.entries(options));
      setLoadingOptions(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  useEffect(() => {
    setValue("payment_category", undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  useEffect(() => {
    if (!checkoutId) return;
    const checkout = new window.RapydCheckoutToolkit({
      pay_button_text: card ? "Charge card" : "Pay now",
      pay_button_color: "#0d9488",
      mobile_view: true,
      id: checkoutId,
    });
    checkout.displayCheckout();
  }, [checkoutId, card]);

  const paymentError = (e: any) => {
    console.error(e);
    setStatus("error");
  };

  const verifyPayment = useCallback(async () => {
    setStatus("verifying");
    try {
      const { status, complete_payment_url } = await fetchJson<{
        status: "pending" | "paid";
        complete_payment_url: string;
      }>("/api/payments/verify", {
        method: "POST",
        json: { id: payment.id, checkoutId, card },
      });
      if (status === "pending") window.location.href = complete_payment_url;
      setStatus(status);
    } catch (e) {
      paymentError(e);
    }
  }, [card, checkoutId, payment.id]);

  useEffect(() => {
    window.addEventListener("onCheckoutPaymentSuccess", verifyPayment);
    window.addEventListener("onCheckoutPaymentFailure", paymentError);
    return () => {
      window.removeEventListener("onCheckoutPaymentSuccess", verifyPayment);
      window.removeEventListener("onCheckoutPaymentFailure", paymentError);
    };
  }, [verifyPayment]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    const checkout = await fetchJson<{ id: string; sandbox: boolean }>(
      "/api/checkout",
      {
        method: "POST",
        json: {
          id: payment.id,
          ...data,
          payment_category: card ? "card" : data.payment_category,
        },
      }
    );
    setCheckoutId(checkout.id);
  };

  const changeTip = (v: number | undefined) => {
    setSelected(v);
    if (v !== undefined) setValue("tip", v);
  };

  if (status === "verifying")
    return (
      <div className="flex justify-center items-center flex-col my-6">
        <div className="animate-spin spinner spinner-lg" />
        <h3 className="mt-6 text-sm font-semibold">Verifying payment...</h3>
      </div>
    );

  if (status === "pending")
    return (
      <div className="flex justify-center items-center flex-col my-6 text-center">
        <MajesticonsClockLine fontSize={40} />
        <h3 className="mt-4 text-sm font-semibold">
          Please follow the instructions to complete the payment.
        </h3>
      </div>
    );

  if (status === "paid")
    return (
      <div className="flex justify-center items-center flex-col my-6 text-center">
        <MajesticonsCheckCircleLine fontSize={40} />
        <h3 className="mt-4 text-sm font-semibold">
          The payment has been processed successfully!
        </h3>
      </div>
    );

  if (status === "error")
    return (
      <div className="flex justify-center items-center flex-col my-6 text-center">
        <MajesticonsExclamationCircleLine fontSize={40} />
        <h3 className="mt-4 text-sm font-semibold">
          Couldn&apos;t process the payment.{" "}
        </h3>
        <a className="text-sm font-semibold underline" href="">
          Try again?
        </a>
      </div>
    );

  if (checkoutId) return <div id="rapyd-checkout" className="-mx-5"></div>;

  return (
    <form
      className="flex flex-col gap-6 flex-grow"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="country"
        control={control}
        rules={{
          required: true,
        }}
        render={({ field, fieldState: { error } }) => (
          <label>
            <span className="block font-medium text-sm mb-1">Country</span>
            <Select
              {...field}
              instanceId="country-select"
              onChange={(val) => field.onChange(val?.iso_alpha2)}
              value={countries.find((c) => c.iso_alpha2 === field.value)}
              isMulti={false}
              options={countries}
              styles={styles<typeof countries[number], false>(error)}
              theme={theme}
              getOptionValue={(option) => option?.iso_alpha2 || ""}
              getOptionLabel={(option) => option.name}
            />
          </label>
        )}
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
              instanceId="currency-select"
              onChange={(val) => field.onChange(val?.code)}
              value={currencies.find((c) => c.code === field.value) || null}
              isMulti={false}
              isLoading={loadingOptions}
              isDisabled={!country || loadingOptions}
              options={currencies.filter((currency) =>
                Array.from(options.keys()).includes(currency.code)
              )}
              styles={styles<typeof currencies[number], false>(error)}
              theme={theme}
              getOptionValue={(option) => option?.code || ""}
              getOptionLabel={(option) =>
                [option?.code, option?.name].filter(Boolean).join(" - ")
              }
            />
          </label>
        )}
      />
      {!card && (
        <Controller
          name="payment_category"
          control={control}
          rules={{
            required: true,
          }}
          render={({ field, fieldState: { error } }) => (
            <label>
              <span className="block font-medium text-sm mb-1">
                Payment method
              </span>
              <Select
                {...field}
                instanceId="payment-category-select"
                onChange={(val) => field.onChange(val?.value)}
                value={
                  payment_methods_categories.find(
                    (c) => field.value === c.value
                  ) || null
                }
                isMulti={false}
                isLoading={loadingOptions}
                isDisabled={!currency || loadingOptions}
                options={payment_methods_categories.filter(
                  (category) =>
                    currency && options.get(currency)?.includes(category.value)
                )}
                styles={styles<
                  typeof payment_methods_categories[number],
                  false
                >(error)}
                theme={theme}
              />
            </label>
          )}
        />
      )}
      {tips && (
        <div>
          <RadioGroup className="mb-3" value={selected} onChange={changeTip}>
            <RadioGroup.Label className="block font-medium text-sm">
              Add a tip (
              {amount(((tip || 0) / 100) * payment.amount, payment.currency)})
            </RadioGroup.Label>
            <div className="flex flex-wrap gap-3 mt-1">
              {tip_options.map((option) => (
                <RadioGroup.Option
                  key={option}
                  value={option}
                  className={({ checked }) =>
                    classNames(
                      "text-sm font-medium border-2 rounded-md py-2 px-3 cursor-pointer",
                      {
                        "bg-teal-600 text-white border-teal-600": checked,
                      }
                    )
                  }
                >
                  {option ? `${option}%` : "No Tip"}
                </RadioGroup.Option>
              ))}
              <RadioGroup.Option
                value={undefined}
                className={({ checked }) =>
                  classNames(
                    "text-sm font-medium border-2 rounded-md py-2 px-3 cursor-pointer",
                    {
                      "bg-teal-600 text-white border-teal-600": checked,
                    }
                  )
                }
              >
                Custom
              </RadioGroup.Option>
            </div>
          </RadioGroup>
          <Input
            id="tip"
            className={classNames({
              hidden: selected !== undefined,
            })}
            placeholder="Custom tip"
            register={register}
            errors={errors}
            type="number"
            validation={{
              required: true,
              valueAsNumber: true,
              min: 0,
              max: 100,
            }}
          />
        </div>
      )}
      <button
        className={classNames("btn mt-auto", { loading })}
        disabled={!isValid || loading}
        type="submit"
      >
        Proceed to payment
      </button>
    </form>
  );
};
