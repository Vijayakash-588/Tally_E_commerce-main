import React, { useState, useRef, useEffect } from 'react';
import {
    Bot,
    Send,
    Sparkles,
    User,
    RefreshCw,
    Zap,
    TrendingUp,
    FileText,
    Package,
    ChevronRight,
    X,
    Paperclip,
    Mic,
    MoreHorizontal
} from 'lucide-react';

const SUGGESTIONS = [
    { icon: TrendingUp, label: "Show my sales summary", color: "text-blue-500", bg: "bg-blue-50 hover:bg-blue-100 border-blue-100" },
    { icon: FileText, label: "Generate P&L report", color: "text-violet-500", bg: "bg-violet-50 hover:bg-violet-100 border-violet-100" },
    { icon: Package, label: "Low stock alerts", color: "text-amber-500", bg: "bg-amber-50 hover:bg-amber-100 border-amber-100" },
    { icon: Zap, label: "Quick bank reconciliation", color: "text-cyan-500", bg: "bg-cyan-50 hover:bg-cyan-100 border-cyan-100" },
];

const DEMO_RESPONSES = {
    "show my sales summary": "📊 **Sales Summary — February 2026**\n\n- **Total Revenue:** ₹4,82,300\n- **Invoices Raised:** 38\n- **Top Product:** Premium Widget Pro\n- **Growth vs Last Month:** +12.4% 📈\n\nWould you like a detailed breakdown by product or customer?",
    "generate p&l report": "📋 **Profit & Loss — Feb 2026**\n\n| Item | Amount |\n|------|--------|\n| Revenue | ₹4,82,300 |\n| COGS | ₹2,10,500 |\n| Gross Profit | ₹2,71,800 |\n| Expenses | ₹48,200 |\n| **Net Profit** | **₹2,23,600** |\n\nNet Margin: **46.4%** 🎯",
    "low stock alerts": "⚠️ **Low Stock Alerts**\n\n3 items need immediate reordering:\n\n1. **Widget Pro XL** — 4 units left (min: 10)\n2. **Blue Connector Set** — 2 units left (min: 15)\n3. **Adapter Bundle** — 1 unit left (min: 5)\n\nShall I create purchase orders for these?",
    "quick bank reconciliation": "🏦 **Bank Reconciliation Status**\n\n- **Bank Balance:** ₹1,24,500\n- **Book Balance:** ₹1,22,300\n- **Difference:** ₹2,200\n- **Uncleared Cheques:** 2 pending\n\nWould you like to view the uncleared transactions?",
};

function getResponse(input) {
    const key = input.toLowerCase().trim();
    for (const [k, v] of Object.entries(DEMO_RESPONSES)) {
        if (key.includes(k) || k.includes(key)) return v;
    }
    return `I'm your ERP AI assistant! 🤖 I can help you with:\n\n- **Sales & Revenue** reports\n- **Inventory & Stock** management\n- **Banking & Reconciliation**\n- **Profit & Loss** statements\n- **Customer & Supplier** insights\n\nTry asking me something like: "*Show my sales summary*" or "*Low stock alerts*"`;
}

function MarkdownLine({ text }) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
        <>
            {parts.map((part, i) =>
                part.startsWith('**') && part.endsWith('**')
                    ? <strong key={i}>{part.slice(2, -2)}</strong>
                    : <span key={i}>{part}</span>
            )}
        </>
    );
}

function BubbleContent({ text }) {
    const lines = text.split('\n');
    return (
        <div className="space-y-1 text-sm leading-relaxed">
            {lines.map((line, i) => {
                if (line.startsWith('| ') || line.startsWith('|---')) {
                    if (line.startsWith('|---')) return null;
                    const cells = line.split('|').filter(c => c.trim());
                    return (
                        <div key={i} className="grid gap-4 text-xs" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
                            {cells.map((cell, j) => <span key={j} className="font-medium"><MarkdownLine text={cell.trim()} /></span>)}
                        </div>
                    );
                }
                if (line.match(/^\d+\./)) {
                    return <p key={i} className="pl-2"><MarkdownLine text={line} /></p>;
                }
                if (line.startsWith('- ')) {
                    return <p key={i} className="pl-3 flex gap-1.5"><span className="text-blue-400 mt-0.5">•</span><MarkdownLine text={line.slice(2)} /></p>;
                }
                if (line === '') return <div key={i} className="h-1" />;
                return <p key={i}><MarkdownLine text={line} /></p>;
            })}
        </div>
    );
}

const TypingDots = () => (
    <div className="flex items-center gap-1.5 px-4 py-3">
        {[0, 1, 2].map(i => (
            <span
                key={i}
                className="w-2 h-2 rounded-full bg-blue-400"
                style={{ animation: `bounce 1.2s infinite ${i * 0.2}s` }}
            />
        ))}
    </div>
);

const AIChatbot = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            text: "Hello! 👋 I'm your ERP AI Assistant powered by **Gateway-Pro**.\n\nI can help you analyze sales, manage inventory, generate reports, and much more. What would you like to know today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = (text) => {
        const trimmed = (text || input).trim();
        if (!trimmed) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            text: trimmed,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const reply = getResponse(trimmed);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                text: reply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1200 + Math.random() * 600);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([{
            id: Date.now(),
            role: 'assistant',
            text: "Chat cleared! 🔄 How can I help you today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    return (
        <div className="h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] flex flex-col gap-0 -m-6 sm:-m-10">
            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-8px); }
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .msg-enter { animation: fadeSlideIn 0.3s ease; }
            `}</style>

            {/* Header */}
            <div className="bg-white border-b border-slate-200/60 px-6 sm:px-10 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-slate-900">Gateway AI Assistant</h1>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                            Online · ERP-Pro
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-blue-100">
                        <Sparkles className="w-3 h-3" />
                        AI Powered
                    </div>
                    <button
                        onClick={clearChat}
                        className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                        title="Clear chat"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Suggestions bar */}
            <div className="bg-slate-50/80 border-b border-slate-100 px-6 sm:px-10 py-3 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
                {SUGGESTIONS.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => sendMessage(s.label)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all flex-shrink-0 ${s.bg}`}
                    >
                        <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                        <span className="text-slate-700">{s.label}</span>
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-5 bg-[#F8FAFC]">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 msg-enter ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'assistant'
                                ? 'bg-gradient-to-br from-blue-600 to-violet-600 shadow-blue-600/20'
                                : 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-900/10'
                            }`}>
                            {msg.role === 'assistant'
                                ? <Bot className="w-4 h-4 text-white" />
                                : <User className="w-4 h-4 text-white" />
                            }
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[75%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-tr-sm'
                                    : 'bg-white border border-slate-200/60 text-slate-800 rounded-tl-sm'
                                }`}>
                                {msg.role === 'assistant'
                                    ? <BubbleContent text={msg.text} />
                                    : <p className="text-sm leading-relaxed">{msg.text}</p>
                                }
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium px-1">{msg.time}</span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3 msg-enter">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-600/20">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-slate-200/60 rounded-2xl rounded-tl-sm shadow-sm">
                            <TypingDots />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-slate-200/60 px-6 sm:px-10 py-4 flex-shrink-0">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Ask me about sales, inventory, reports…"
                            rows={1}
                            className="w-full resize-none px-4 py-3 pr-12 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-100/40 focus:border-blue-300 transition-all text-sm font-medium shadow-sm leading-relaxed"
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                            onInput={e => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                        />
                        <div className="absolute right-3 bottom-3 flex gap-1.5">
                            <button className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors">
                                <Paperclip className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || isTyping}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-center text-[10px] text-slate-300 font-medium mt-2 max-w-4xl mx-auto">
                    Press Enter to send · Shift+Enter for new line · AI responses are illustrative
                </p>
            </div>
        </div>
    );
};

export default AIChatbot;
