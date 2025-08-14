import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { Footer } from "./Footer";
import { useI18n } from "@/lib/i18n";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { language, isRTL } = useI18n();

  return (
    <div className={`min-h-screen flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      <TopNav />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}