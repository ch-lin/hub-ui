import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
// 👉 1. Import TooltipProvider
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube Hub App",
  description: "YouTube Hub to download videos and playlists from YouTube",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 w-full p-4 overflow-auto">
              <SidebarTrigger className="mb-4" />
              {children}
            </main>
          </SidebarProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}