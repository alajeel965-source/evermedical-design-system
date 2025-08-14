import { AppShell } from "@/components/shared/AppShell";

export default function Pricing() {
  return (
    <AppShell>
      <div className="container mx-auto p-lg">
        <div className="text-center space-y-lg">
          <h1 className="text-heading font-bold text-medical-4xl">Pricing</h1>
          <p className="text-body text-medical-lg max-w-2xl mx-auto">
            Choose the plan that best fits your medical organization's needs.
          </p>
        </div>
      </div>
    </AppShell>
  );
}