import React, { useState } from 'react';
import { Send, Bot, X, Loader2 } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Hello! I am your WorkSphere HR Assistant. Ask me anything about employees, today\'s attendance, or payroll costs.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMsgs = [...messages, { sender: 'user' as const, text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await axiosInstance.post('/ai/chat', { query: text });
      setMessages([...newMsgs, { sender: 'ai' as const, text: res.data.data.answer }]);
    } catch (err: any) {
      setMessages([...newMsgs, { sender: 'ai' as const, text: 'Oops! I encountered an error connecting to the query service. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md bg-card border-l shadow-2xl animate-in slide-in-from-right duration-250">
      <div className="flex flex-col flex-1 h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm">WorkSphere AI Assistant</h2>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Agent
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-muted/50 text-foreground border rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted/50 text-muted-foreground border rounded-2xl rounded-bl-none px-4 py-2.5 text-xs flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Prompts */}
        <div className="px-6 py-2 flex flex-wrap gap-1.5 border-t bg-muted/10">
          {[
            'Who is on leave today?',
            'Summarize payroll costs',
            'Today\'s attendance summary',
          ].map(prompt => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-[10px] px-2.5 py-1 bg-background hover:bg-muted text-muted-foreground border rounded-full transition-colors font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t bg-muted/20">
          <form
            onSubmit={e => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 h-10 px-4 rounded-xl border border-border bg-background text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatDrawer;
