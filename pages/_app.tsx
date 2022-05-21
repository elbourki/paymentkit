import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "../styles/globals.css";
import fetchJson from "lib/fetch";
import { SWRConfig } from "swr";
import Head from "next/head";
import { AppPropsWithLayout } from "typings/types";
import { useEffect } from "react";

function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  const setAppHeight = () =>
    document.documentElement.style.setProperty(
      "--app-height",
      `${window.innerHeight - 1}px`
    );

  useEffect(() => {
    setAppHeight();
    window.addEventListener("resize", setAppHeight);
    return () => window.removeEventListener("resize", setAppHeight);
  });

  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: console.error,
      }}
    >
      <Head>
        <title>PaymentKit</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      {getLayout(<Component {...pageProps} />)}
    </SWRConfig>
  );
}

export default App;
