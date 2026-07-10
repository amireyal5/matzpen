"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { User as UserIcon, X, Check, LogOut, Trash2, AlertTriangle, Loader2, Mail, Bell, BellOff, Flame, LineChart as LineChartIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useUser, useAuth, updateDocumentNonBlocking, useFirestore } from "@/firebase";
import { signOut, deleteUser } from "firebase/auth";
import { collection, query, getDocs, deleteDoc, where } from "firebase/firestore";
import { requestNotificationPermission } from "@/firebase/messaging";
import { MOOD_OPTIONS, computeStreak, getMoodTrend } from "@/lib/mood";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface ProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profileData: any;
  profileRef: any;
}

export default function ProfileDialog({ isOpen, onOpenChange, profileData, profileRef }: ProfileDialogProps) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [view, setView] = useState<"profile" | "insights">("profile");
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState<"m" | "f">("m");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  useEffect(() => {
    if (isOpen && profileData) {
      setEditName(profileData.name || "");
      setEditGender(profileData.gender || "m");
      setDeleteError("");
    }
    if (!isOpen) {
      setView("profile");
    }
  }, [isOpen, profileData]);

  const handleSaveProfile = () => {
    if (!profileRef) return;
    setIsSaving(true);
    updateDocumentNonBlocking(profileRef, {
      name: editName,
      gender: editGender
    });
    setTimeout(() => {
      setIsSaving(false);
      onOpenChange(false);
    }, 500);
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!profileRef) return;
    setIsUpdatingNotifications(true);
    
    try {
      if (enabled) {
        const token = await requestNotificationPermission();
        if (token) {
          updateDocumentNonBlocking(profileRef, {
            notificationsEnabled: true,
            fcmToken: token
          });
        } else {
          console.warn("לא ניתן היה להפעיל התראות.");
        }
      } else {
        updateDocumentNonBlocking(profileRef, {
          notificationsEnabled: false
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !firestore || !profileRef) return;
    setIsDeletingAccount(true);
    setDeleteError("");

    try {
      // מחיקת יומנים היסטוריים אם קיימים
      const journalsSnap = await getDocs(query(
        collection(firestore, "thoughtJournals"),
        where("userId", "==", user.uid)
      ));
      const deletePromises = journalsSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      await deleteDoc(profileRef);
      await deleteUser(user);
    } catch (err: any) {
      console.error("Account deletion failed", err);
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError("מטעמי אבטחה, עליך להתנתק ולהתחבר מחדש למערכת לפני שתוכל למחוק את החשבון.");
      } else {
        setDeleteError("אירעה שגיאה בתהליך המחיקה. נא לנסות שוב מאוחר יותר.");
      }
      setIsDeletingAccount(false);
    }
  };

  const completedCount = profileData?.completed?.length || 0;
  const notificationsEnabled = !!profileData?.notificationsEnabled;

  const moodStreak = useMemo(() => computeStreak(profileData?.moodLogs), [profileData]);
  const moodTrend = useMemo(() => getMoodTrend(profileData?.moodLogs, 14), [profileData]);
  const loggedDaysCount = useMemo(() => moodTrend.filter(d => d.value !== null).length, [moodTrend]);

  const moodEmojiByValue = (value: number) => MOOD_OPTIONS.find(o => o.value === value)?.emoji || "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-full max-h-[90vh] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white [&>button]:hidden isolate translate-z-0 flex flex-col" dir="rtl">
        <DialogHeader className="sr-only">
          <DialogTitle>פרופיל אישי ותובנות</DialogTitle>
          <DialogDescription>ניהול חשבון וצפייה בתובנות אישיות</DialogDescription>
        </DialogHeader>
        
        <div className="relative shrink-0 h-48 w-full bg-slate-950 rounded-t-[3rem] overflow-hidden p-8 flex flex-col justify-end">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] z-10" />
          <DialogClose className="absolute left-6 top-6 z-30 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all outline-none border border-white/5">
            <X size={20} />
          </DialogClose>

          <div className="relative z-20 flex gap-2">
            <button
              onClick={() => setView("profile")}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                view === "profile" ? "bg-white text-slate-950 shadow-xl" : "text-white/50 hover:text-white"
              )}
            >
              <UserIcon size={14} />
              פרופיל
            </button>
            <button
              onClick={() => setView("insights")}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                view === "insights" ? "bg-white text-slate-950 shadow-xl" : "text-white/50 hover:text-white"
              )}
            >
              <LineChartIcon size={14} />
              תובנות
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar px-8 pb-12">
          {view === "profile" ? (
            <div className="animate-in fade-in duration-500 space-y-10 pt-10">
              <div className="flex justify-center mb-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/5 blur-3xl opacity-30 rounded-full scale-110" />
                  <div className="relative w-32 h-32 rounded-full border-[6px] border-slate-50 shadow-2xl overflow-hidden bg-slate-100">
                    {user?.photoURL ? (
                      <Image src={user.photoURL} alt="פרופיל" width={128} height={128} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <UserIcon size={48} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1">איך נקרא לך?</Label>
                  <Input 
                    id="edit-name" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className="rounded-2xl border-slate-100 h-14 px-6 text-base font-bold text-slate-900 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1">כתובת אימייל</Label>
                  <div className="relative">
                    <Input 
                      value={user?.email || ""} 
                      readOnly 
                      className="rounded-2xl border-slate-50 bg-slate-50 h-14 px-6 pr-12 text-base font-medium text-slate-500 cursor-not-allowed"
                    />
                    <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1">לשון פנייה</Label>
                  <RadioGroup value={editGender} onValueChange={(val) => setEditGender(val as "m" | "f")} className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <RadioGroupItem value="m" id="r-male" className="sr-only" />
                      <Label htmlFor="r-male" className={cn(
                        "flex items-center justify-center py-4 rounded-2xl border-2 transition-all cursor-pointer font-bold h-14 text-sm", 
                        editGender === "m" ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm" : "border-slate-50 text-slate-400 hover:bg-slate-50"
                      )}>
                        גבר {editGender === "m" && <Check size={14} className="mr-2" />}
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem value="f" id="r-female" className="sr-only" />
                      <Label htmlFor="r-female" className={cn(
                        "flex items-center justify-center py-4 rounded-2xl border-2 transition-all cursor-pointer font-bold h-14 text-sm", 
                        editGender === "f" ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm" : "border-slate-50 text-slate-400 hover:bg-slate-50"
                      )}>
                        אישה {editGender === "f" && <Check size={14} className="mr-2" />}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Notifications Section */}
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        notificationsEnabled ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                      )}>
                        {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                      </div>
                      <div className="space-y-0.5">
                        <span className="block font-black text-slate-900 text-sm uppercase tracking-tight">התראות פוש</span>
                        <span className="block text-[10px] text-slate-500 font-bold">קבלת תזכורות וכלים אישיים</span>
                      </div>
                    </div>
                    <Switch 
                      checked={notificationsEnabled} 
                      onCheckedChange={handleToggleNotifications}
                      disabled={isUpdatingNotifications}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 text-center space-y-1 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">תרגילים שבוצעו</p>
                <p className="text-2xl font-black text-slate-900">{completedCount}</p>
              </div>

              <div className="space-y-4 pt-4">
                <Button 
                  className="w-full py-8 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-600/20 text-lg transition-all active:scale-95" 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                >
                  {isSaving ? "שומר..." : "שמירת שינויים"}
                </Button>
                
                <div className="flex flex-col gap-2 pt-4">
                  <button 
                    className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 font-bold py-2 text-xs uppercase tracking-widest transition-colors" 
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    <span>התנתקות מהמצפן</span>
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="w-full flex items-center justify-center gap-2 text-rose-300 hover:text-rose-500 font-bold py-2 text-[10px] uppercase tracking-widest transition-colors mt-4">
                        <Trash2 size={12} />
                        <span>מחיקת חשבון לצמיתות</span>
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem] p-8" dir="rtl">
                      <AlertDialogHeader className="text-right">
                        <AlertDialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                          <AlertTriangle className="text-rose-500" />
                          מחיקת חשבון לצמיתות?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 font-medium leading-relaxed pt-2">
                          פעולה זו תמחק את כל המידע האישי שלך, כולל כל היסטוריית התרגולים וההתקדמות שלך באפליקציה. <strong>לא ניתן לבטל פעולה זו.</strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      {deleteError && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold leading-relaxed my-4">
                          {deleteError}
                        </div>
                      )}
                      <AlertDialogFooter className="flex-row-reverse gap-3 pt-4">
                        <AlertDialogAction 
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteAccount();
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl h-12 flex-1"
                          disabled={isDeletingAccount}
                        >
                          {isDeletingAccount ? <Loader2 className="animate-spin" /> : "כן, מחק את החשבון"}
                        </AlertDialogAction>
                        <AlertDialogCancel className="rounded-xl h-12 flex-1 border-slate-200 text-slate-500 font-bold">ביטול</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 space-y-8 pt-10">
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-amber-50/80 p-5 rounded-3xl border border-amber-100 text-center space-y-1 shadow-sm">
                  <div className="flex items-center justify-center gap-1.5 text-amber-500">
                    <Flame size={16} className="fill-current" />
                    <p className="text-2xl font-black text-amber-600">{moodStreak}</p>
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ימי תיעוד רצופים</p>
                </div>
                <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 text-center space-y-1 shadow-sm">
                  <p className="text-2xl font-black text-slate-900">{loggedDaysCount}/14</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ימים מתועדים בשבועיים</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 px-1">מגמת מצב הרוח - שבועיים אחרונים</h3>
                {loggedDaysCount > 0 ? (
                  <div className="bg-slate-50/80 rounded-3xl border border-slate-100 p-4 h-48" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={moodTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} reversed />
                        <YAxis
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          tickFormatter={moodEmojiByValue}
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          width={28}
                        />
                        <RechartsTooltip
                          formatter={(value: any) => [MOOD_OPTIONS.find(o => o.value === value)?.label || "", "מצב רוח"]}
                          labelFormatter={(label) => label}
                          contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700, direction: "rtl" }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="url(#moodGradient)" connectNulls dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 bg-slate-50/80 rounded-3xl border border-slate-100 space-y-1">
                    <p className="font-bold text-slate-900 text-sm">עדיין לא תיעדת מצב רוח</p>
                    <p className="text-xs text-slate-400">תיעוד יומי קצר במסך הבית יבנה כאן את התמונה שלך.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
