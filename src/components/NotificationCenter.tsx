
"use client";

import { useState, useMemo } from "react";
import { Bell, BellOff, Check, Trash2, X, Info, Sparkles, AlertCircle } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, where, doc, getDocs, writeBatch } from "firebase/firestore";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function NotificationCenter() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "notifications"),
      where("userId", "==", user.uid)
    );
  }, [user, firestore]);

  const { data: rawNotifications } = useCollection(notificationsQuery);

  const notifications = useMemo(() => {
    if (!rawNotifications) return [];
    return [...rawNotifications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [rawNotifications]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length
  , [notifications]);

  const markAsRead = (id: string) => {
    if (!firestore) return;
    const ref = doc(firestore, "notifications", id);
    updateDocumentNonBlocking(ref, { read: true });
  };

  const deleteNotification = (id: string) => {
    if (!firestore) return;
    const ref = doc(firestore, "notifications", id);
    deleteDocumentNonBlocking(ref);
  };

  const clearAll = async () => {
    if (!user || !firestore || notifications.length === 0) return;
    
    // בגלל שאין לנו פונקציה מובנית למחיקה המונית ב-non-blocking utils,
    // נבצע זאת כאן בצורה יעילה (Batch)
    const q = query(collection(firestore, "notifications"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    
    // פיצול למחיקה ב-batches אם יש הרבה הודעות (מגבלה של 500 ב-Firestore)
    const chunks = [];
    for (let i = 0; i < snap.docs.length; i += 500) {
      chunks.push(snap.docs.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(firestore);
      chunk.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'insight': return <Sparkles size={16} className="text-amber-500" />;
      case 'reminder': return <Info size={16} className="text-indigo-500" />;
      default: return <AlertCircle size={16} className="text-slate-400" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-950 animate-in zoom-in duration-300">
              {unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md bg-white border-none p-0 flex flex-col" dir="rtl">
        <SheetHeader className="p-6 border-b border-slate-50 bg-slate-50/30 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-black text-slate-900">מרכז ההתראות</SheetTitle>
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-[10px] font-black text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-rose-50"
              >
                <Trash2 size={12} />
                ניקוי הכל
              </button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar bg-white">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => !n.read && markAsRead(n.id)}
                className={cn(
                  "group relative p-5 rounded-[1.5rem] border transition-all cursor-pointer",
                  n.read 
                    ? "bg-white border-slate-50 opacity-60" 
                    : "bg-indigo-50/30 border-indigo-100 shadow-sm"
                )}
              >
                <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center",
                    n.read ? "bg-slate-100" : "bg-white shadow-sm"
                  )}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={cn("text-sm font-black", n.read ? "text-slate-600" : "text-slate-900")}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400">
                        {format(new Date(n.createdAt), "HH:mm", { locale: he })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {n.body}
                    </p>
                  </div>
                </div>

                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.read && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                      className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg"
                      title="סמן כנקרא"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                    className="w-8 h-8 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-sm"
                    title="מחק"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
              <div className="w-20 h-20 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-400">
                <BellOff size={40} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-slate-900">הכל שקט כאן</p>
                <p className="text-xs font-medium">אין התראות חדשות ברגע זה.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-50 bg-slate-50/30">
          <p className="text-[10px] text-center font-black text-slate-400 uppercase tracking-widest">
            המצפן הרגשי • מרחב אישי
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
