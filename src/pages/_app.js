import "@/styles/globals.css";
import Provider from "./Provider";

export default function App({ Component, pageProps }) {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
}
