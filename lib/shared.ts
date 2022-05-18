import { ThemeConfig } from "react-select";
import { formatValue } from "react-currency-input-field";
import currencies from "lib/data/currencies.json";

export const theme: ThemeConfig = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: "#0d9488",
    primary75: "#0d9488",
    primary50: "#ccfbf1",
    primary25: "#f0fdfa",
  },
});

export const amount = (amount: number, currency_code: string) => {
  const currency = currencies.find((c) => c.code === currency_code);
  return formatValue({
    value: amount.toString(),
    decimalScale: currency?.digits_after_decimal_separator || 2,
    intlConfig: { locale: "en-US", currency: currency?.code || currency_code },
  });
};
