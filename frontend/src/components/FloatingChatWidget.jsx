import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  X, 
  Send, 
  MapPin, 
  Compass, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles,
  ChevronDown,
  ExternalLink,
  Flame
} from 'lucide-react';
import { sendChatMessage, submitFeedback } from '../services/api';

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Namaste! I am Ratna, your AI College Companion for Dr. Lankapalli Bullayya College of Engineering.\n\nAsk me for walking directions to any campus block, department details, faculty information, or admissions procedures.",
      navigation_route: null,
      suggested_questions: [
        "How do I reach the library from the main gate?",
        "Where is the college canteen?",
        "Tell me about the CSE department",
        "What are the admission requirements for B.Tech?"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState({});
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let sid = localStorage.getItem('dlbcoe_chat_session');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('dlbcoe_chat_session', sid);
    }
    sessionIdRef.current = sid;
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const data = await sendChatMessage(userMsg.text, sessionIdRef.current);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response,
        intent: data.intent,
        navigation_route: data.navigation_route,
        suggested_questions: data.suggested_questions || [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I'm having trouble connecting to the campus knowledge server. Please verify your connection or try again shortly.",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "Namaste! Conversation reset. I'm Ratna, ready to guide you around Dr. Lankapalli Bullayya campus.",
        suggested_questions: [
          "How do I reach the library from the main gate?",
          "Where is the Principal's Office?",
          "What courses are offered?"
        ]
      }
    ]);
  };

  const handleFeedback = async (msgId, isHelpful) => {
    if (feedbackSent[msgId]) return;
    try {
      await submitFeedback({
        content: `Chatbot Ratna answer rating: ${isHelpful ? 'Helpful' : 'Not helpful'}`,
        feedback_type: 'chatbot_quality',
        rating: isHelpful ? 5 : 1,
      });
      setFeedbackSent((prev) => ({ ...prev, [msgId]: isHelpful ? 'up' : 'down' }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#EF83B9] to-[#D9529B] hover:opacity-95 text-white px-5 py-3 rounded-full shadow-xl flex items-center space-x-2.5 transition-all transform hover:scale-105 group border-2 border-white"
          title="Ask Ratna - AI College Companion"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-white animate-spin [animation-duration:8s]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#9DCD59] rounded-full border border-white animate-pulse"></span>
          </div>
          <span className="font-bold text-sm tracking-tight pr-1">Ask Ratna (AI)</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[590px] bg-[#F0EEE6] rounded-2xl shadow-2xl border border-[#E3DFD3] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-150">
          {/* Colorful Header */}
          <div className="bg-gradient-to-r from-[#EF83B9] to-[#D9529B] px-4 py-3.5 flex items-center justify-between text-white shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white leading-tight flex items-center space-x-1.5">
                  <span>Ratna</span>
                  <span className="text-[10px] bg-white/30 text-white px-2 py-0.5 rounded-full font-bold">
                    AI Companion
                  </span>
                </h3>
                <span className="text-[11px] text-white/90 flex items-center font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9DCD59] inline-block mr-1"></span>
                  Dr. Lankapalli Bullayya Engineering
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClear}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FBF9F5]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#EF83B9] to-[#D9529B] text-white rounded-br-none'
                      : 'bg-white text-[#1A1C1E] border border-[#E3DFD3] rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Navigation Route Card if present */}
                  {msg.navigation_route && (
                    <div className="mt-3 p-3 bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#1A1C1E]">
                        <span className="flex items-center text-[#2D5A12]">
                          <Compass className="w-4 h-4 mr-1 text-[#9DCD59]" />
                          {msg.navigation_route.total_distance_meters} meters (~{msg.navigation_route.estimated_minutes} min walk)
                        </span>
                        {msg.navigation_route.wheelchair_accessible && (
                          <span className="text-[10px] bg-[#9DCD59]/30 text-[#2D5A12] px-2 py-0.5 rounded-full font-bold">
                            Step-Free
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setIsOpen(false);
                          const origSlug = msg.navigation_route.origin.slug;
                          const destSlug = msg.navigation_route.destination.slug;
                          navigate(`/campus-map?from=${origSlug}&to=${destSlug}`);
                        }}
                        className="w-full mt-2 py-2 px-3 bg-[#9DCD59] hover:bg-[#8ABF44] text-[#1A1C1E] font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#1A1C1E]" />
                        <span>View Active Route on Campus Map</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Helpful feedback toggle for bot messages */}
                {msg.sender === 'bot' && (
                  <div className="flex items-center space-x-2 mt-1 ml-1 text-[11px] text-[#718096]">
                    <span>Was this helpful?</span>
                    <button
                      onClick={() => handleFeedback(msg.id, true)}
                      className={`hover:text-[#2D5A12] ${feedbackSent[msg.id] === 'up' ? 'text-[#2D5A12] font-bold' : ''}`}
                    >
                      <ThumbsUp className="w-3 h-3 inline" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, false)}
                      className={`hover:text-red-600 ${feedbackSent[msg.id] === 'down' ? 'text-red-600 font-bold' : ''}`}
                    >
                      <ThumbsDown className="w-3 h-3 inline" />
                    </button>
                  </div>
                )}

                {/* Suggested Follow-up Prompts */}
                {msg.suggested_questions && msg.suggested_questions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggested_questions.map((sq, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sq)}
                        className="text-[11px] bg-white border border-[#E3DFD3] hover:border-[#EF83B9] text-[#4A5568] hover:text-[#EF83B9] px-2.5 py-1 rounded-full transition-colors text-left shadow-2xs font-medium"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Skeleton Indicator */}
            {loading && (
              <div className="flex items-center space-x-2 text-xs text-[#718096] bg-white p-2.5 rounded-xl border border-[#E3DFD3] w-32 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#EF83B9] animate-spin" />
                <span>Ratna typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#E3DFD3]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Ratna e.g. 'How to reach library?'"
                className="flex-1 bg-[#F0EEE6] text-[#1A1C1E] placeholder-[#718096] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#EF83B9] border border-transparent"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="p-2.5 bg-gradient-to-r from-[#EF83B9] to-[#D9529B] hover:opacity-95 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
