import classNames from "classnames";
import AppLayout from "components/layouts/app";
import useUser from "lib/auth";
import fetchJson from "lib/fetch";
import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Select from "react-select";
import { NextPageWithLayout } from "typings/types";
import currencies from "lib/data/currencies.json";
import { theme } from "lib/shared";

const payment_methods_categories = [
  { value: "bank_redirect", label: "Bank redirect" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "card", label: "Credit cards" },
  { value: "cash", label: "Cash" },
  { value: "ewallet", label: "Ewallet" },
];

type FormValues = {
  payment_methods_categories: string[];
  default_currency: string;
  allow_tips: boolean;
};

const Settings: NextPageWithLayout = () => {
  const { user, mutateUser } = useUser();
  const {
    register,
    handleSubmit,
    formState: { isValid },
    control,
  } = useForm<FormValues>({
    defaultValues: {
      payment_methods_categories:
        user?.account?.payment_methods_categories || [],
      default_currency: user?.account?.default_currency,
      allow_tips: user?.account?.allow_tips || false,
    },
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      await mutateUser(
        await fetchJson("/api/settings", {
          method: "POST",
          json: data,
        })
      );
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <form
      className="flex flex-col gap-6 flex-grow p-6 max-w-md self-center w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="payment_methods_categories"
        control={control}
        rules={{
          required: true,
        }}
        render={({ field, fieldState: { error } }) => (
          <label>
            <span className="block font-medium text-sm mb-1">
              Allowed payment methods
            </span>
            <Select
              {...field}
              onChange={(val) => field.onChange(val.map((c) => c.value))}
              value={payment_methods_categories.filter((c) =>
                field.value.includes(c.value)
              )}
              isMulti={true}
              isSearchable={false}
              options={payment_methods_categories}
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
                  borderRadius: "0.375rem",
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
            />
          </label>
        )}
      />
      <Controller
        name="default_currency"
        control={control}
        rules={{
          required: true,
        }}
        render={({ field, fieldState: { error } }) => (
          <label>
            <span className="block font-medium text-sm mb-1">
              Default currency
            </span>
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
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          {...register("allow_tips")}
          className="rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-500 focus:ring-transparent"
        />
        <span className="ml-2 font-medium text-gray-800 text-sm">
          Allow customers to add tips
        </span>
      </label>
      <button
        className={classNames("btn mt-auto", { loading })}
        disabled={!isValid || loading}
        type="submit"
      >
        Save settings
      </button>
    </form>
  );
};

Settings.getLayout = function getLayout(page) {
  return <AppLayout>{page}</AppLayout>;
};

export default Settings;
