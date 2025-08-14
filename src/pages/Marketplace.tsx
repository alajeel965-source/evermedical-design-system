import { useState } from "react";
import { PageLayout } from "@/components/templates/PageLayout";
import { ProductCard } from "@/components/templates/cards/ProductCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/shared/EmptyState";

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
      title: "Category",
      items: [
        { value: "ultrasound", label: "Ultrasound", count: 45 },
        { value: "mri", label: "MRI", count: 23 },
        { value: "xray", label: "X-Ray", count: 67 },
        { value: "surgical", label: "Surgical Tools", count: 156 },
      ],
    },
    {
      title: "Price Range",
      items: [
        { value: "under-1k", label: "Under $1,000", count: 78 },
        { value: "1k-10k", label: "$1,000 - $10,000", count: 134 },
        { value: "10k-50k", label: "$10,000 - $50,000", count: 89 },
        { value: "over-50k", label: "Over $50,000", count: 34 },
      ],
    },
    {
      title: "Vendor Rating",
      items: [
        { value: "5-star", label: "5 Stars", count: 45 },
        { value: "4-star", label: "4+ Stars", count: 123 },
        { value: "3-star", label: "3+ Stars", count: 78 },
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
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
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
        </div>
      )}
    </PageLayout>
  );
}