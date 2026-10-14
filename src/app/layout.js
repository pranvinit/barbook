import "./globals.css";
import { StoreProvider } from "../lib/redux/provider";
import Navbar from "../components/layout/Navbar";
import AuthListener from "@/features/auth/ui/AuthListener";
import { Poppins, Inter } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--primary-font",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--heading-font",
});

export const metadata = {
  title: "Flirty",
  description: "Flirty - Your AI-powered flirtation assistant",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>😉</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <StoreProvider>
          <AuthListener />
          <Navbar />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
