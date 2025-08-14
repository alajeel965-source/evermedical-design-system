import { AppShell } from "@/components/shared/AppShell";

export default function Marketplace() {
  return (
    <AppShell>
      <div className="container mx-auto p-lg">
        <div className="text-center space-y-lg">
          <h1 className="text-heading font-bold text-medical-4xl">Marketplace</h1>
          <p className="text-body text-medical-lg max-w-2xl mx-auto">
            Discover medical equipment, supplies, and services from verified vendors.
          </p>
        </div>
      </div>
    </AppShell>
  );
}