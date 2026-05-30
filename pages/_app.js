import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <>
      <Head>
        <title>journal</title>
        <meta
          name="description"
          content="a quiet place to write every day"
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>

      <Analytics />
      <SpeedInsights />
    </>
  );
}