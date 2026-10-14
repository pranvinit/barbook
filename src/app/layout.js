import "./globals.css";
import { StoreProvider } from "../lib/redux/provider";
import Navbar from "../components/layout/Navbar";
import AuthListener from "@/features/auth/ui/AuthListener";
import { Inter, IBM_Plex_Mono, Permanent_Marker } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-mono",
});

const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

export const metadata = {
  title: { default: "Barbook", template: "%s · Barbook" },
  description:
    "An AI notebook for rap bars: rhyme maps, bar scoring and a ghostwriter for writer's block.",
};

// Runs before first paint so a saved theme never flashes the wrong colours.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} ${permanentMarker.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
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
