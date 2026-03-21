// client/src/app/messages/page.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PrivateNavbar from "@/components/layout/PrivateNavbar";
import { Search, Send, ShieldCheck, User, Info, CheckCircle2, MessageSquare, Loader2, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

interface Contact {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  unread: number;
  time: string;
  avatar?: string;
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

      let formattedContacts = data.success ? data.data.map((c: any) => ({
        ...c,
        time: formatTime(c.time)
      })) : [];

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
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-80px)]">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-cinematic flex h-full overflow-hidden">

        {/* LEFT PANEL: Inbox / Contacts */}
        <div className="w-full md:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-6 border-b border-gray-100 bg-white">
            <h1 className="text-xl font-black text-brand-dark mb-4 tracking-tight">Communications</h1>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search network..."
                icon={<Search className="w-4 h-4" />}
                className="bg-gray-50 border-gray-200 focus:border-brand-blue/30 focus:ring-brand-blue/10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent">
            {isLoadingContacts ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-medium">No active communications found.</div>
            ) : (
              <div className="divide-y divide-gray-100/50">
                {contacts.map(contact => {
                  const initials = contact.name.substring(0, 3).toUpperCase();
                  return (
                    <div
                      key={contact.id}
                      onClick={() => handleSelectContact(contact.id)}
                      className={`p-4 cursor-pointer transition-all duration-300 flex items-start gap-3 border-l-4 hover:bg-white ${activeContactId === contact.id
                          ? 'bg-white border-l-brand-blue shadow-sm relative z-10'
                          : 'border-l-transparent hover:border-l-brand-blue/30'
                        }`}
                    >
                      {/* Layered Avatar for Contacts List */}
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white ring-2 ring-gray-100 flex-shrink-0 relative bg-gray-100 text-gray-500 font-black flex items-center justify-center">
                        <span className="absolute inset-0 flex items-center justify-center text-xs tracking-widest">{initials}</span>
                        {contact.avatar && (
                          <img
                            src={contact.avatar.startsWith('http') ? contact.avatar : `http://localhost:5000${contact.avatar}`}
                            alt="Profile"
                            className="absolute inset-0 w-full h-full object-cover z-10 bg-white"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                        )}
                        {contact.unread > 0 && (
                          <span className="absolute top-0 right-0 w-3 h-3 bg-semantic-danger border-2 border-white rounded-full z-20" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className={`text-[14px] truncate capitalize ${contact.unread > 0 ? 'font-black text-brand-dark' : 'font-bold text-gray-700'}`}>
                            {contact.name}
                          </h4>
                          <span className="text-[11px] text-gray-400 flex-shrink-0 font-bold">{contact.time}</span>
                        </div>
                        <p className={`text-[13px] truncate ${contact.unread > 0 ? 'text-brand-dark font-bold' : 'text-gray-500 font-medium'}`}>
                          {contact.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Active Chat */}
        <div className={`w-full md:w-2/3 flex flex-col bg-white ${!activeContactId ? 'hidden md:flex' : 'flex'}`}>

          {!activeContact ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-surface-background">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <MessageSquare className="w-8 h-8 text-brand-blue/50" />
              </div>
              <h3 className="text-xl font-black text-brand-dark tracking-tight mb-2">No Active Negotiation</h3>
              <p className="text-[15px] font-medium text-gray-500">Select an entity from the directory to begin.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                  {/* Active Contact Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-blue/20 ring-2 ring-white shadow-sm flex-shrink-0 relative bg-brand-blue/5 text-brand-blue font-black flex items-center justify-center">
                    <span className="absolute inset-0 flex items-center justify-center text-xs tracking-widest">{activeContact.name.substring(0, 3).toUpperCase()}</span>
                    {activeContact.avatar && (
                      <img
                        src={activeContact.avatar.startsWith('http') ? activeContact.avatar : `http://localhost:5000${activeContact.avatar}`}
                        alt="Profile"
                        className="absolute inset-0 w-full h-full object-cover z-10 bg-white"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    )}
                  </div>
                  <div>
                    {/* LEAD DEV FIX: Name is now a clickable link to their profile */}
                    <Link href={`/profile/${activeContact.id}`} className="hover:text-brand-blue transition-colors">
                      <h2 className="text-[16px] font-black text-brand-dark leading-tight capitalize tracking-tight flex items-center gap-2">
                        {activeContact.name}
                      </h2>
                    </Link>
                    <Badge variant={activeContact.role === "COORDINATOR" ? "success" : "info"} size="sm" className="mt-1">
                      {activeContact.role.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                {/* <div className="flex items-center gap-2 text-gray-400">
                  <button className="p-2 hover:bg-gray-50 hover:text-brand-blue rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-gray-50 hover:text-brand-blue rounded-full transition-colors"><Info className="w-5 h-5" /></button>
                </div> */}
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-background custom-scrollbar">
                <div className="flex justify-center">
                  <Badge variant="neutral" className="bg-white text-gray-400 border border-gray-200">
                    Secure Connection Established
                  </Badge>
                </div>

                {chatHistory.length === 0 && (
                  <p className="text-center text-[13px] font-bold text-gray-400 mt-10 uppercase tracking-widest">Start the negotiation process.</p>
                )}

                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-5 py-3 text-[15px] font-medium leading-relaxed shadow-sm ${msg.isMine
                            ? 'bg-brand-blue text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white border border-gray-100 text-brand-dark rounded-2xl rounded-tl-sm'
                          }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 px-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{msg.time}</span>
                        {msg.isMine && <CheckCircle2 className="w-3 h-3 text-brand-green ml-1" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-3 relative">
                  <Input
                    type="text"
                    placeholder="Type a secure message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-brand-blue/10 rounded-xl pr-14"
                  />
                    <button
                      type="submit"
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-dark hover:bg-indigo-600 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                      <Send className="w-4 h-4" />
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
      <div className="min-h-screen bg-surface-background flex flex-col font-sans">
        <PrivateNavbar />
        <Suspense fallback={
          <div className="flex-1 flex justify-center items-center h-[calc(100vh-80px)]">
            <Loader2 className="w-12 h-12 animate-spin text-brand-blue" />
          </div>
        }>
          <MessagingHubContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}