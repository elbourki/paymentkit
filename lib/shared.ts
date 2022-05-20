import { StylesConfig, ThemeConfig } from "react-select";
import { formatValue } from "react-currency-input-field";
import currencies from "lib/data/currencies.json";
import { FieldError } from "react-hook-form";
import MajesticonsCreditcardHandLine from "~icons/majesticons/creditcard-hand-line";
import MajesticonsCreditCardLine from "~icons/majesticons/credit-card-line";
import MajesticonsCashLine from "~icons/majesticons/cash-line";
import MajesticonsSortHorizontalLine from "~icons/majesticons/sort-horizontal-line";
import MajesticonsLibraryLine from "~icons/majesticons/library-line";
import MajesticonsIphoneXAppsLine from "~icons/majesticons/iphone-x-apps-line";
import MajesticonsClockLine from "~icons/majesticons/clock-line";

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

export const styles = <T, M extends boolean>(
  error: FieldError | undefined
): StylesConfig<T, M> => ({
  control: (p, { isFocused }) => ({
    ...p,
    background: isFocused ? "#f0fdfa" : error ? "#fef2f2" : undefined,
    borderColor: isFocused ? "#14b8a6" : error ? "#fecaca" : "#e5e7eb",
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
});

export const amount = (amount: number, currency_code: string) => {
  const currency = currencies.find((c) => c.code === currency_code);
  return formatValue({
    value: amount.toString(),
    decimalScale: currency?.digits_after_decimal_separator || 2,
    intlConfig: { locale: "en-US", currency: currency?.code || currency_code },
  });
};

export const icon_mapping: { [k: string]: typeof MajesticonsClockLine } = {
  manual: MajesticonsCreditcardHandLine,
  card: MajesticonsCreditCardLine,
  cash: MajesticonsCashLine,
  ewallet: MajesticonsIphoneXAppsLine,
  bank_redirect: MajesticonsLibraryLine,
  bank_transfer: MajesticonsSortHorizontalLine,
  unpaid: MajesticonsClockLine,
};
