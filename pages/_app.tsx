import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import fetchJson from "lib/fetch";
import { SWRConfig } from "swr";
import Head from "next/head";

function App({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: console.error,
      }}
    >
      <Head>
        <title>PaymentKit</title>
      </Head>
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default App;
