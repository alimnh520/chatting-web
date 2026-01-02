import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="My Chat" />
        <link rel="apple-touch-icon" href="/icon-512.png" />

        <link rel="icon" href="/icon-512.png" />
        <link rel="shortcut icon" href="/icon-512.png" />
      </Head>


      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
