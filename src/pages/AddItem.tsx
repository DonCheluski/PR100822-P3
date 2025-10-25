import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const AddItem = () => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { error } = await supabase
        .from('inventory_items')
        .insert({
          name,
          sku,
          quantity: parseInt(quantity),
          location: location || null,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "¡Item agregado!",
        description: "El item ha sido agregado al inventario exitosamente.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el item.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Agregar Nuevo Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Laptop Dell XPS 15"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  placeholder="Ej: DELL-XPS15-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación (opcional)</Label>
                <Input
                  id="location"
                  placeholder="Ej: Bodega A - Estante 3"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Item
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddItem;