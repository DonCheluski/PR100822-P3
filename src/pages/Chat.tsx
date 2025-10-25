import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Loader2, Bot, User } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu asistente de inventario. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getInventoryContext = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('name, sku, quantity, location')
        .limit(50);

      if (error) throw error;

      if (!data || data.length === 0) {
        return "El inventario está vacío actualmente.";
      }

      return data.map(item => 
        `- ${item.name} (SKU: ${item.sku}): ${item.quantity} unidades${item.location ? ` en ${item.location}` : ''}`
      ).join('\n');
    } catch (error) {
      return "No se pudo cargar la información del inventario.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const inventoryContext = await getInventoryContext();

      const { data, error } = await supabase.functions.invoke('chat-inventory', {
        body: {
          messages: [...messages, userMessage],
          inventoryContext,
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || 'Lo siento, no pude procesar tu solicitud.'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar tu mensaje. Por favor intenta de nuevo.",
        variant: "destructive",
      });
      
      // Remover el mensaje del usuario si hubo error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card shadow-sm"
              style={{ background: 'var(--gradient-header)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Asistente de Inventario</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-3xl space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <Card className={`px-4 py-3 max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </Card>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-secondary" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Card className="px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe tu pregunta sobre el inventario..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;