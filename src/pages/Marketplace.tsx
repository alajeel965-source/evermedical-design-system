import { useState } from "react";
import { PageLayout } from "@/components/templates/PageLayout";
import { ProductCard } from "@/components/templates/cards/ProductCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const tabs = [
    { value: "all", label: "All Products" },
    { value: "equipment", label: "Equipment" },
    { value: "supplies", label: "Supplies" },
    { value: "services", label: "Services" },
  ];

  const filters = [
    {
      title: "Specialty",
      items: [
        { value: "cardiology", label: "Cardiology", count: 45 },
        { value: "radiology", label: "Radiology", count: 67 },
        { value: "surgery", label: "Surgery", count: 156 },
        { value: "oncology", label: "Oncology", count: 23 },
        { value: "pediatrics", label: "Pediatrics", count: 34 },
      ],
    },
    {
      title: "Region",
      items: [
        { value: "north-america", label: "North America", count: 234 },
        { value: "europe", label: "Europe", count: 189 },
        { value: "asia-pacific", label: "Asia Pacific", count: 156 },
        { value: "middle-east", label: "Middle East", count: 78 },
        { value: "africa", label: "Africa", count: 45 },
      ],
    },
    {
      title: "Certification",
      items: [
        { value: "fda-approved", label: "FDA Approved", count: 167 },
        { value: "ce-marked", label: "CE Marked", count: 145 },
        { value: "iso-certified", label: "ISO Certified", count: 123 },
        { value: "verified-vendor", label: "Verified Vendor", count: 89 },
      ],
    },
  ];

  const products = [
    {
      id: "1",
      image: "/placeholder.svg",
      title: "Portable Ultrasound Scanner Pro",
      vendor: "MedTech Solutions",
      price: "$15,999",
      rating: 4.8,
      reviewCount: 34,
      isInStock: true,
      isVerified: true,
      category: "Ultrasound",
    },
    {
      id: "2", 
      image: "/placeholder.svg",
      title: "Digital X-Ray System",
      vendor: "Radiology Plus",
      price: "$45,000",
      rating: 4.6,
      reviewCount: 28,
      isInStock: true,
      isVerified: true,
      category: "X-Ray",
    },
    {
      id: "3",
      image: "/placeholder.svg", 
      title: "Surgical Instrument Set",
      vendor: "SurgTech Inc",
      price: "$2,850",
      rating: 4.9,
      reviewCount: 67,
      isInStock: false,
      isVerified: false,
      category: "Surgical",
    },
  ];

  const handleFilterChange = (groupTitle: string, value: string, checked: boolean) => {
    setSelectedFilters(prev => ({
      ...prev,
      [groupTitle]: checked
        ? [...(prev[groupTitle] || []), value]
        : (prev[groupTitle] || []).filter(f => f !== value)
    }));
  };

  return (
    <PageLayout
      title="Marketplace"
      subtitle="Discover medical equipment, supplies, and services from verified vendors"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchPlaceholder="Search products, vendors, or equipment..."
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      filters={filters}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      view={view}
      onViewChange={setView}
    >
      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your filters or search terms"
          action={
            <Button variant="outline" onClick={() => setSelectedFilters({})}>
              Clear filters
            </Button>
          }
        />
      ) : view === "grid" ? (
        <div className="space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          <div className="flex justify-center">
            <Pagination />
          </div>
        </div>
      ) : (
        <div className="space-y-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.vendor}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.rating} ({product.reviewCount})</TableCell>
                  <TableCell>{product.isInStock ? "In Stock" : "Out of Stock"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center">
            <Pagination />
          </div>
        </div>
      )}
    </PageLayout>
  );
}