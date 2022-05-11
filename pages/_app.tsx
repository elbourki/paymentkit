import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "../styles/globals.css";
import fetchJson from "lib/fetch";
import { SWRConfig } from "swr";
import Head from "next/head";
import { AppPropsWithLayout } from "typings/types";

function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

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
      {getLayout(<Component {...pageProps} />)}
    </SWRConfig>
  );
}

export default App;
