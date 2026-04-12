import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nedu - Thấu hiểu chính mình",
  description: "Bắt đầu hành trình lắng nghe nội tâm cùng Nedu AI.",
  icons: {
    icon: "/logo-nedu.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FDFCFB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="antialiased">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-GCS7KVX9KT"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-GCS7KVX9KT');
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-[#FDFCFB] text-[#2D2D2D] selection:bg-[#8B5E3C] selection:text-white">
        {children}
      </body>
    </html>
  );
}
