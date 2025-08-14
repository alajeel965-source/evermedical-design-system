import { AppShell } from "@/components/shared/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatPill } from "@/components/shared/StatPill";
import { FeatureTile } from "@/components/shared/FeatureTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Heart, 
  Star, 
  Users, 
  Calendar, 
  Settings,
  Database,
  FileText,
  Plus
} from "lucide-react";

export default function Styleguide() {
  return (
    <AppShell>
      <div className="container mx-auto p-lg space-y-2xl">
        {/* Header */}
        <div className="text-center space-y-md">
          <h1 className="text-heading font-bold text-medical-4xl">Design System Styleguide</h1>
          <p className="text-body text-medical-lg max-w-2xl mx-auto">
            Comprehensive showcase of the EverMedical design system components and tokens.
          </p>
        </div>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Medical brand colors and semantic tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <div className="space-y-sm">
                <div className="w-full h-16 bg-primary rounded-medical-sm"></div>
                <p className="text-medical-sm font-medium">Primary</p>
              </div>
              <div className="space-y-sm">
                <div className="w-full h-16 bg-secondary rounded-medical-sm"></div>
                <p className="text-medical-sm font-medium">Secondary</p>
              </div>
              <div className="space-y-sm">
                <div className="w-full h-16 bg-sky rounded-medical-sm"></div>
                <p className="text-medical-sm font-medium">Sky</p>
              </div>
              <div className="space-y-sm">
                <div className="w-full h-16 bg-accent rounded-medical-sm"></div>
                <p className="text-medical-sm font-medium">Accent</p>
              </div>
              <div className="space-y-sm">
                <div className="w-full h-16 bg-success rounded-medical-sm"></div>
                <p className="text-medical-sm font-medium">Success</p>
              </div>
              <div className="space-y-sm">
                <div className="w-full h-16 bg-warning rounded-medical-sm"></div>
                <p className="text-medical-sm font-medium">Warning</p>
              </div>
              <div className="space-y-sm">
                <div className="w-full h-16 bg-destructive rounded-medical-sm"></div>
                <p className="text-medical-sm font-medium">Destructive</p>
              </div>
              <div className="space-y-sm">
                <div className="w-full h-16 bg-muted rounded-medical-sm"></div>
                <p className="text-medical-sm font-medium">Muted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Scale */}
        <Card>
          <CardHeader>
            <CardTitle>Typography Scale</CardTitle>
            <CardDescription>Medical typography system with semantic sizing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="text-medical-5xl font-bold text-heading">Heading 5XL</div>
            <div className="text-medical-4xl font-bold text-heading">Heading 4XL</div>
            <div className="text-medical-3xl font-bold text-heading">Heading 3XL</div>
            <div className="text-medical-2xl font-semibold text-heading">Heading 2XL</div>
            <div className="text-medical-xl font-semibold text-heading">Heading XL</div>
            <div className="text-medical-lg font-medium text-heading">Heading Large</div>
            <div className="text-medical-base text-body">Body text (base)</div>
            <div className="text-medical-sm text-body">Small body text</div>
            <div className="text-medical-xs text-muted">Extra small text</div>
          </CardContent>
        </Card>

        {/* Spacing System */}
        <Card>
          <CardHeader>
            <CardTitle>Spacing System</CardTitle>
            <CardDescription>Consistent spacing tokens for medical interfaces</CardDescription>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="space-y-sm">
              <div className="flex items-center gap-md">
                <div className="w-xs h-4 bg-primary rounded"></div>
                <span className="text-medical-sm">XS (0.5rem)</span>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-sm h-4 bg-primary rounded"></div>
                <span className="text-medical-sm">SM (1rem)</span>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-md h-4 bg-primary rounded"></div>
                <span className="text-medical-sm">MD (1.5rem)</span>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-lg h-4 bg-primary rounded"></div>
                <span className="text-medical-sm">LG (2rem)</span>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-xl h-4 bg-primary rounded"></div>
                <span className="text-medical-sm">XL (3rem)</span>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-2xl h-4 bg-primary rounded"></div>
                <span className="text-medical-sm">2XL (4rem)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Various button styles and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-lg">
            <div className="space-y-md">
              <h4 className="text-medical-lg font-semibold">Variants</h4>
              <div className="flex flex-wrap gap-md">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="hero">Hero</Button>
                <Button variant="hero-secondary">Hero Secondary</Button>
                <Button variant="hero-ghost">Hero Ghost</Button>
              </div>
            </div>
            <div className="space-y-md">
              <h4 className="text-medical-lg font-semibold">Sizes</h4>
              <div className="flex flex-wrap items-center gap-md">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Search className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Components</CardTitle>
            <CardDescription>Status indicators and labels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-lg">
            <div className="space-y-md">
              <h4 className="text-medical-lg font-semibold">Variants</h4>
              <div className="flex flex-wrap gap-md">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Error</Badge>
                <Badge variant="sky">Sky</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="draft">Draft</Badge>
              </div>
            </div>
            <div className="space-y-md">
              <h4 className="text-medical-lg font-semibold">Shapes</h4>
              <div className="flex flex-wrap gap-md">
                <Badge>Default</Badge>
                <Badge shape="pill">Pill Shape</Badge>
                <Badge variant="success" shape="pill">Success Pill</Badge>
                <Badge variant="draft" shape="pill">Draft Pill</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Components */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>Input fields and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="space-y-md">
                <Input placeholder="Text input..." />
                <Input type="email" placeholder="Email input..." />
                <Input type="password" placeholder="Password input..." />
                <div className="flex items-center space-x-sm">
                  <Checkbox id="terms" />
                  <label htmlFor="terms" className="text-medical-sm">Accept terms</label>
                </div>
              </div>
              <div className="space-y-md">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards and Tiles */}
        <Card>
          <CardHeader>
            <CardTitle>Cards and Tiles</CardTitle>
            <CardDescription>Content containers and feature displays</CardDescription>
          </CardHeader>
          <CardContent className="space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <StatPill label="Total Users" value="1,234" trend="up" />
              <StatPill label="Active Sessions" value="567" trend="neutral" />
              <StatPill label="Error Rate" value="2.1%" trend="down" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <FeatureTile
                icon={<Heart className="h-6 w-6" />}
                title="Patient Care"
                description="Comprehensive patient management and care coordination"
              />
              <FeatureTile
                icon={<Users className="h-6 w-6" />}
                title="Team Collaboration"
                description="Seamless collaboration between medical professionals"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tables */}
        <Card>
          <CardHeader>
            <CardTitle>Table Components</CardTitle>
            <CardDescription>Data display and table variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-lg">
            <div className="space-y-md">
              <h4 className="text-medical-lg font-semibold">Default Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Dr. Smith</TableCell>
                    <TableCell><Badge variant="success">Active</Badge></TableCell>
                    <TableCell>Cardiologist</TableCell>
                    <TableCell><Button size="sm" variant="outline">Edit</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Dr. Johnson</TableCell>
                    <TableCell><Badge variant="warning">Pending</Badge></TableCell>
                    <TableCell>Surgeon</TableCell>
                    <TableCell><Button size="sm" variant="outline">Edit</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="space-y-md">
              <h4 className="text-medical-lg font-semibold">Striped Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow variant="striped">
                    <TableCell>001</TableCell>
                    <TableCell>John Doe</TableCell>
                    <TableCell>2024-01-15</TableCell>
                    <TableCell><Badge variant="success">Healthy</Badge></TableCell>
                  </TableRow>
                  <TableRow variant="striped">
                    <TableCell>002</TableCell>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell>2024-01-14</TableCell>
                    <TableCell><Badge variant="warning">Follow-up</Badge></TableCell>
                  </TableRow>
                  <TableRow variant="striped">
                    <TableCell>003</TableCell>
                    <TableCell>Bob Wilson</TableCell>
                    <TableCell>2024-01-13</TableCell>
                    <TableCell><Badge variant="success">Healthy</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-md">
              <h4 className="text-medical-lg font-semibold">Compact Table</h4>
              <Table variant="compact">
                <TableHeader>
                  <TableRow>
                    <TableHead compact>ID</TableHead>
                    <TableHead compact>Type</TableHead>
                    <TableHead compact>Date</TableHead>
                    <TableHead compact>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell compact>001</TableCell>
                    <TableCell compact>RFQ</TableCell>
                    <TableCell compact>Jan 15</TableCell>
                    <TableCell compact><Badge variant="draft" shape="pill">Draft</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell compact>002</TableCell>
                    <TableCell compact>Order</TableCell>
                    <TableCell compact>Jan 14</TableCell>
                    <TableCell compact><Badge variant="success" shape="pill">Active</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tab Components</CardTitle>
            <CardDescription>Content organization and navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-lg">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-md">
                <h4 className="text-medical-lg font-semibold">Overview Tab</h4>
                <p className="text-body">This is the overview tab content with general information.</p>
              </TabsContent>
              <TabsContent value="analytics" className="space-y-md">
                <h4 className="text-medical-lg font-semibold">Analytics Tab</h4>
                <p className="text-body">Analytics and metrics would be displayed here.</p>
              </TabsContent>
              <TabsContent value="reports" className="space-y-md">
                <h4 className="text-medical-lg font-semibold">Reports Tab</h4>
                <p className="text-body">Generated reports and documents would be shown here.</p>
              </TabsContent>
              <TabsContent value="settings" className="space-y-md">
                <h4 className="text-medical-lg font-semibold">Settings Tab</h4>
                <p className="text-body">Configuration and preference options would be available here.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Empty States */}
        <Card>
          <CardHeader>
            <CardTitle>Empty State Components</CardTitle>
            <CardDescription>Placeholders for empty content areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <EmptyState
                icon={<Database className="h-8 w-8" />}
                title="No Data Available"
                description="There's no data to display at the moment. Try adjusting your filters or check back later."
                action={<Button><Plus className="h-4 w-4 mr-2" />Add New Item</Button>}
              />
              <EmptyState
                icon={<FileText className="h-8 w-8" />}
                title="No Documents Found"
                description="No documents match your current search criteria."
                action={<Button variant="outline">Clear Filters</Button>}
              />
            </div>
          </CardContent>
        </Card>

        {/* Shadow System */}
        <Card>
          <CardHeader>
            <CardTitle>Shadow System</CardTitle>
            <CardDescription>Elevation and depth tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <div className="p-lg bg-card rounded-medical-md shadow-soft">
                <h4 className="font-semibold">Soft Shadow</h4>
                <p className="text-medical-sm text-muted">Subtle elevation</p>
              </div>
              <div className="p-lg bg-card rounded-medical-md shadow-medical">
                <h4 className="font-semibold">Medical Shadow</h4>
                <p className="text-medical-sm text-muted">Standard elevation</p>
              </div>
              <div className="p-lg bg-card rounded-medical-md shadow-medical-lg">
                <h4 className="font-semibold">Large Shadow</h4>
                <p className="text-medical-sm text-muted">Prominent elevation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Border Radius System */}
        <Card>
          <CardHeader>
            <CardTitle>Border Radius System</CardTitle>
            <CardDescription>Medical design system radius tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <div className="space-y-sm">
                <div className="w-full h-16 bg-primary rounded-medical-sm"></div>
                <p className="text-medical-sm font-medium">Small (inputs)</p>
              </div>
              <div className="space-y-sm">
                <div className="w-full h-16 bg-primary rounded-medical-md"></div>
                <p className="text-medical-sm font-medium">Medium (cards)</p>
              </div>
              <div className="space-y-sm">
                <div className="w-full h-16 bg-primary rounded-medical-lg"></div>
                <p className="text-medical-sm font-medium">Large (pills)</p>
              </div>
              <div className="space-y-sm">
                <div className="w-full h-16 bg-primary rounded-full"></div>
                <p className="text-medical-sm font-medium">Full (circular)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}