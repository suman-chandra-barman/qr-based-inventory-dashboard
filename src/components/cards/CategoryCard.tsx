import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  onClick?: () => void;
  onEdit?: () => void;
  className?: string;
}

function CategoryCard({
  name,
  image,
  onClick,
  onEdit,
  className,
}: ProductCardProps) {
  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] py-0 ${className}`}
    >
      <CardContent className="p-4">
        <div
          className="aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center"
          onClick={onClick}
        >
          <img
            src={image}
            alt={name}
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="space-y-1" onClick={onClick}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
            {name}
          </h3>
        </div>
        {onEdit && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-full mt-3 bg-[#383838] hover:bg-[#2a2a2a] text-white"
            size="sm"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default CategoryCard;
