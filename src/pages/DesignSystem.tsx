import { AppShell } from "@/components/shared/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { StatPill } from "@/components/shared/StatPill";
import { FeatureTile } from "@/components/shared/FeatureTile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CheckCircle, Users, Zap, Shield, Heart, Activity, Bell, Settings, Star, ArrowRight } from "lucide-react";
import { useI18n, useTranslation } from "@/lib/i18n";

export default function DesignSystem() {
  const { isRTL } = useI18n();
  const { t } = useTranslation();

  const colorTokens = [
    { name: "Primary", value: "hsl(var(--primary))", class: "bg-primary text-primary-foreground" },
    { name: "Secondary", value: "hsl(var(--secondary))", class: "bg-secondary text-secondary-foreground" },
    { name: "Accent", value: "hsl(var(--accent))", class: "bg-accent text-accent-foreground" },
    { name: "Success", value: "hsl(var(--success))", class: "bg-success text-success-foreground" },
    { name: "Warning", value: "hsl(var(--warning))", class: "bg-warning text-warning-foreground" },
    { name: "Destructive", value: "hsl(var(--destructive))", class: "bg-destructive text-destructive-foreground" },
  ];

  const spacingTokens = [
    { name: "XS", value: "var(--space-xs)", size: "8px" },
    { name: "SM", value: "var(--space-sm)", size: "12px" },
    { name: "MD", value: "var(--space-md)", size: "16px" },
    { name: "LG", value: "var(--space-lg)", size: "24px" },
    { name: "XL", value: "var(--space-xl)", size: "32px" },
    { name: "2XL", value: "var(--space-2xl)", size: "48px" },
  ];

  const typographyScale = [
    { name: "Medical XS", class: "text-medical-xs", size: "12px" },
    { name: "Medical SM", class: "text-medical-sm", size: "14px" },
    { name: "Medical Base", class: "text-medical-base", size: "16px" },
    { name: "Medical LG", class: "text-medical-lg", size: "18px" },
    { name: "Medical XL", class: "text-medical-xl", size: "20px" },
    { name: "Medical 2XL", class: "text-medical-2xl", size: "24px" },
    { name: "Medical 3XL", class: "text-medical-3xl", size: "30px" },
    { name: "Medical 4XL", class: "text-medical-4xl", size: "36px" },
    { name: "Medical 5XL", class: "text-medical-5xl", size: "48px" },
  ];

  const contrastExamples = [
    { bg: "bg-background", text: "text-foreground", label: "Background / Foreground", ratio: "16.7:1" },
    { bg: "bg-primary", text: "text-primary-foreground", label: "Primary / Primary Foreground", ratio: "4.5:1" },
    { bg: "bg-card", text: "text-card-foreground", label: "Card / Card Foreground", ratio: "16.7:1" },
    { bg: "bg-muted", text: "text-muted-foreground", label: "Muted / Muted Foreground", ratio: "4.5:1" },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-surface">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary-light text-primary-foreground py-2xl">
          <div className="container mx-auto px-lg">
            <div className="max-w-4xl">
              <h1 className="text-medical-5xl font-bold mb-lg">
                EverMedical Design System
              </h1>
              <p className="text-medical-xl opacity-90 leading-relaxed">
                A comprehensive guide to our medical platform's design tokens, components, 
                accessibility standards, and responsive patterns. Built for healthcare professionals 
                with trust, clarity, and accessibility at its core.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-lg py-2xl">
          <Tabs defaultValue="overview" className="space-y-2xl">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 w-full h-auto p-1">
              <TabsTrigger value="overview" className="text-medical-sm">Overview</TabsTrigger>
              <TabsTrigger value="colors" className="text-medical-sm">Colors</TabsTrigger>
              <TabsTrigger value="typography" className="text-medical-sm">Typography</TabsTrigger>
              <TabsTrigger value="components" className="text-medical-sm">Components</TabsTrigger>
              <TabsTrigger value="accessibility" className="text-medical-sm">A11y</TabsTrigger>
              <TabsTrigger value="responsive" className="text-medical-sm">Responsive</TabsTrigger>
              <TabsTrigger value="guidelines" className="text-medical-sm">Guidelines</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Design System Overview</CardTitle>
                  <CardDescription>
                    Core principles and architecture of the EverMedical design system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-lg">
                  <div className="grid md:grid-cols-3 gap-lg">
                    <FeatureTile
                      icon={<Shield className="h-6 w-6" />}
                      title="Trust & Reliability"
                      description="Medical-grade design standards ensuring user confidence and safety"
                    />
                    <FeatureTile
                      icon={<Heart className="h-6 w-6" />}
                      title="Accessibility First"
                      description="WCAG AA compliant components with comprehensive screen reader support"
                    />
                    <FeatureTile
                      icon={<Zap className="h-6 w-6" />}
                      title="Performance Optimized"
                      description="Lightweight, semantic components built for healthcare workflows"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
                    <StatPill label="Components" value="40+" trend="up" />
                    <StatPill label="Color Tokens" value="15" trend="neutral" />
                    <StatPill label="Breakpoints" value="7" trend="neutral" />
                    <StatPill label="WCAG Level" value="AA" trend="up" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors */}
            <TabsContent value="colors" className="space-y-xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Color Palette</CardTitle>
                  <CardDescription>
                    Semantic color tokens designed for medical interfaces with proper contrast ratios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-lg">
                    {colorTokens.map((color) => (
                      <div key={color.name} className="space-y-sm">
                        <div className={cn("h-20 rounded-medical-md", color.class)} />
                        <div>
                          <h4 className="font-semibold text-heading">{color.name}</h4>
                          <p className="text-medical-sm text-muted font-mono">{color.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Contrast Validation</CardTitle>
                  <CardDescription>
                    All color combinations meet WCAG AA standards (4.5:1 minimum)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-md">
                    {contrastExamples.map((example, index) => (
                      <div key={index} className={cn("p-lg rounded-medical-md", example.bg)}>
                        <div className={cn("font-semibold", example.text)}>
                          {example.label} - Contrast Ratio: {example.ratio}
                        </div>
                        <p className={cn("text-medical-sm", example.text)}>
                          This text demonstrates readability at the specified contrast ratio
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Typography */}
            <TabsContent value="typography" className="space-y-xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Typography Scale</CardTitle>
                  <CardDescription>
                    Medical-optimized font sizes for enhanced readability across devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-lg">
                    {typographyScale.map((type) => (
                      <div key={type.name} className="flex items-baseline gap-lg">
                        <div className="w-32 text-medical-sm text-muted font-mono">
                          {type.name} ({type.size})
                        </div>
                        <div className={cn(type.class, "text-heading font-medium")}>
                          The quick brown fox jumps over the lazy dog
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Spacing System</CardTitle>
                  <CardDescription>
                    Consistent spacing tokens for generous, medical-appropriate layouts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-md">
                    {spacingTokens.map((space) => (
                      <div key={space.name} className="flex items-center gap-lg">
                        <div className="w-16 text-medical-sm text-muted font-mono">
                          {space.name}
                        </div>
                        <div 
                          className="bg-primary h-4 rounded-sm"
                          style={{ width: space.size }}
                        />
                        <span className="text-medical-sm text-body">{space.size}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Components */}
            <TabsContent value="components" className="space-y-xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Button Components</CardTitle>
                  <CardDescription>
                    Medical-grade buttons with proper touch targets and accessibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-lg">
                    <div>
                      <h4 className="font-semibold mb-md">Variants</h4>
                      <div className={cn("flex flex-wrap gap-md", isRTL && "flex-row-reverse")}>
                        <Button variant="default">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="hero">Hero</Button>
                        <Button variant="success">Success</Button>
                        <Button variant="warning">Warning</Button>
                        <Button variant="destructive">Destructive</Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-md">Sizes</h4>
                      <div className={cn("flex flex-wrap items-center gap-md", isRTL && "flex-row-reverse")}>
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                        <Button size="xl">Extra Large</Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-md">With Icons</h4>
                      <div className={cn("flex flex-wrap gap-md", isRTL && "flex-row-reverse")}>
                        <Button>
                          <CheckCircle className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          Approved
                        </Button>
                        <Button variant="outline">
                          <ArrowRight className={cn("h-4 w-4", isRTL ? "mr-2" : "ml-2")} />
                          Next Step
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Form Components</CardTitle>
                  <CardDescription>
                    Accessible form elements with proper labeling and error states
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md space-y-lg">
                    <div className="space-y-sm">
                      <Label htmlFor="email" className="text-medical-sm font-medium">
                        Email Address *
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email"
                        aria-describedby="email-help"
                        required
                      />
                      <p id="email-help" className="text-medical-xs text-muted">
                        We'll never share your email address
                      </p>
                    </div>

                    <div className="space-y-sm">
                      <Label htmlFor="password" className="text-medical-sm font-medium">
                        Password *
                      </Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Enter your password"
                        aria-describedby="password-requirements"
                        required
                      />
                      <p id="password-requirements" className="text-medical-xs text-muted">
                        Must be at least 8 characters with numbers and symbols
                      </p>
                    </div>

                    <Button className="w-full">Create Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accessibility */}
            <TabsContent value="accessibility" className="space-y-xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Accessibility Standards</CardTitle>
                  <CardDescription>
                    WCAG 2.1 AA compliance with comprehensive keyboard and screen reader support
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-lg">
                  <div className="grid md:grid-cols-2 gap-lg">
                    <div className="space-y-md">
                      <h4 className="font-semibold text-heading">✓ Implemented Features</h4>
                      <ul className="space-y-2 text-medical-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          Skip-to-content links on every page
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          Semantic HTML with proper landmark roles
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          ARIA labels and descriptions throughout
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          Keyboard navigation for all interactive elements
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          Focus management and visible focus indicators
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          44px minimum touch targets on mobile
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          Screen reader announcements for dynamic content
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          Reduced motion support for animations
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-md">
                      <h4 className="font-semibold text-heading">🎯 Testing Tools</h4>
                      <ul className="space-y-2 text-medical-sm">
                        <li>• Screen readers (NVDA, JAWS, VoiceOver)</li>
                        <li>• Keyboard navigation testing</li>
                        <li>• Color contrast analyzers</li>
                        <li>• axe DevTools integration</li>
                        <li>• Lighthouse accessibility audits</li>
                        <li>• Manual focus management testing</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-surface p-lg rounded-medical-md">
                    <h4 className="font-semibold text-heading mb-md">Try It: Keyboard Navigation</h4>
                    <p className="text-medical-sm text-body mb-lg">
                      Use Tab, Shift+Tab, Enter, Space, and Arrow keys to navigate this demo:
                    </p>
                    <div className="flex flex-wrap gap-md">
                      <Button size="sm">Button 1</Button>
                      <Button size="sm" variant="outline">Button 2</Button>
                      <Button size="sm" variant="ghost">Button 3</Button>
                      <Input placeholder="Focus me" className="w-48" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Responsive */}
            <TabsContent value="responsive" className="space-y-xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Responsive Breakpoints</CardTitle>
                  <CardDescription>
                    Mobile-first approach with comprehensive device support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Breakpoint</TableHead>
                        <TableHead>Width</TableHead>
                        <TableHead>Typical Devices</TableHead>
                        <TableHead>Layout Strategy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono">xs</TableCell>
                        <TableCell>475px+</TableCell>
                        <TableCell>Small phones</TableCell>
                        <TableCell>Single column, large touch targets</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono">sm</TableCell>
                        <TableCell>640px+</TableCell>
                        <TableCell>Phones, small tablets</TableCell>
                        <TableCell>Single/two column layouts</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono">md</TableCell>
                        <TableCell>768px+</TableCell>
                        <TableCell>Tablets</TableCell>
                        <TableCell>Two/three column grids</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono">lg</TableCell>
                        <TableCell>1024px+</TableCell>
                        <TableCell>Small laptops</TableCell>
                        <TableCell>Sidebar + main content</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono">xl</TableCell>
                        <TableCell>1280px+</TableCell>
                        <TableCell>Laptops, desktops</TableCell>
                        <TableCell>Full layout with sidebars</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono">2xl</TableCell>
                        <TableCell>1536px+</TableCell>
                        <TableCell>Large monitors</TableCell>
                        <TableCell>Wide layouts, max-width containers</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono">3xl</TableCell>
                        <TableCell>1920px+</TableCell>
                        <TableCell>Ultra-wide displays</TableCell>
                        <TableCell>Constrained width, centered content</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Touch & Interaction Guidelines</CardTitle>
                  <CardDescription>
                    Optimized for healthcare professionals using various devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-lg">
                    <div className="space-y-md">
                      <h4 className="font-semibold text-heading">Mobile Optimization</h4>
                      <ul className="space-y-2 text-medical-sm">
                        <li>• Minimum 44px touch targets</li>
                        <li>• Adequate spacing between interactive elements</li>
                        <li>• Thumb-friendly navigation placement</li>
                        <li>• Simplified mobile interfaces</li>
                        <li>• Gesture support where appropriate</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-md">
                      <h4 className="font-semibold text-heading">Desktop Enhancement</h4>
                      <ul className="space-y-2 text-medical-sm">
                        <li>• Hover states for better feedback</li>
                        <li>• Keyboard shortcuts for power users</li>
                        <li>• Context menus and advanced features</li>
                        <li>• Multi-column layouts for efficiency</li>
                        <li>• Precise cursor-based interactions</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Guidelines */}
            <TabsContent value="guidelines" className="space-y-xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Usage Guidelines</CardTitle>
                  <CardDescription>
                    Best practices for implementing the EverMedical design system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-lg">
                  <div className="space-y-lg">
                    <div>
                      <h4 className="font-semibold text-heading mb-md">Component Selection</h4>
                      <div className="bg-surface p-lg rounded-medical-md">
                        <p className="text-medical-sm text-body leading-relaxed">
                          Always choose components based on their semantic meaning and user context. 
                          For example, use the <code className="bg-muted px-1 rounded">hero</code> button variant 
                          for primary call-to-action elements, and <code className="bg-muted px-1 rounded">outline</code> 
                          for secondary actions. Consider the information hierarchy and user workflow when selecting variants.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-heading mb-md">Color Usage</h4>
                      <div className="bg-surface p-lg rounded-medical-md">
                        <p className="text-medical-sm text-body leading-relaxed">
                          Use semantic color tokens rather than direct color values. Status colors 
                          (success, warning, destructive) should be reserved for their intended purposes. 
                          The primary color should dominate the interface hierarchy, with secondary colors 
                          supporting the overall visual balance.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-heading mb-md">Spacing Consistency</h4>
                      <div className="bg-surface p-lg rounded-medical-md">
                        <p className="text-medical-sm text-body leading-relaxed">
                          Maintain generous spacing throughout medical interfaces to reduce cognitive load. 
                          Use the spacing scale consistently: xs for tight spacing, sm-md for related elements, 
                          lg-xl for section separation, and 2xl for major layout divisions.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-heading mb-md">Accessibility Requirements</h4>
                      <div className="bg-surface p-lg rounded-medical-md">
                        <p className="text-medical-sm text-body leading-relaxed">
                          Every interactive element must be keyboard accessible and properly labeled. 
                          Ensure sufficient color contrast, provide text alternatives for visual elements, 
                          and test with screen readers. Consider users with motor difficulties by 
                          maintaining adequate touch targets and hover areas.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-heading">Implementation Checklist</CardTitle>
                  <CardDescription>
                    Quality assurance steps for every component implementation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-lg">
                    <div className="space-y-md">
                      <h4 className="font-semibold text-heading">Before Development</h4>
                      <ul className="space-y-2 text-medical-sm">
                        <li className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-border rounded-sm mt-0.5 flex-shrink-0" />
                          Review design tokens for colors and spacing
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-border rounded-sm mt-0.5 flex-shrink-0" />
                          Plan keyboard navigation flow
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-border rounded-sm mt-0.5 flex-shrink-0" />
                          Define ARIA requirements
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-border rounded-sm mt-0.5 flex-shrink-0" />
                          Consider RTL language support
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-md">
                      <h4 className="font-semibold text-heading">After Implementation</h4>
                      <ul className="space-y-2 text-medical-sm">
                        <li className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-border rounded-sm mt-0.5 flex-shrink-0" />
                          Test with keyboard navigation only
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-border rounded-sm mt-0.5 flex-shrink-0" />
                          Verify screen reader announcements
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-border rounded-sm mt-0.5 flex-shrink-0" />
                          Check color contrast ratios
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-border rounded-sm mt-0.5 flex-shrink-0" />
                          Test on mobile devices
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}