import "@/styles/globals.css";
import Head from "next/head";
import Provider from "./Provider";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>My Chat</title>
        <meta name="description" content="Realtime Chat PWA" />

        <meta name="mobile-web-app-capable" content="yes" />
      </Head>

      <Provider>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}
