"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User as UserIcon, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useUser, updateDocumentNonBlocking } from "@/firebase";

interface ProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profileData: any;
  profileRef: any;
  onUpdateProfile?: (name: string, gender: "m" | "f") => void;
}

export default function ProfileDialog({ isOpen, onOpenChange, profileData, profileRef, onUpdateProfile }: ProfileDialogProps) {
  const { user } = useUser();
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState<"m" | "f">("m");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && profileData) {
      setEditName(profileData.name || "");
      setEditGender(profileData.gender || "m");
    }
  }, [isOpen, profileData]);

  const handleSaveProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile(editName, editGender);
    }
    if (profileRef) {
      updateDocumentNonBlocking(profileRef, {
        name: editName,
        gender: editGender
      });
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onOpenChange(false);
    }, 500);
  };

  const completedCount = profileData?.completed?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-full max-h-[90vh] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white [&>button]:hidden isolate translate-z-0 flex flex-col" dir="rtl">
        <DialogHeader className="sr-only">
          <DialogTitle>פרופיל אישי</DialogTitle>
          <DialogDescription>ניהול פרטים אישיים</DialogDescription>
        </DialogHeader>
        
        <div className="relative shrink-0 h-48 w-full bg-slate-950 rounded-t-[3rem] overflow-hidden p-8 flex flex-col justify-end">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] z-10" />
          <DialogClose className="absolute left-6 top-6 z-30 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all outline-none border border-white/5">
            <X size={20} />
          </DialogClose>

          <div className="relative z-20 flex gap-2 pb-2">
            <h2 className="text-white text-2xl font-black font-headline">פרופיל אישי</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar px-8 pb-12">
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
