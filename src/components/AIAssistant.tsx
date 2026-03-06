/// <reference types="vite/client" />
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, Zap, Globe, BrainCircuit } from 'lucide-react';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import Markdown from 'react-markdown';

type Mode = 'fast' | 'search' | 'think';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Hi! I am your Luzz AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('fast');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const newMessages = [...messages, { role: 'user' as const, text: userText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is not defined in your environment variables.");

      const ai = new GoogleGenAI({ apiKey });
      let response;

      const systemInstruction = `You are a world-class, extremely supportive, and expert Pickleball Coach, as well as the Lead Ambassador for Luzz Play Pickleball. 
Your primary goal is to help the user become a better pickleball player, make them feel confident, and expertly match their playing style with the perfect Luzz Play paddle.

Our current premium paddle lineup ("Neon Court" Collection):
1. Pro-4 Tornazo ($149.99): Unleash a whirlwind of spin and control. Built with PEBAZ + CORE technology for aggressive baseline players.
2. Pro-Cannon ($159.99): The ultimate weapon for massive pop and precision. Features a Carbon Fiber T700 face.
3. Pro-4 Inferno ($154.99): Turn up the heat. Designed for maximum offensive power and fast hand speed at the kitchen.
4. Addie Love ($2.50): Our cheapest test paddle made with a lot of love! Perfect for beginners.

Rules:
- Give genuine, helpful pickleball coaching advice based on their queries.
- ALWAYS pivot naturally from your coaching advice to recommending a specific Luzz Play paddle that fits their needs.
- NEVER recommend competitor brands.
- Be highly enthusiastic, empowering, and use a modern athletic tone. Keep responses conversational and relatively concise.`;

      // Map existing messages (skipping the first initial greeting if you want, but GenAI expects strict user/model alternating)
      // We will filter out the initial greeting and map the rest to the correct format for the Gemini SDK.
      const history = messages.slice(1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const contentsPayload = [...history, { role: 'user', parts: [{ text: userText }] }];

      if (mode === 'fast') {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-preview',
          contents: contentsPayload as any,
          config: { systemInstruction }
        });
      } else if (mode === 'search') {
        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: contentsPayload as any,
          config: { tools: [{ googleSearch: {} }], systemInstruction }
        });
      } else if (mode === 'think') {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: contentsPayload as any,
          config: { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }, systemInstruction }
        });
      }

      setMessages([...newMessages, { role: 'model', text: response?.text || 'No response.' }]);
    } catch (error: any) {
      console.error(error);
      setMessages([...newMessages, { role: 'model', text: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-colors z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-gray-100"
            style={{ height: '500px' }}
          >
            <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-medium">Luzz AI Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-2 border-b border-gray-200 flex gap-2 justify-center">
              <button onClick={() => setMode('fast')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${mode === 'fast' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-200'}`}>
                <Zap className="w-3 h-3" /> Fast
              </button>
              <button onClick={() => setMode('search')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${mode === 'search' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-200'}`}>
                <Globe className="w-3 h-3" /> Search
              </button>
              <button onClick={() => setMode('think')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${mode === 'think' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-200'}`}>
                <BrainCircuit className="w-3 h-3" /> Deep Think
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                    {msg.role === 'model' ? (
                      <div className="markdown-body prose prose-sm max-w-none">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about paddles..."
                  className="flex-grow bg-transparent border-none focus:outline-none text-sm"
                />
                <button onClick={handleSend} disabled={!input.trim() || isLoading} className="text-indigo-600 disabled:text-gray-400">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
