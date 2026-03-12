// client/src/app/messages/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Search, Send, ShieldCheck, User, Info, CheckCircle2, MessageSquare } from "lucide-react";
// import { useMessageSync } from "@/context/MessageContext"; // Uncomment when Context is wrapped in layout.tsx
import toast from "react-hot-toast";

// ==========================================
// MOCK DATA FOR UI VERIFICATION
// ==========================================
const MOCK_CONTACTS = [
  { id: "c-1", name: "Network Coordinator", role: "COORDINATOR", lastMessage: "Your application is under review.", unread: 2, time: "10:42 AM" },
  { id: "c-2", name: "Al-Amanah Shelter", role: "RECEIVER", lastMessage: "Is the grilled chicken still available?", unread: 1, time: "Yesterday" },
  { id: "c-3", name: "FastLogistics Delivery", role: "DELIVERY_MAN", lastMessage: "ETA 15 minutes to pickup location.", unread: 0, time: "Monday" },
];

const MOCK_THREADS: Record<string, any[]> = {
  "c-2": [
    { id: "m1", senderId: "c-2", text: "Hello, we noticed your listing for 10kg of chicken.", time: "09:00 AM", isMine: false },
    { id: "m2", senderId: "c-2", text: "Is the grilled chicken acceptable for our request?", time: "09:01 AM", isMine: false },
    { id: "m3", senderId: "me", text: "Yes, it is freshly grilled from yesterday's batch, kept frozen.", time: "09:15 AM", isMine: true },
  ]
};

export default function MessagingHubPage() {
  // const { decrementUnreadCount } = useMessageSync(); // Live sync hook
  
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const activeContact = contacts.find(c => c.id === activeContactId);

  const handleSelectContact = async (contactId: string) => {
    setActiveContactId(contactId);
    
    // 1. Fetch chat history (Mocked here)
    setChatHistory(MOCK_THREADS[contactId] || []);

    // 2. LIVE SYNC LOGIC: Mark as read
    const contactIndex = contacts.findIndex(c => c.id === contactId);
    if (contactIndex !== -1 && contacts[contactIndex].unread > 0) {
      const unreadAmount = contacts[contactIndex].unread;
      
      // Update local UI state
      const updatedContacts = [...contacts];
      updatedContacts[contactIndex].unread = 0;
      setContacts(updatedContacts);

      // Execute PUT request to backend
      /*
      await fetch(`http://localhost:5000/api/messages/mark-read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ contactId })
      });
      */

      // Dispatch to global context to clear dashboard widget instantly
      // decrementUnreadCount(unreadAmount); 
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeContactId) return;

    const newMsg = {
      id: Date.now().toString(),
      senderId: "me",
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    };

    setChatHistory(prev => [...prev, newMsg]);
    setMessageInput("");

    // Execute POST request to backend
    /*
    await fetch(`http://localhost:5000/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ receiverId: activeContactId, content: newMsg.text })
    });
    */
  };

  return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "DELIVERY_MAN", "COORDINATOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-bg-page flex flex-col font-sans overflow-hidden h-screen">
        <PrivateNavbar />
        
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-80px)]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl flex h-full overflow-hidden">
            
            {/* LEFT SIDEBAR: Contacts List */}
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/50">
              <div className="p-5 border-b border-gray-200 bg-white">
                <h1 className="text-xl font-bold text-brand-dark mb-4">Communications</h1>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search logistics network..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-light/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {contacts.map(contact => (
                  <div 
                    key={contact.id} 
                    onClick={() => handleSelectContact(contact.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex items-start gap-3 hover:bg-white ${activeContactId === contact.id ? 'bg-blue-50/50 border-l-4 border-l-brand-blue' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="w-12 h-12 bg-brand-dark rounded-full flex items-center justify-center flex-shrink-0 relative text-white shadow-sm">
                      {contact.role === "COORDINATOR" ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
                      {contact.unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-urgency-high border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className={`text-sm truncate ${contact.unread > 0 ? 'font-extrabold text-brand-dark' : 'font-bold text-gray-700'}`}>
                          {contact.name}
                        </h4>
                        <span className="text-xs text-gray-400 flex-shrink-0 font-medium">{contact.time}</span>
                      </div>
                      <p className={`text-xs truncate ${contact.unread > 0 ? 'text-brand-dark font-semibold' : 'text-text-secondary'}`}>
                        {contact.lastMessage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT MAIN PANE: Active Chat */}
            <div className={`w-full md:w-2/3 flex flex-col bg-white ${!activeContactId ? 'hidden md:flex' : 'flex'}`}>
              
              {!activeContact ? (
                // EMPTY STATE
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-500 mb-1">No Active Negotiation</h3>
                  <p className="text-sm">Select an entity from the secure communications matrix to begin.</p>
                </div>
              ) : (
                // ACTIVE CHAT STATE
                <>
                  {/* Chat Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue">
                        {activeContact.role === "COORDINATOR" ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-brand-dark leading-tight">{activeContact.name}</h2>
                        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{activeContact.role.replace("_", " ")}</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-brand-blue transition-colors">
                      <Info className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Message History */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
                    
                    {/* Timestamp Separator */}
                    <div className="flex justify-center">
                      <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">Secure Connection Established</span>
                    </div>

                    {chatHistory.length === 0 && (
                      <p className="text-center text-sm text-gray-400 mt-10">Start the negotiation process.</p>
                    )}

                    {chatHistory.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                          <div 
                            className={`px-5 py-3 rounded-2xl shadow-sm text-sm ${
                              msg.isMine 
                                ? 'bg-brand-dark text-white rounded-br-none' 
                                : 'bg-white border border-gray-200 text-brand-dark rounded-bl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <div className="flex items-center gap-1 mt-1.5 px-1">
                            <span className="text-[10px] font-semibold text-gray-400">{msg.time}</span>
                            {msg.isMine && <CheckCircle2 className="w-3 h-3 text-brand-light" />}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Type a secure message..." 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="flex-1 bg-gray-100 border border-transparent focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-light/20 rounded-xl px-5 py-3.5 text-sm transition-all outline-none"
                      />
                      <button 
                        type="submit" 
                        disabled={!messageInput.trim()}
                        className="bg-brand-blue hover:bg-brand-dark text-white rounded-xl px-6 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
            
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}