import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "SafeKid — Controle Parental",
  description: "Proteja seus filhos online e offline",
  manifest: "/manifest.json",
  themeColor: "#00C896",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
