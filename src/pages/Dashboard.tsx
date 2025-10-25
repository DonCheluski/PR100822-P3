import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { InventoryItemCard } from "@/components/InventoryItemCard";
import { Package, Plus, LogOut, MessageSquare, Search, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10"
              style={{ background: 'var(--gradient-header)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Inventory AI</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/chat")}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card p-6 rounded-lg shadow-[var(--shadow-card)]">
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-[var(--shadow-card)]">
            <p className="text-sm text-muted-foreground">Stock Bajo</p>
            <p className="text-3xl font-bold text-secondary">{stats.lowStock}</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-[var(--shadow-card)]">
            <p className="text-sm text-muted-foreground">Sin Stock</p>
            <p className="text-3xl font-bold text-destructive">{stats.outOfStock}</p>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => navigate("/add-item")}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Item
          </Button>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay items en el inventario</h3>
            <p className="text-muted-foreground mb-4">
              {search ? "No se encontraron resultados para tu búsqueda." : "Comienza agregando tu primer item."}
            </p>
            {!search && (
              <Button onClick={() => navigate("/add-item")}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primer Item
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/item/${item.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;