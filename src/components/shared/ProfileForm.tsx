import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UsernameField } from "./UsernameField";
import { User, Shield, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileFormData } from "@/lib/types/api";

interface ProfileFormProps {
  profileType: "medical_personnel" | "medical_institute" | "medical_seller";
  initialData?: Partial<ProfileFormData>;
  onSave?: (data: ProfileFormData) => void;
  className?: string;
}

export function ProfileForm({ profileType, initialData, onSave, className }: ProfileFormProps) {
  // Safe property access with fallbacks
  const getInitialValue = (key: string, fallback = "") => {
    return (initialData as Record<string, unknown>)?.[key] as string || fallback;
  };

  const [formData, setFormData] = useState({
    first_name: getInitialValue("first_name"),
    last_name: getInitialValue("last_name"),
    username: getInitialValue("username"),
    email: getInitialValue("email"),
    title: getInitialValue("title"),
    organization: getInitialValue("organization"),
    specialty: getInitialValue("specialty"),
    country: getInitialValue("country"),
    avatar_url: getInitialValue("avatar_url"),
    profile_type: profileType,
    ...initialData
  });

  const [showEmail, setShowEmail] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Type assertion to ensure compatibility with ProfileFormData
    onSave?.(formData as ProfileFormData);
  };

  const getFormTitle = () => {
    switch (profileType) {
      case "medical_personnel":
        return "Medical Personnel Profile";
      case "medical_institute":
        return "Medical Institute Profile";
      case "medical_seller":
        return "Medical Seller Profile";
      default:
        return "Profile Information";
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          {getFormTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={formData.avatar_url} alt="Profile picture" />
            <AvatarFallback>
              {formData.first_name && formData.last_name 
                ? `${formData.first_name[0] || ''}${formData.last_name[0] || ''}`
                : formData.organization
                  ? formData.organization.slice(0, 2).toUpperCase()
                  : "??"
              }
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">
              Upload Picture
            </Button>
            <p className="text-xs text-muted mt-1">JPG, PNG up to 2MB</p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileType !== "medical_institute" ? (
            <>
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <Label htmlFor="organization">Institution Name *</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => handleInputChange("organization", e.target.value)}
                placeholder="Enter institution name"
              />
            </div>
          )}
        </div>

        {/* Username - Public identifier */}
        <UsernameField
          value={formData.username}
          onChange={(value) => handleInputChange("username", value)}
          required
        />

        {/* Email - Private, with privacy indicator */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            Email Address *
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Private
            </Badge>
          </Label>
          <div className="relative">
            <Input
              id="email"
              type={showEmail ? "email" : "password"}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email address"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowEmail(!showEmail)}
            >
              {showEmail ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted">
            Your email will never be visible to other users. Used only for account management and notifications.
          </p>
        </div>

        {/* Role/Title */}
        <div>
          <Label htmlFor="title">
            {profileType === "medical_personnel" ? "Title/Position" : 
             profileType === "medical_institute" ? "Institution Type" : 
             "Company Role"}
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder={
              profileType === "medical_personnel" ? "e.g., Cardiologist, Nurse Practitioner" :
              profileType === "medical_institute" ? "e.g., Academic Medical Center, Hospital" :
              "e.g., Sales Director, Product Manager"
            }
          />
        </div>

        {/* Organization/Company */}
        {profileType !== "medical_institute" && (
          <div>
            <Label htmlFor="organization">
              {profileType === "medical_personnel" ? "Hospital/Institution" : "Company Name"}
            </Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => handleInputChange("organization", e.target.value)}
              placeholder={
                profileType === "medical_personnel" 
                  ? "Enter your hospital or institution"
                  : "Enter your company name"
              }
            />
          </div>
        )}

        {/* Specialty */}
        {profileType === "medical_personnel" && (
          <div>
            <Label htmlFor="specialty">Medical Specialty</Label>
            <Select onValueChange={(value) => handleInputChange("specialty", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem>
                <SelectItem value="orthopedics">Orthopedics</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                <SelectItem value="radiology">Radiology</SelectItem>
                <SelectItem value="emergency_medicine">Emergency Medicine</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Country */}
        <div>
          <Label htmlFor="country">Country</Label>
          <Select onValueChange={(value) => handleInputChange("country", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="GB">United Kingdom</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="FR">France</SelectItem>
              <SelectItem value="AU">Australia</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Privacy Notice */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Privacy & Public Profile
          </h4>
          <div className="space-y-2 text-xs text-muted">
            <p>
              <strong>Public information:</strong> Username, name, title, organization, specialty, country
            </p>
            <p>
              <strong>Private information:</strong> Email address, subscription details
            </p>
            <p>
              Other users can find and connect with you using your username or professional details, 
              but will never see your email address.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Profile
          </Button>
          <Button variant="outline">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}