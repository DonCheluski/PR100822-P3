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
      className="cursor-pointer active:scale-98 transition-all duration-200"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-3 bg-gradient-to-br from-primary to-primary-glow rounded-2xl shadow-lg shadow-primary/20">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate font-bold">{item.name}</CardTitle>
              <p className="text-xs text-muted-foreground font-medium">SKU: {item.sku}</p>
            </div>
          </div>
          <Badge variant={status.variant} className="shrink-0">{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Cantidad:</span>
          <span className="font-bold text-base text-foreground">{item.quantity}</span>
        </div>
        {item.location && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ubicación:</span>
            <span className="font-semibold text-foreground">{item.location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};