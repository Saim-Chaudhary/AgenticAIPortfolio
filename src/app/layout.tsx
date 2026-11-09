import type { Metadata, Viewport } from "next";
import { Antonio, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Antonio({ subsets: ["latin"], weight: ["600"], variable: "--f-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--f-mono", display: "swap" });

const HEAD_SCRIPT = `(function(){var d=document.documentElement,t="light";d.classList.add("js");try{if(localStorage.getItem("theme")==="dark")t="dark"}catch(e){}d.setAttribute("data-theme",t);d.style.colorScheme=t;var c=t==="dark"?"#1a0c0f":"#f1f3f6",m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement("meta");m.name="theme-color";document.head.appendChild(m)}m.setAttribute("content",c);var s=document.querySelector('meta[name="color-scheme"]');if(!s){s=document.createElement("meta");s.name="color-scheme";document.head.appendChild(s)}s.setAttribute("content",t)})();`;

export const metadata: Metadata = {
  title: "Muhammad Saim, Agentic AI Engineer",
  description:
    "Muhammad Saim builds AI agents. Two were built for real clients in Okara, Pakistan. Open to internships, remote jobs and freelance work.",
};

export const viewport: Viewport = { themeColor: "#f1f3f6" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
