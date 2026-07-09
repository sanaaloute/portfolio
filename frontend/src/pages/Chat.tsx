import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { SectionHeading } from '../components/SectionHeading';
import { chatApi } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! I'm Aloute's portfolio assistant. Ask me about his experience, skills, projects, or how to get in touch." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const res = await chatApi.query(question);
      setMessages((prev) => [...prev, { role: 'assistant', text: res.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I had trouble answering that. Please try again or contact via email.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="mx-auto flex max-w-3xl flex-col px-6 pt-32 pb-24">
        <SectionHeading title="Ask Me Anything" subtitle="Chat with my portfolio assistant to learn more about my work." align="center" />

        <div className="surface flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${m.role === 'user' ? 'bg-accent text-white' : 'bg-surface-2 text-accent'}`}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-accent text-white' : 'bg-surface-2 text-text'}`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-accent">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-surface-2 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:0.2s]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-border bg-bg p-4">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about experience, skills, projects..."
                className="input flex-1"
              />
              <button type="submit" disabled={loading} className="btn-primary px-4">
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
