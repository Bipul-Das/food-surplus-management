// client/src/app/messages/page.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Search, Send, ShieldCheck, User, Info, CheckCircle2, MessageSquare, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

interface Contact {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  unread: number;
  time: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
  isMine: boolean;
}

function MessagingHubContent() {
  const { user } = useUserStore();
  const searchParams = useSearchParams();

  const contactIdParam = searchParams.get("contactId");
  const nameParam = searchParams.get("name");
  const roleParam = searchParams.get("role");

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(contactIdParam);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchThread = async (contactId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${contactId}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        const formattedHistory = data.data.map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          text: msg.content,
          time: formatTime(msg.createdAt),
          isMine: msg.senderId === user?.id
        }));
        setChatHistory(formattedHistory);
      }
    } catch (error) {
      console.error("Thread fetch error");
    }
  };

  const fetchInbox = async () => {
    if (isInitialMount.current) setIsLoadingContacts(true);

    try {
      const res = await fetch("http://localhost:5000/api/messages/inbox", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();

      // FIX: Ensure formattedContacts ALWAYS exists, even if backend fails
      let formattedContacts = data.success ? data.data.map((c: any) => ({
        ...c,
        time: formatTime(c.time)
      })) : [];

      // FIX: Forcefully inject the URL contact so the chat ALWAYS opens
      if (contactIdParam && !formattedContacts.find((c: any) => c.id === contactIdParam)) {
        formattedContacts.unshift({
          id: contactIdParam,
          name: nameParam || "New Contact",
          role: roleParam || "USER",
          lastMessage: "Start a secure negotiation...",
          unread: 0,
          time: "Now"
        });
      }

      setContacts(formattedContacts);

    } catch (error) {
      console.error("Failed to fetch inbox");
    } finally {
      setIsLoadingContacts(false);
      isInitialMount.current = false;
    }
  };

  useEffect(() => {
    fetchInbox();
    if (activeContactId) fetchThread(activeContactId);

    const intervalId = setInterval(() => {
      fetchInbox();
      if (activeContactId) fetchThread(activeContactId);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [activeContactId, contactIdParam, nameParam, roleParam]);

  const activeContact = contacts.find(c => c.id === activeContactId);

  const handleSelectContact = async (contactId: string) => {
    setActiveContactId(contactId);

    setContacts(prev => {
      const updated = [...prev];
      const contactIndex = updated.findIndex(c => c.id === contactId);

      if (contactIndex !== -1 && updated[contactIndex].unread > 0) {
        updated[contactIndex].unread = 0;
        fetch(`http://localhost:5000/api/messages/mark-read`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify({ contactId })
        });
      }
      return updated;
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeContactId) return;

    const textToSend = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    try {
      const res = await fetch(`http://localhost:5000/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ receiverId: activeContactId, content: textToSend })
      });

      const data = await res.json();

      if (data.success) {
        const newMsg = {
          id: data.data.id,
          senderId: user?.id || "me",
          text: data.data.content,
          time: formatTime(data.data.createdAt),
          isMine: true
        };
        setChatHistory(prev => [...prev, newMsg]);
        fetchInbox();
      } else {
        toast.error(data.message || "Message transmission failed.");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-80px)]">
      <div className="bg-white rounded-2xl border-[2px] border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] flex h-full overflow-hidden">

        <div className="w-full md:w-1/3 border-r-[2px] border-gray-900 flex flex-col bg-gray-50/50">
          <div className="p-5 border-b-[2px] border-gray-900 bg-white">
            <h1 className="text-xl font-normal uppercase tracking-widest text-gray-900 mb-4">Communications</h1>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-900 absolute left-3 top-1/2 -translate-y-1/2 stroke-2" />
              <input
                type="text"
                placeholder="Search network..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border-[1.5px] border-gray-900 text-[15px] focus:outline-none focus:ring-0 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            {isLoadingContacts ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-900" /></div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm font-medium">No active communications found.</div>
            ) : (
              contacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => handleSelectContact(contact.id)}
                  className={`p-4 border-b-[1.5px] border-gray-900 cursor-pointer transition-colors flex items-start gap-3 hover:bg-gray-100 ${activeContactId === contact.id ? 'bg-[#4a86e8]/10 border-l-[6px] border-l-[#4a86e8]' : 'border-l-[6px] border-l-transparent'}`}
                >
                  <div className="w-12 h-12 bg-gray-900 rounded-[50%] flex items-center justify-center flex-shrink-0 relative text-white shadow-sm">
                    {contact.role === "COORDINATOR" ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
                    {contact.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#cc0000] border-2 border-white rounded-[50%] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`text-[15px] truncate uppercase tracking-wider ${contact.unread > 0 ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                        {contact.name}
                      </h4>
                      <span className="text-[11px] text-gray-500 flex-shrink-0 font-bold">{contact.time}</span>
                    </div>
                    <p className={`text-[14px] truncate ${contact.unread > 0 ? 'text-gray-900 font-bold' : 'text-gray-600 font-normal'}`}>
                      {contact.lastMessage}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`w-full md:w-2/3 flex flex-col bg-white ${!activeContactId ? 'hidden md:flex' : 'flex'}`}>

          {!activeContact ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <div className="w-20 h-20 bg-gray-200 rounded-[50%] flex items-center justify-center mb-4 border-[2px] border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,0.1)]">
                <MessageSquare className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-[18px] font-bold text-gray-900 uppercase tracking-widest mb-1">No Active Negotiation</h3>
              <p className="text-[15px] font-medium text-gray-600">Select an entity from the secure matrix to begin.</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b-[2px] border-gray-900 bg-white flex justify-between items-center z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-[2px] border-gray-900 rounded-[50%] flex items-center justify-center text-gray-900 shadow-sm">
                    {activeContact.role === "COORDINATOR" ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-gray-900 leading-tight uppercase tracking-wider">{activeContact.name}</h2>
                    <span className="text-[12px] font-bold text-[#4a86e8] uppercase tracking-widest">{activeContact.role.replace("_", " ")}</span>
                  </div>
                </div>
                <button className="text-gray-900 hover:text-[#4a86e8] transition-colors">
                  <Info className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 custom-scrollbar">
                <div className="flex justify-center">
                  <span className="bg-white border-[1.5px] border-gray-900 text-gray-900 text-[11px] uppercase tracking-widest font-bold px-4 py-1.5 shadow-sm">
                    Secure Connection Established
                  </span>
                </div>

                {chatHistory.length === 0 && (
                  <p className="text-center text-[14px] font-bold text-gray-400 mt-10 uppercase tracking-widest">Start the negotiation process.</p>
                )}

                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-5 py-3 text-[15px] font-medium border-[2px] border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] ${msg.isMine
                            ? 'bg-[#4a86e8] text-white rounded-t-xl rounded-bl-xl'
                            : 'bg-white text-gray-900 rounded-t-xl rounded-br-xl'
                          }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-2 px-1">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">{msg.time}</span>
                        {msg.isMine && <CheckCircle2 className="w-3.5 h-3.5 text-[#6aa84f]" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t-[2px] border-gray-900">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type a secure message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-white border-[2px] border-gray-900 focus:outline-none focus:ring-0 focus:border-[#4a86e8] rounded-none px-5 py-3.5 text-[15px] font-medium transition-colors shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || isSending}
                    className="bg-gray-900 hover:bg-[#4a86e8] text-white border-[2px] border-gray-900 rounded-none px-8 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

      </div>
    </main>
  );
}

export default function MessagingHubPage() {
  return (
    <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "DELIVERY_MAN", "COORDINATOR", "LEAD_DEV"]}>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <PrivateNavbar />
        <Suspense fallback={
          <div className="flex-1 flex justify-center items-center h-[calc(100vh-80px)]">
            <Loader2 className="w-12 h-12 animate-spin text-gray-900" />
          </div>
        }>
          <MessagingHubContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}