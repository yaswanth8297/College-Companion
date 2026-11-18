import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Send, 
  RotateCcw, 
  MapPin, 
  Compass, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle,
  ExternalLink,
  Sparkles,
  Info,
  Flame,
  MessageSquare
} from 'lucide-react';
import { sendChatMessage, submitFeedback } from '../services/api';

export default function AskAI() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Namaste! I am Ratna, your official AI College Companion for Dr. Lankapalli Bullayya College of Engineering.\n\nI can help you navigate to any campus building from the main gate, explain branch details, admissions requirements, and facility hours. What would you like to know?",
      suggested_questions: [
        "How do I reach the library from the main gate?",
        "Where is the college canteen?",
        "What are the admission requirements for B.Tech?",
        "Tell me about the CSE department"
      ]
    }
  ]);
  const [input, setInput] = useState('');
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

    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
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
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I encountered an error connecting to the campus knowledge server. Please check your connection and try again.",
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
        text: "Namaste! Conversation cleared. I'm Ratna, ready to help you explore Dr. Lankapalli Bullayya College of Engineering.",
        suggested_questions: [
          "How do I reach the library from the main gate?",
          "Where is the Principal's Office?",
          "What is the college code for AP EAPCET?"
        ]
      }
    ]);
  };

  const handleFeedback = async (msgId, isHelpful) => {
    if (feedbackSent[msgId]) return;
    try {
      await submitFeedback({
        content: `User marked answer as ${isHelpful ? 'Helpful' : 'Not helpful'}`,
        feedback_type: 'chatbot_quality',
        rating: isHelpful ? 5 : 1
      });
      setFeedbackSent((prev) => ({ ...prev, [msgId]: isHelpful ? 'up' : 'down' }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EEE6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Colorful Header */}
        <div className="bg-gradient-to-r from-[#EF83B9] to-[#D9529B] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-[#9DCD59]" />
              <span>Ratna • Official AI Campus Companion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Meet Ratna
            </h1>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
              Dr. Lankapalli Bullayya College of Engineering's intelligent assistant. Ask for verified walking directions, branch details, eligibility rules, and facilities.
            </p>
          </div>

          <button
            onClick={handleClear}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 self-start sm:self-auto shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>

        {/* Chat Window */}
        <div className="bg-white rounded-2xl border border-[#E3DFD3] shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FBF9F5]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#EF83B9] to-[#D9529B] text-white rounded-br-none'
                      : 'bg-white text-[#1A1C1E] border border-[#E3DFD3] rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Navigation Route Card */}
                  {msg.navigation_route && (
                    <div className="mt-3 p-3.5 bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#1A1C1E]">
                        <span className="flex items-center text-[#2D5A12]">
                          <Compass className="w-4 h-4 mr-1 text-[#9DCD59]" />
                          Walking Distance: {msg.navigation_route.total_distance_meters} meters (~{msg.navigation_route.estimated_minutes} min)
                        </span>
                        {msg.navigation_route.wheelchair_accessible && (
                          <span className="text-[10px] bg-[#9DCD59]/30 text-[#2D5A12] px-2 py-0.5 rounded-full font-bold">
                            Step-Free
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          const origSlug = msg.navigation_route.origin.slug;
                          const destSlug = msg.navigation_route.destination.slug;
                          navigate(`/campus-map?from=${origSlug}&to=${destSlug}`);
                        }}
                        className="w-full py-2.5 px-4 bg-[#9DCD59] hover:bg-[#8ABF44] text-[#1A1C1E] font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                      >
                        <MapPin className="w-4 h-4 text-[#1A1C1E]" />
                        <span>Open & Highlight Route on Campus Map</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Helpful feedback */}
                {msg.sender === 'bot' && (
                  <div className="flex items-center space-x-2 mt-1.5 ml-2 text-[11px] text-[#718096]">
                    <span>Helpful?</span>
                    <button
                      onClick={() => handleFeedback(msg.id, true)}
                      className={`hover:text-[#2D5A12] ${feedbackSent[msg.id] === 'up' ? 'text-[#2D5A12] font-bold' : ''}`}
                    >
                      <ThumbsUp className="w-3 h-3 inline mr-1" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, false)}
                      className={`hover:text-red-600 ${feedbackSent[msg.id] === 'down' ? 'text-red-600 font-bold' : ''}`}
                    >
                      <ThumbsDown className="w-3 h-3 inline" />
                    </button>
                  </div>
                )}

                {/* Follow-up suggestions */}
                {msg.suggested_questions && msg.suggested_questions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                    {msg.suggested_questions.map((sq, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sq)}
                        className="text-[11px] bg-white border border-[#E3DFD3] hover:border-[#EF83B9] text-[#4A5568] hover:text-[#EF83B9] px-3 py-1.5 rounded-full transition-colors text-left shadow-2xs font-semibold"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-[#718096] bg-white p-3 rounded-xl border border-[#E3DFD3] w-36 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#EF83B9] animate-spin" />
                <span>Ratna thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input field */}
          <div className="p-4 bg-white border-t border-[#E3DFD3]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Ratna e.g. 'How do I reach the library from the main gate?'"
                className="flex-1 bg-[#F0EEE6] text-[#1A1C1E] placeholder-[#718096] px-4 py-3 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#EF83B9]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-5 py-3 bg-gradient-to-r from-[#EF83B9] to-[#D9529B] hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
