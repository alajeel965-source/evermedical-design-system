import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { Footer } from "./Footer";
import { SkipToContent } from "./SkipToContent";
import { LiveRegion } from "./LiveRegion";
import { useI18n } from "@/lib/i18n";

interface AppShellProps {
  children: ReactNode;
  announceMessage?: string;
}

export function AppShell({ children, announceMessage = "" }: AppShellProps) {
  const { language, isRTL } = useI18n();

  return (
    <div className={`min-h-screen flex flex-col prevent-overflow ${isRTL ? 'rtl' : 'ltr'}`}>
      <SkipToContent />
      <LiveRegion message={announceMessage} />
      
      <TopNav />
      
      <main id="main-content" className="flex-1" role="main" tabIndex={-1}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
}