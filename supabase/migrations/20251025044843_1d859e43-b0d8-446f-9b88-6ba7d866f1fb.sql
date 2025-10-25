-- Tabla de inventario
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_inventory_user_id ON public.inventory_items(user_id);
CREATE INDEX idx_inventory_sku ON public.inventory_items(sku);
CREATE INDEX idx_inventory_name ON public.inventory_items(name);

-- Habilitar RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: los usuarios solo ven sus propios items
CREATE POLICY "Users can view their own inventory items" 
ON public.inventory_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory items" 
ON public.inventory_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items" 
ON public.inventory_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items" 
ON public.inventory_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();