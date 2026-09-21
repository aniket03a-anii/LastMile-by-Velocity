import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Ambulance, 
  Hospital, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  MapPin,
  Phone,
  Radio,
  Zap
} from 'lucide-react';
import { chatService } from '../services/chatService';
import { ChatMessage, BookingRecord, UserProfile } from '../types';

interface SupportChatbotViewProps {
  currentUser: UserProfile | null;
  airplaneMode: boolean;
  onNavigateToRole?: (role: any) => void;
}

export const SupportChatbotView: React.FC<SupportChatbotViewProps> = ({
  currentUser,
  airplaneMode,
  onNavigateToRole,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(chatService.getMessages());
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = chatService.subscribe(() => {
      setMessages([...chatService.getMessages()]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isTyping) return;

    setInputVal('');
    setIsTyping(true);

    try {
      await chatService.sendMessage(text, currentUser, airplaneMode);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    chatService.clearConversation();
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F6F8] text-slate-900">
      {/* Top Banner - Astra Copilot Identity */}
      <div className="p-3.5 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold relative">
            <Bot className="w-4 h-4 stroke-[2.2]" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-900">Astra Field Copilot</h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-700">
                {airplaneMode ? 'NPU OFFLINE ENGINE' : 'GEMINI 3.8 FLASH'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Context-Aware Multi-Step Emergency Bookings</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          title="Reset conversation memory"
          className="p-1.5 rounded-xl bg-[#F5F6F8] hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all text-[10px] flex items-center gap-1 px-2.5 shadow-sm font-semibold"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Quick Booking Shortcuts */}
      <div className="px-3 py-2 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
        <button
          onClick={() => handleSend("I need to book a 108 Emergency Ambulance for a critical delivery.")}
          className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 whitespace-nowrap font-bold flex items-center gap-1.5 shrink-0 transition-all"
        >
          <Ambulance className="w-3 h-3 text-rose-500" />
          <span>Book 108 Ambulance</span>
        </button>

        <button
          onClick={() => handleSend("I want to reserve an emergency ICU bed and 2 units of blood.")}
          className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 whitespace-nowrap font-bold flex items-center gap-1.5 shrink-0 transition-all"
        >
          <Hospital className="w-3 h-3 text-blue-500" />
          <span>Reserve ICU Bed & Blood</span>
        </button>

        <button
          onClick={() => handleSend("What are immediate clinical steps for Postpartum Hemorrhage (PPH)?")}
          className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 whitespace-nowrap font-bold flex items-center gap-1.5 shrink-0 transition-all"
        >
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span>PPH Protocol</span>
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1 mb-1 text-[9px] text-slate-400 font-mono px-1 font-medium">
                {isUser ? (
                  <>
                    <span>You ({currentUser?.name?.split(' ')[0] || 'Worker'})</span>
                    <span>·</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-2.5 h-2.5 text-blue-600" />
                    <span className="text-slate-700 font-bold">Astra Copilot</span>
                    <span>·</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                )}
              </div>

              <div
                className={`p-3.5 rounded-3xl max-w-[88%] leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white font-medium rounded-tr-md shadow-sm'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-md shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line text-xs font-normal">
                  {msg.text}
                </div>

                {/* Structured Booking Card if attached */}
                {msg.bookingData && (
                  <div className="mt-3 p-3 rounded-2xl bg-[#F5F6F8] border border-slate-200 text-slate-900 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {msg.bookingData.type.replace('_', ' ')} CONFIRMED
                      </span>
                      <span className="font-mono text-[10px] text-slate-900 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        #{msg.bookingData.bookingId}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div>
                        <span className="text-slate-400 block font-medium">Patient</span>
                        <span className="font-bold text-slate-900">{msg.bookingData.patientName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Pickup Location</span>
                        <span className="font-bold text-slate-900">{msg.bookingData.pickupLocation}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Destination</span>
                        <span className="text-slate-700 truncate block font-medium">{msg.bookingData.destinationFacility}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Est. Response Time</span>
                        <span className="text-emerald-700 font-bold font-mono">~{msg.bookingData.estimatedArrivalMin} mins</span>
                      </div>
                    </div>

                    {msg.bookingData.notes && (
                      <p className="text-[10px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200">
                        {msg.bookingData.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Suggested Action Chips */}
              {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                  {msg.suggestedActions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(act)}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 shadow-sm transition-all font-semibold"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm w-fit text-slate-600 text-xs animate-pulse">
            <Bot className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>Astra is analyzing context & preparing booking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Dock */}
      <div className="p-3 bg-white border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type booking details (e.g. Book 108 ambulance for Laxmi)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-[#F5F6F8] border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="w-9 h-9 rounded-2xl bg-slate-900 hover:bg-black disabled:opacity-40 text-white flex items-center justify-center font-bold transition-all shadow-md shrink-0"
          >
            <Send className="w-4 h-4 stroke-[2.2]" />
          </button>
        </form>
      </div>
    </div>
  );
};
