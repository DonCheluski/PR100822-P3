import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface InventoryItemCardProps {
  item: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    location?: string;
  };
  onClick: () => void;
}

export const InventoryItemCard = ({ item, onClick }: InventoryItemCardProps) => {
  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: "Sin stock", variant: "destructive" as const };
    if (qty < 10) return { label: "Stock bajo", variant: "secondary" as const };
    return { label: "En stock", variant: "default" as const };
  };

  const status = getStockStatus(item.quantity);

  return (
    <Card 
      className="cursor-pointer hover:shadow-[var(--shadow-hover)] transition-[var(--transition-smooth)]"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-accent rounded-lg">
              <Package className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{item.name}</CardTitle>
              <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
            </div>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Cantidad:</span>
          <span className="font-semibold">{item.quantity} unidades</span>
        </div>
        {item.location && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Ubicación:</span>
            <span className="font-medium">{item.location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};