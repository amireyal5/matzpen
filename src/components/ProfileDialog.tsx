
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User as UserIcon, X, Check, LogOut, BookText, History, Calendar, BrainCircuit, Sparkles, ChevronLeft, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useUser, useAuth, updateDocumentNonBlocking, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface ProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profileData: any;
  profileRef: any;
}

export default function ProfileDialog({ isOpen, onOpenChange, profileData, profileRef }: ProfileDialogProps) {
  const { user } = useUser();
  const auth = useAuth();
  const [view, setView] = useState<"profile" | "journals">("profile");
  const [selectedJournal, setSelectedJournal] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState<"m" | "f">("m");
  const [isSaving, setIsSaving] = useState(false);

  const journalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(doc(profileRef.firestore, "userProfiles", user.uid), "journals"),
      orderBy("createdAt", "desc")
    );
  }, [user, profileRef]);

  const { data: journals, isLoading: isLoadingJournals } = useCollection(journalsQuery);

  useEffect(() => {
    if (isOpen && profileData) {
      setEditName(profileData.name || "");
      setEditGender(profileData.gender || "m");
    }
    if (!isOpen) {
      setView("profile");
      setSelectedJournal(null);
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleDeleteJournal = (id: string) => {
    if (!user || !profileRef) return;
    const journalRef = doc(profileRef.firestore, "userProfiles", user.uid, "journals", id);
    deleteDocumentNonBlocking(journalRef);
    if (selectedJournal?.id === id) setSelectedJournal(null);
  };

  const completedCount = profileData?.completed?.length || 0;
  const favoritesCount = profileData?.favorites?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-full max-h-[90vh] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white [&>button]:hidden isolate translate-z-0 flex flex-col" dir="rtl">
        <DialogHeader className="sr-only">
          <DialogTitle>פרופיל אישי ומרחב יומנים</DialogTitle>
          <DialogDescription>ניהול חשבון וצפייה בתובנות שמורות</DialogDescription>
        </DialogHeader>
        
        {/* Header Navigation */}
        <div className="relative shrink-0 h-48 w-full bg-slate-950 rounded-t-[3rem] overflow-hidden p-8 flex flex-col justify-end">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] z-10" />
          <DialogClose className="absolute left-6 top-6 z-30 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all outline-none border border-white/5">
            <X size={20} />
          </DialogClose>

          <div className="relative z-20 flex gap-4">
            <button 
              onClick={() => setView("profile")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                view === "profile" ? "bg-white text-slate-950 shadow-xl" : "text-white/50 hover:text-white"
              )}
            >
              <UserIcon size={14} />
              פרופיל
            </button>
            <button 
              onClick={() => setView("journals")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                view === "journals" ? "bg-white text-slate-950 shadow-xl" : "text-white/50 hover:text-white"
              )}
            >
              <History size={14} />
              היסטוריית יומנים
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar px-8 pb-12">
          {view === "profile" ? (
            <div className="animate-in fade-in duration-500 space-y-10 pt-10">
              {/* Profile Image Section */}
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

              {/* Form Fields */}
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
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 text-center space-y-1 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">תרגילים שבוצעו</p>
                  <p className="text-2xl font-black text-slate-900">{completedCount}</p>
                </div>
                <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 text-center space-y-1 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">עוגנים שמורים</p>
                  <p className="text-2xl font-black text-rose-500">{favoritesCount}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <Button 
                  className="w-full py-8 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-600/20 text-lg transition-all active:scale-95" 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                >
                  {isSaving ? "שומר..." : "שמירת שינויים"}
                </Button>
                <button 
                  className="w-full flex items-center justify-center gap-2 text-rose-400 hover:text-rose-500 font-bold py-2 text-xs uppercase tracking-widest transition-colors" 
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  <span>התנתקות מהמצפן</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 space-y-6 pt-10">
              {selectedJournal ? (
                <div className="animate-in slide-in-from-left duration-500 space-y-8">
                  <button 
                    onClick={() => setSelectedJournal(null)}
                    className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
                  >
                    <ChevronLeft size={16} className="rotate-180" />
                    חזרה לרשימה
                  </button>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <BookText size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">תיעוד תרגול אפר"ת</h3>
                        <p className="text-xs text-slate-400">{format(new Date(selectedJournal.createdAt), "d MMMM yyyy, HH:mm", { locale: he })}</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {[
                        { label: "א - אירוע", val: selectedJournal.event },
                        { label: "פ - פרשנות", val: selectedJournal.interpretation },
                        { label: "ר - רגש", val: selectedJournal.feeling },
                        { label: "ת - תגובה", val: selectedJournal.reaction }
                      ].map((step, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{step.label}</span>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">{step.val}</p>
                        </div>
                      ))}
                    </div>

                    {selectedJournal.analysis && (
                      <div className="pt-6 border-t border-slate-100 space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-400" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">עיוותי חשיבה שזוהו</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedJournal.analysis.distortions.map((d: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <BrainCircuit size={16} className="text-indigo-400" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">פרשנות בריאה יותר</h4>
                          </div>
                          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 italic text-sm font-medium text-indigo-900 leading-relaxed">
                            "{selectedJournal.analysis.healthyPerspective}"
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900">היומנים שלי</h3>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {journals?.length || 0} תרגולים
                    </div>
                  </div>

                  {isLoadingJournals ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
                      <Loader2 size={40} className="animate-spin" />
                      <p className="font-bold">טוען יומנים...</p>
                    </div>
                  ) : journals && journals.length > 0 ? (
                    <div className="grid gap-4">
                      {journals.map((journal) => (
                        <div 
                          key={journal.id}
                          className="group relative bg-white border border-slate-100 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer"
                          onClick={() => setSelectedJournal(journal)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <BookText size={20} />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
                                  {format(new Date(journal.createdAt), "EEEE, d MMMM", { locale: he })}
                                </p>
                                <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                  {journal.event}
                                </h4>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteJournal(journal.id);
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {journal.analysis?.distortions?.slice(0, 2).map((d: string, i: number) => (
                              <span key={i} className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                {d}
                              </span>
                            ))}
                            {journal.analysis?.distortions?.length > 2 && (
                              <span className="text-[10px] font-bold text-slate-400">+{journal.analysis.distortions.length - 2}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mx-auto">
                        <BookText size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">עדיין אין יומנים שמורים</p>
                        <p className="text-xs text-slate-400">תרגולים שתבצע ביומן המחשבות יופיעו כאן.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
