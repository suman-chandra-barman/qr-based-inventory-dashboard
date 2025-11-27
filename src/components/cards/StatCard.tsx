import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { StatCardProps } from "@/types";

const StatCard: React.FC<StatCardProps> = ({ title, value, className }) => {
  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className={`text-sm font-medium ${
            title === "Total Product"
              ? "text-white"
              : "text-muted-foreground"
          }`}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div
            className={`text-2xl font-bold ${
              title === "Total Product" ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;