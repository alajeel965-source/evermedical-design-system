import { Star, ShoppingCart, Verified } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  vendor: string;
  price: string;
  rating: number;
  reviewCount: number;
  isInStock: boolean;
  isVerified?: boolean;
  category: string;
  onClick?: () => void;
}

export function ProductCard({
  image,
  title,
  vendor,
  price,
  rating,
  reviewCount,
  isInStock,
  isVerified = false,
  category,
  onClick,
}: ProductCardProps) {
  return (
    <Card 
      className="rounded-medical-md shadow-soft hover:shadow-medical transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] bg-surface rounded-t-medical-md overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-sm right-sm">
            <Badge variant={isInStock ? "secondary" : "destructive"} className="text-medical-xs">
              {isInStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>
          {isVerified && (
            <div className="absolute top-sm left-sm">
              <Badge variant="default" className="bg-success text-medical-xs">
                <Verified className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-lg space-y-sm">
        <div className="space-y-xs">
          <Badge variant="outline" className="text-medical-xs">
            {category}
          </Badge>
          <h3 className="font-semibold text-heading text-medical-base line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-body text-medical-sm">{vendor}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-medical-sm font-medium">{rating}</span>
            <span className="text-muted-foreground text-medical-sm">
              ({reviewCount})
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-sm">
          <div className="text-primary font-bold text-medical-lg">{price}</div>
          <Button
            size="sm"
            disabled={!isInStock}
            className="h-8 px-3"
            onClick={(e) => {
              e.stopPropagation();
              // Handle add to cart
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}