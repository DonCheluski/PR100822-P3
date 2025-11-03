import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, inventoryContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Chat request received with', messages.length, 'messages');

    const systemPrompt = `Eres un asistente de inventario inteligente y útil. 
Tu trabajo es ayudar a los usuarios a gestionar su inventario respondiendo preguntas sobre sus productos.

${inventoryContext ? `Contexto del inventario actual:\n${inventoryContext}` : 'No hay items en el inventario aún.'}

Puedes ayudar con:
- Consultas sobre stock disponible
- Búsqueda de productos por nombre o SKU
- Sugerencias sobre reabastecimiento
- Análisis de tendencias de inventario
- Recomendaciones de organización
- **CREAR CARRITOS DE COMPRA AUTOMÁTICOS**: Cuando el usuario pida "armar un carrito", "crear una lista de compras", o "preparar un pedido", genera una lista organizada de items que necesitan reabastecerse, priorizando los que están agotados o con stock bajo.

Cuando crees un carrito de compra:
1. Identifica items con stock bajo (menos de 10 unidades) o agotados (0 unidades)
2. Presenta la lista en formato claro con:
   - Nombre del producto
   - SKU
   - Cantidad actual
   - Cantidad sugerida para pedir (basada en el stock actual)
3. Ordena por prioridad (agotados primero, luego stock bajo)
4. Incluye un total de items y cantidad total sugerida

Responde de forma clara, concisa y profesional en español.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ 
          error: 'Límite de uso excedido. Por favor intenta más tarde.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ 
          error: 'Se requiere agregar créditos para continuar usando la IA.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Error al comunicarse con el servicio de IA');
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-inventory function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar la solicitud';
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});