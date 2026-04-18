import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, Sparkles, Loader2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Message {
    id: string
    text: string
    displayText: string // text đang hiển thị (cho streaming effect)
    sender: 'ai' | 'user'
    timestamp: Date
    isStreaming: boolean
}

export default function ChatPage() {
    const navigate = useNavigate()
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const streamIntervalRef = useRef<number | null>(null)

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    useEffect(() => { scrollToBottom() }, [messages, isTyping])

    // Streaming effect: hiện chữ từng ký tự
    const streamText = useCallback((msgId: string, fullText: string) => {
        let charIndex = 0
        const speed = 18 // ms per character

        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)

        streamIntervalRef.current = window.setInterval(() => {
            charIndex += 1 + Math.floor(Math.random() * 2) // 1-2 chars at a time for natural feel
            if (charIndex >= fullText.length) {
                charIndex = fullText.length
                if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, displayText: fullText, isStreaming: false } : m))
            } else {
                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, displayText: fullText.slice(0, charIndex) } : m))
            }
        }, speed)
    }, [])

    // Welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setIsTyping(true)
            const timer = setTimeout(() => {
                const welcomeText = 'Nam mô A Di Đà Phật. Bần Tăng ở đây để cùng Thí Chủ chia sẻ Phật pháp và gỡ rối những vướng mắc. Thí Chủ muốn đàm đạo điều gì?'
                const msg: Message = {
                    id: 'welcome-1', text: welcomeText, displayText: '',
                    sender: 'ai', timestamp: new Date(), isStreaming: true
                }
                setMessages([msg])
                setIsTyping(false)
                streamText('welcome-1', welcomeText)
            }, 800)
            return () => clearTimeout(timer)
        }
    }, [])

    const renderMessageText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g)
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-gold-light">{part.slice(2, -2)}</strong>
            }
            return <span key={i}>{part}</span>
        })
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return
        const userText = inputValue

        const userMsg: Message = {
            id: Date.now().toString(), text: userText, displayText: userText,
            sender: 'user', timestamp: new Date(), isStreaming: false
        }
        setMessages(prev => [...prev, userMsg])
        setInputValue('')
        setIsTyping(true)

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`

            const historyContents = messages.filter(m => m.id !== 'welcome-1').map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }))
            historyContents.push({ role: 'user', parts: [{ text: userText }] })

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: "Bạn là Tuệ Năng AI, một trợ lý chánh niệm. Xưng là 'Bần Tăng' và gọi người dùng là 'Thí Chủ'. Trả lời từ bi, thiền học, ngắn gọn." }]
                    },
                    contents: historyContents
                })
            })

            const data = await response.json()
            if (!response.ok || !data.candidates) throw new Error(data.error?.message || `HTTP ${response.status}`)

            const aiText = data.candidates[0].content.parts[0].text
            const aiMsgId = (Date.now() + 1).toString()
            const aiMsg: Message = {
                id: aiMsgId, text: aiText, displayText: '',
                sender: 'ai', timestamp: new Date(), isStreaming: true
            }
            setMessages(prev => [...prev, aiMsg])
            setIsTyping(false)
            streamText(aiMsgId, aiText)
        } catch (error: any) {
            const errText = `A Di Đà Phật. Có chướng ngại khi kết nối (${error.message}). Thí Chủ vui lòng thử lại.`
            const errId = (Date.now() + 1).toString()
            setMessages(prev => [...prev, {
                id: errId, text: errText, displayText: '',
                sender: 'ai', timestamp: new Date(), isStreaming: true
            }])
            setIsTyping(false)
            streamText(errId, errText)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }
    const formatTime = (d: Date) => d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

    return (
        <div className="flex flex-col h-[100dvh] bg-[#0f1a14] relative overflow-hidden">
            {/* Ambient bg */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-jade/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gold/3 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-[#0a100d]/90 backdrop-blur-xl border-b border-white/5 shadow-lg">
                <button onClick={() => navigate(-1)} className="p-2 transition-colors bg-transparent border-none cursor-pointer text-parchment/50 hover:text-parchment">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-jade-light animate-pulse" />
                        <h1 className="text-sm font-bold tracking-widest uppercase font-display text-parchment">Tuệ Năng AI</h1>
                    </div>
                    <p className="text-[8px] tracking-[0.3em] uppercase text-gold-dim mt-0.5">Trợ lý Chánh niệm</p>
                </div>
                <Sparkles size={18} className="text-gold-light/40" />
            </header>

            {/* Messages */}
            <div className="relative z-10 flex-1 px-4 pt-20 pb-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-5">
                    {messages.map((msg) => {
                        const isAI = msg.sender === 'ai'
                        return (
                            <div key={msg.id} className={`flex gap-3 w-full ${isAI ? 'justify-start' : 'justify-end'} animate-[fadeSlideIn_0.4s_ease-out]`}>
                                {isAI && (
                                    <div className="flex items-center justify-center w-8 h-8 mt-1 rounded-full bg-jade/20 text-jade-light shrink-0 border border-jade/20 shadow-[0_0_12px_rgba(74,155,106,0.15)]">
                                        <Bot size={14} />
                                    </div>
                                )}
                                <div className={`relative max-w-[85%] p-4 rounded-2xl shadow-lg ${isAI
                                    ? 'bg-[#0a100d]/70 backdrop-blur-sm border border-white/5 text-parchment/90 rounded-tl-sm'
                                    : 'bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/20 text-parchment rounded-tr-sm'
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {renderMessageText(msg.displayText)}
                                        {/* Blinking cursor khi đang stream */}
                                        {msg.isStreaming && (
                                            <span className="inline-block w-0.5 h-4 ml-0.5 bg-gold-light animate-[blink_0.8s_infinite] align-text-bottom" />
                                        )}
                                    </p>
                                    {!msg.isStreaming && (
                                        <span className="block text-[8px] mt-2 opacity-25 text-right uppercase tracking-wider">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex justify-start w-full gap-3 animate-[fadeSlideIn_0.3s_ease-out]">
                            <div className="flex items-center justify-center w-8 h-8 mt-1 border rounded-full bg-jade/20 text-jade-light shrink-0 border-jade/20">
                                <Loader2 size={12} className="animate-spin" />
                            </div>
                            <div className="bg-[#0a100d]/50 px-5 py-3 rounded-2xl rounded-tl-sm border border-white/5">
                                <div className="flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-jade-light/60 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-jade-light/60 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <div className="w-1.5 h-1.5 bg-jade-light/60 rounded-full animate-bounce [animation-delay:300ms]" />
                                    <span className="text-[10px] text-parchment/20 ml-2 italic">đang suy tư...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="relative z-20 shrink-0 w-full px-4 pt-3 pb-24 bg-gradient-to-t from-[#0f1a14] via-[#0f1a14]/95 to-transparent">
                <div className="relative flex items-center max-w-3xl gap-2 mx-auto">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Gieo duyên đàm đạo..."
                        className="w-full bg-[#0a100d]/90 border border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-sm text-parchment focus:outline-none focus:border-jade/40 focus:shadow-[0_0_20px_rgba(74,155,106,0.1)] transition-all placeholder:text-parchment/15 shadow-2xl font-serif"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute p-2.5 transition-all right-2 rounded-xl bg-jade/30 text-jade-light hover:bg-jade/60 hover:text-white disabled:opacity-15 disabled:cursor-not-allowed border-none cursor-pointer"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
        </div>
    )
}