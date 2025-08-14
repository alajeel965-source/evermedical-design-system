import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { Footer } from "./Footer";

interface AppShellProps {
  children: ReactNode;
  language?: "en" | "ar";
  onLanguageChange?: (lang: "en" | "ar") => void;
}

export function AppShell({ children, language = "en", onLanguageChange }: AppShellProps) {
  const isRTL = language === "ar";

  return (
    <div className={`min-h-screen flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      <TopNav language={language} onLanguageChange={onLanguageChange} />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer language={language} />
    </div>
  );
}