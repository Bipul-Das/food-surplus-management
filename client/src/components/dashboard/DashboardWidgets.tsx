// client/src/components/dashboard/DashboardWidgets.tsx
import Link from "next/link";
import { User, Mail, Phone, MapPin, Briefcase, MessageSquare, ChevronRight } from "lucide-react";

// CHANGED: Added 'id' to the destructured props
export const ProfileWidget = ({ id, role, name, email, phone, location, zone }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
    <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center flex-shrink-0 text-brand-blue">
      <User className="w-8 h-8" />
    </div>
    <div className="flex-1">

      {/* CHANGED: Conditionally wrap the name in a Link if the ID is provided */}
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

export const MessagesWidget = ({ messages }: any) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
      <h3 className="font-bold text-brand-dark flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-brand-blue" /> Unread Messages
      </h3>
      <span className="bg-urgency-high text-white text-xs font-bold px-2 py-1 rounded-full">{messages.length}</span>
    </div>
    <div className="p-4 flex-1 flex flex-col gap-3">
      {messages.length === 0 ? (
        <p className="text-sm text-text-secondary text-center mt-10">No new messages.</p>
      ) : (
        messages.map((msg: any) => (
          <Link href="/messages" key={msg.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 group">
            <div className="w-10 h-10 bg-brand-dark text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{msg.sender.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-sm font-bold text-brand-dark truncate">{msg.sender}</h4>
                <span className="text-xs text-text-secondary flex-shrink-0">{msg.date}</span>
              </div>
              <p className="text-sm text-text-secondary truncate group-hover:text-brand-blue transition-colors">{msg.text}</p>
            </div>
            {msg.unread && <div className="w-2.5 h-2.5 bg-brand-blue rounded-full mt-2"></div>}
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