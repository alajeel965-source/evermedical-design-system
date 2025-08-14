import { Link } from "react-router-dom";
import { User, Building2, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/templates/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user } = useAuth();

  const profileTypes = [
    {
      type: "medical-personnel",
      title: "Medical Personnel",
      description: "Doctors, Nurses, Pharmacists, Medical Students",
      icon: User,
      href: "/profile/medical-personnel",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      type: "medical-institute", 
      title: "Medical Institute",
      description: "Hospitals, Clinics, Labs, Universities, NGOs",
      icon: Building2,
      href: "/profile/medical-institute",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      type: "medical-seller",
      title: "Medical Seller",
      description: "Manufacturers, Distributors, Exporters", 
      icon: ShoppingBag,
      href: "/profile/medical-seller",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <PageLayout title="Profile">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email}. Choose your profile type to continue.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profileTypes.map((profile) => {
              const Icon = profile.icon;
              
              return (
                <Card key={profile.type} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader className="text-center pb-4">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                      profile.bgColor
                    )}>
                      <Icon className={cn("h-8 w-8", profile.color)} />
                    </div>
                    <CardTitle className="text-xl">{profile.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {profile.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link to={profile.href}>
                      <Button 
                        className="w-full group-hover:bg-primary/90 transition-colors"
                        size="sm"
                      >
                        View Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-accent/50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Contact our support team if you need assistance with your profile.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}