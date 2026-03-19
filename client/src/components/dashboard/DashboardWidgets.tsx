// client/src/components/dashboard/DashboardWidgets.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Mail, Phone, MapPin, Briefcase, MessageSquare, ChevronRight } from "lucide-react";

export const ProfileWidget = ({ id, role, name, email, phone, location, zone }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
    <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center flex-shrink-0 text-brand-blue">
      <User className="w-8 h-8" />
    </div>
    <div className="flex-1">

      {id ? (
        <Link href={`/profile/${id}`} className="block w-fit">
          <h2 className="text-xl font-bold text-brand-dark hover:underline hover:text-brand-blue transition-colors">
            {name}
          </h2>
        </Link>
      ) : (
        <h2 className="text-xl font-bold text-brand-dark">{name}</h2>
      )}

      <span className="inline-block px-2.5 py-1 bg-brand-dark text-white text-xs font-bold uppercase tracking-wider rounded-md mt-1 mb-3">
        {role}
      </span>
      <div className="space-y-1.5 text-sm text-text-secondary">
        <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {email}</p>
        <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {phone}</p>
        <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {location}</p>
        {zone && (
          <p className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 text-brand-blue font-bold">
            <Briefcase className="w-4 h-4" /> Active Zone: {zone}
          </p>
        )}
      </div>
    </div>
  </div>
);

export const StatCard = ({ title, value, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-blue-50 rounded-lg text-brand-blue">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">{title}</h3>
    </div>
    <p className="text-3xl font-extrabold text-brand-dark">{value}</p>
  </div>
);

export const TopItemsWidget = ({ items, type }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
      Top {type} Items
    </h3>
    <div className="flex flex-wrap gap-3">
      {items.map((item: any, idx: number) => (
        <div key={idx} className="bg-brand-blue text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm">
          {item.name} <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{item.weight}</span>
        </div>
      ))}
    </div>
  </div>
);

// ----------------------------------------------------------------------
// SMART COMPONENT: Autonomous Real-Time Messages Widget
// ----------------------------------------------------------------------
export const MessagesWidget = () => {
  const [unreadContacts, setUnreadContacts] = useState<any[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchInbox = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/messages/inbox", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();

      if (data.success) {
        // Filter strictly for contacts that have unread messages
        const unread = data.data.filter((c: any) => c.unread > 0);

        // Mathematically sum all unread messages across all active chats
        const total = unread.reduce((sum: number, c: any) => sum + c.unread, 0);

        // Format timestamps for the UI
        const formattedUnread = unread.map((c: any) => ({
          ...c,
          time: new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        setUnreadContacts(formattedUnread);
        setTotalUnread(total);
      }
    } catch (error) {
      console.error("Widget failed to sync inbox.");
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchInbox();

    // Polling interval (syncs every 5 seconds)
    const intervalId = setInterval(fetchInbox, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
        <h3 className="font-bold text-brand-dark flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-blue" /> Unread Messages
        </h3>
        <span className="bg-urgency-high text-white text-xs font-bold px-2 py-1 rounded-full">
          {totalUnread}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
        {unreadContacts.length === 0 ? (
          <p className="text-sm text-text-secondary text-center mt-10">No new messages.</p>
        ) : (
          unreadContacts.map((contact: any) => (
            // FIX: Dynamic routing to open the specific chat instantly
            <Link
              href={`/messages?contactId=${contact.id}&name=${encodeURIComponent(contact.name)}&role=${contact.role}`}
              key={contact.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 group"
            >
              <div className="w-10 h-10 bg-brand-dark text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {contact.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-sm font-bold text-brand-dark truncate">{contact.name}</h4>
                  <span className="text-xs text-text-secondary flex-shrink-0">{contact.time}</span>
                </div>
                <p className="text-sm text-text-secondary truncate group-hover:text-brand-blue transition-colors font-semibold">
                  {contact.lastMessage}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-2.5 h-2.5 bg-brand-blue rounded-full mt-2"></div>
                {contact.unread > 1 && <span className="text-[10px] font-bold text-brand-blue mt-1">{contact.unread}</span>}
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <Link href="/messages" className="text-sm font-bold text-brand-blue flex items-center justify-center gap-1 hover:text-brand-dark transition-colors">
          Go to Messaging Hub <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};