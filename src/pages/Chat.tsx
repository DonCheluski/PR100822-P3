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
    { role: 'assistant', content: '¡Hola! 👋 Soy tu asistente de inventario con IA. Pregúntame sobre tus productos, stock o cualquier cosa del inventario.' }
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
      <header className="bg-gradient-to-br from-primary via-primary to-primary-dark text-primary-foreground shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-primary-foreground hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Asistente IA</h1>
                <p className="text-xs text-primary-foreground/80">Siempre listo para ayudarte</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 items-start ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-primary to-primary-glow"
                  : "bg-gradient-to-br from-secondary to-secondary/80"
              }`}>
                {msg.role === "user" ? (
                  <User className="h-5 w-5 text-white" />
                ) : (
                  <Bot className="h-5 w-5 text-white" />
                )}
              </div>
              <Card
                className={`p-4 max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground border-0"
                    : "bg-card"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <Card className="p-4 bg-card">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-3 bg-card p-4 rounded-2xl border shadow-lg">
          <Input
            placeholder="Pregunta sobre tu inventario..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="border-0 bg-muted/50 h-12 text-base"
          />
          <Button 
            onClick={handleSend} 
            disabled={loading || !input.trim()}
            size="icon"
            className="h-12 w-12 shrink-0"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Chat;
