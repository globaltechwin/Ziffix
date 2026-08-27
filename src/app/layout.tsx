import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceProvider } from "@/context/service-context";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Servly - Home Services Management",
  description:
    "Professional home services management platform for customers, technicians, and administrators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ServiceProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </ServiceProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
