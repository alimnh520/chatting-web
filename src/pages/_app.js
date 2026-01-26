import "@/styles/globals.css";
import Head from "next/head";
import Provider from "./Provider";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    // 📌 beforeinstallprompt event capture
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // default auto show block
      setDeferredPrompt(e); // save the event
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!deferredPrompt) return;

    const interval = setInterval(() => {
      deferredPrompt.prompt();
    }, 10000);

    return () => clearInterval(interval);
  }, [deferredPrompt]);

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
        <Component {...pageProps} deferredPrompt={deferredPrompt} />
      </Provider>
    </>
  );
}
