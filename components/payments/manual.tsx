import fetchJson from "lib/fetch";
import { useState, useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Select from "react-select";
import countries from "lib/data/countries.json";
import currencies from "lib/data/currencies.json";
import { theme } from "lib/shared";
import classNames from "classnames";

type FormValues = {
  country: string;
  currency: string;
};

export const ManualPayment: React.FC<{ payment: any }> = ({ payment }) => {
  const [loading, setLoading] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string>();
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [allowedCurrencies, setAllowedCurrencies] = useState<string[]>([]);
  const {
    handleSubmit,
    formState: { isValid },
    control,
    watch,
  } = useForm<FormValues>({
    mode: "onChange",
  });
  const country = watch("country");

  useEffect(() => {
    (async () => {
      if (!country) return;
      setLoadingOptions(true);
      const options = await fetchJson<{ [k: string]: string[] }>(
        "/api/options",
        {
          method: "POST",
          json: { id: payment.id, country, card: true },
        }
      );
      setAllowedCurrencies(Object.keys(options));
      setLoadingOptions(false);
    })();
  }, [country, payment.id]);

  useEffect(() => {
    if (!checkoutId) return;
    const checkout = new window.RapydCheckoutToolkit({
      pay_button_text: "Charge card",
      pay_button_color: "#0d9488",
      mobile_view: true,
      id: checkoutId,
    });
    checkout.displayCheckout();
  }, [checkoutId]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    const checkout = await fetchJson<{ id: string; sandbox: boolean }>(
      "/api/checkout",
      {
        method: "POST",
        json: {
          id: payment.id,
          country: data.country,
          currency: data.currency,
          payment_category: "card",
        },
      }
    );
    setCheckoutId(checkout.id);
  };

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
              onChange={(val) => field.onChange(val?.iso_alpha2)}
              value={countries.find((c) => c.iso_alpha2 === field.value)}
              isMulti={false}
              options={countries}
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
              onChange={(val) => field.onChange(val?.code)}
              value={currencies.find((c) => c.code === field.value)}
              isMulti={false}
              isSearchable={false}
              isLoading={loadingOptions}
              isDisabled={!country}
              options={currencies.filter((currency) =>
                allowedCurrencies.includes(currency.code)
              )}
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
                  ":hover": {
                    borderColor: isFocused ? "#14b8a6" : "#e5e7eb",
                  },
                }),
                option: (p) => ({
                  ...p,
                  fontWeight: "500",
                  fontSize: "0.875rem",
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
