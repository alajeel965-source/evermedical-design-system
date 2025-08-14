import { AppShell } from "@/components/shared/AppShell";

export default function Terms() {
  return (
    <AppShell>
      <div className="container mx-auto p-lg">
        <div className="text-center space-y-lg">
          <h1 className="text-heading font-bold text-medical-4xl">Terms of Service</h1>
          <p className="text-body text-medical-lg max-w-2xl mx-auto">
            Please review our terms and conditions for using EverMedical services.
          </p>
        </div>
      </div>
    </AppShell>
  );
}