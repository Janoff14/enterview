import { AppProvider } from "@/Context";
import "@/styles/globals.css";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }) {

  
  return (
    <AppProvider>
      <div className="p-10">
        <Toaster />
        <Link href={''} className="font-bold text-xl">
          enter
          <span className="text-blue-600">view</span>
        </Link>

        <Component {...pageProps} />
      </div>
    </AppProvider>
  );
}
