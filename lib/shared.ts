import { ThemeConfig } from "react-select";

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
