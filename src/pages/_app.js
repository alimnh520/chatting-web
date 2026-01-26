import "@/styles/globals.css";
import Head from "next/head";
import Provider from "./Provider";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return (
    <>
      <Head>
        <title>My Chat</title>
        <meta name="description" content="Realtime Chat PWA" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, height=device-height, viewport-fit=cover"
        />

        <meta name="mobile-web-app-capable" content="yes" />
      </Head>

      <Provider>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}
