import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { InventoryItemCard } from "@/components/InventoryItemCard";
import { Package, Plus, LogOut, MessageSquare, Search } from "lucide-react";

const Dashboard = () => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchItems();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los items del inventario.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: items.length,
    lowStock: items.filter(i => i.quantity < 10 && i.quantity > 0).length,
    outOfStock: items.filter(i => i.quantity === 0).length,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header con gradiente */}
      <header className="bg-gradient-to-br from-primary via-primary to-primary-dark text-primary-foreground sticky top-0 z-10 shadow-xl shadow-primary/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold">Mi Inventario</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/chat")}
                className="text-primary-foreground hover:bg-white/20"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-white/20"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar artículo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-white/95 backdrop-blur-sm border-0 shadow-lg text-base"
            />
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-card to-card/80 p-4 rounded-2xl shadow-[var(--shadow-card)] border border-border/50">
            <p className="text-xs text-muted-foreground font-medium mb-1">Total</p>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-card to-card/80 p-4 rounded-2xl shadow-[var(--shadow-card)] border border-border/50">
            <p className="text-xs text-muted-foreground font-medium mb-1">Bajo</p>
            <p className="text-2xl font-bold text-secondary">{stats.lowStock}</p>
          </div>
          <div className="bg-gradient-to-br from-card to-card/80 p-4 rounded-2xl shadow-[var(--shadow-card)] border border-border/50">
            <p className="text-xs text-muted-foreground font-medium mb-1">Agotado</p>
            <p className="text-2xl font-bold text-destructive">{stats.outOfStock}</p>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Cargando inventario...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="p-6 bg-gradient-to-br from-muted to-muted/50 rounded-3xl inline-block mb-4">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {search ? "Sin resultados" : "Inventario vacío"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search
                ? "No encontramos artículos con ese nombre"
                : "¡Comienza agregando tu primer artículo!"}
            </p>
            {!search && (
              <Button onClick={() => navigate("/add-item")} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Agregar artículo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 animate-fade-in">
            {filteredItems.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/item/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante para agregar */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => navigate("/add-item")}
          size="lg"
          className="h-16 w-16 rounded-full shadow-2xl shadow-primary/40 hover:shadow-primary/60"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
