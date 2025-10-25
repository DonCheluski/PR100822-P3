import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, Hash, MapPin, Boxes, Loader2 } from "lucide-react";

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
        title: "¡Artículo agregado!",
        description: "Se guardó correctamente en el inventario.",
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
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-br from-primary via-primary to-primary-dark text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-3 pb-6">
            <div className="mx-auto p-4 bg-gradient-to-br from-primary to-primary-glow rounded-2xl shadow-lg shadow-primary/30">
              <Package className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl text-center">Nuevo artículo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Nombre del artículo
                </label>
                <Input
                  placeholder="Ej: Laptop Dell XPS 13"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  Código SKU
                </label>
                <Input
                  placeholder="Ej: LAP-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-primary" />
                  Cantidad
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-12 text-base"
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Ubicación <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Input
                  placeholder="Ej: Almacén A, Estante 3"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base mt-8" disabled={loading} size="lg">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Agregar al inventario
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddItem;
