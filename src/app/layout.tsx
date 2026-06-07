import type { Metadata } from "next";
import { Inter, Noto_Sans_Khmer } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

// 1. Setup English Font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// 2. Setup Khmer Font
const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "500", "700"],
  variable: "--font-sans-khmer",
  display: "swap",
});

// 3. Update to your actual app name!
export const metadata: Metadata = {
  title: "Room Rental Management System (RRMS)",
  description: "គ្រប់គ្រងប្រព័ន្ធផ្ទះជួលរបស់អ្នកដោយងាយស្រួល",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="km"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        inter.variable,
        notoSansKhmer.variable,
        "font-sans", // Let Tailwind apply the base font here
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          nonce={undefined}
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
