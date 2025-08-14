import { AppShell } from "@/components/shared/AppShell";

export default function Privacy() {
  return (
    <AppShell>
      <div className="container mx-auto p-lg">
        <div className="text-center space-y-lg">
          <h1 className="text-heading font-bold text-medical-4xl">Privacy Policy</h1>
          <p className="text-body text-medical-lg max-w-2xl mx-auto">
            Your privacy and data security are our top priorities.
          </p>
        </div>
      </div>
    </AppShell>
  );
}