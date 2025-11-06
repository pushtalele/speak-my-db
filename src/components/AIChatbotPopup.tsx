import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageSquare, X, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIChatbotPopup = () => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      // Validate API key exists
      if (!OPENAI_API_KEY) {
        throw new Error("OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a helpful medical research assistant for CuraLink, a platform connecting patients and researchers. 
              You help users find clinical trials, research papers, and health experts. 
              Provide accurate, empathetic, and helpful responses about medical research and healthcare.
              Always remind users to consult healthcare professionals for medical advice.`
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response from OpenAI API");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-[var(--shadow-elegant)] bg-accent hover:bg-accent/90 z-50"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}

      {/* Popup Card */}
      {isOpen && !isMinimized && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] flex flex-col shadow-[var(--shadow-elegant)] z-50 border-accent/20">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">AI Chat Assistant</h3>
              <p className="text-sm text-muted-foreground">Ask me anything about health</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation by sending a message</p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                disabled={loading}
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Minimized State */}
      {isOpen && isMinimized && (
        <Card
          className="fixed bottom-6 right-6 p-4 shadow-[var(--shadow-elegant)] z-50 border-accent/20 cursor-pointer hover:bg-secondary/50 transition-all"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            <span className="font-medium">AI Chat Assistant</span>
            {messages.length > 0 && (
              <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                {messages.length}
              </span>
            )}
          </div>
        </Card>
      )}
    </>
  );
};

export default AIChatbotPopup;
