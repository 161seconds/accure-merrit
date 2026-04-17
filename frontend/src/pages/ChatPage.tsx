import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import Ornament from '@/components/ui/Ornament';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    text: string;
    sender: 'ai' | 'user';
    timestamp: Date;
}

export default function ChatPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (messages.length === 0) {
            setIsTyping(true);

            const timer = setTimeout(() => {
                const welcomeMsg: Message = {
                    id: 'welcome-1',
                    text: 'Nam mô A Di Đà Phật. Bần Tăng ở đây để cùng Thí Chủ chia sẻ Phật pháp và gỡ rối những vướng mắc. Thí Chủ muốn đàm đạo điều gì?',
                    sender: 'ai',
                    timestamp: new Date(),
                };
                setMessages([welcomeMsg]);
                setIsTyping(false);
            }, 800);

            return () => clearTimeout(timer);
        }
    }, []);

    const renderMessageText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={index} className="font-bold text-gold-light">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue;
        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

            const historyContents = messages.slice(1).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            historyContents.push({
                role: 'user',
                parts: [{ text: userText }]
            });

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: "Bạn là Tuệ Năng AI, một trợ lý chánh niệm. Xưng là 'Bần Tăng' và gọi người dùng là 'Thí Chủ'. Trả lời từ bi, thiền học, ngắn gọn." }]
                    },
                    contents: historyContents
                })
            });

            const data = await response.json();

            if (!response.ok || !data.candidates) {
                console.error("Chi tiết lỗi từ Google API:", data);
                throw new Error(data.error?.message || `Lỗi kết nối: HTTP ${response.status}`);
            }

            const aiResponseText = data.candidates[0].content.parts[0].text;

            const newAiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, newAiMsg]);

        } catch (error: any) {
            console.error("Lỗi khi gọi Gemini API:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: `A Di Đà Phật. Có chướng ngại khi kết nối (${error.message}). Thí Chủ vui lòng kiểm tra lại mạng hoặc API Key nhé.`,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-[#0f1a14] relative overflow-hidden">
            <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-[#0a100d]/90 backdrop-blur-xl border-b border-white/5 shadow-lg">
                <button onClick={() => navigate(-1)} className="p-2 transition-colors text-parchment/50 hover:text-parchment">
                    <ArrowLeft size={20} />
                </button>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-jade-light animate-pulse" />
                        <h1 className="text-sm font-bold tracking-widest uppercase font-display text-parchment">
                            Tuệ Năng AI
                        </h1>
                    </div>
                    <p className="text-[8px] tracking-[0.3em] uppercase text-gold-dim mt-0.5">Trợ lý Chánh niệm</p>
                </div>

                <div className="flex justify-end w-10">
                    <Sparkles size={18} className="text-gold-light/40" />
                </div>
            </header>

            <div className="absolute top-0 left-0 w-full h-40 pointer-events-none bg-gradient-to-b from-jade-900/10 to-transparent" />

            <div className="relative z-10 flex-1 px-4 pt-20 pb-4 overflow-y-auto scrollbar-hide">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.map((msg) => {
                        const isAI = msg.sender === 'ai';
                        return (
                            <div key={msg.id} className={`flex gap-3 w-full ${isAI ? 'justify-start' : 'justify-end'} animate-[fadeIn_0.3s_ease-out]`}>
                                {isAI && (
                                    <div className="flex items-center justify-center w-8 h-8 mt-1 border rounded-full shadow-inner bg-jade-900/50 text-jade-light shrink-0 border-jade-500/20">
                                        <Bot size={14} />
                                    </div>
                                )}
                                <div className={`relative max-w-[85%] p-4 rounded-2xl shadow-sm ${isAI
                                    ? 'bg-[#0a100d]/60 backdrop-blur-sm border border-white/5 text-parchment/90 rounded-tl-sm'
                                    : 'bg-gradient-to-br from-gold-900/40 to-amber-900/20 border border-gold-500/20 text-gold-50 rounded-tr-sm'
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{renderMessageText(msg.text)}</p>
                                    <span className="block text-[8px] mt-2 opacity-30 text-right uppercase tracking-tighter">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {isTyping && (
                        <div className="flex justify-start w-full gap-3 animate-pulse">
                            <div className="flex items-center justify-center w-8 h-8 mt-1 border rounded-full bg-jade-900/50 text-jade-light shrink-0 border-jade-500/20">
                                <Loader2 size={12} className="animate-spin" />
                            </div>
                            <div className="bg-[#0a100d]/40 p-3 rounded-2xl rounded-tl-sm border border-white/5">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-jade-light/50 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-jade-light/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-jade-light/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="relative z-20 shrink-0 w-full px-4 pt-4 pb-24 bg-gradient-to-t from-[#0f1a14] via-[#0f1a14]/90 to-transparent">
                <div className="relative flex items-end max-w-3xl gap-2 mx-auto">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Gieo duyên đàm đạo..."
                        className="w-full bg-[#0a100d]/90 border border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-sm text-parchment focus:outline-none focus:border-jade-500/50 transition-all placeholder:text-parchment/20 shadow-2xl"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute p-2 transition-all right-2 bottom-2 rounded-xl bg-jade-900/60 text-jade-light hover:bg-jade-600 hover:text-white disabled:opacity-20"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}