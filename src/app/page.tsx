
"use client";

import { useState, useEffect } from "react";
import LandingScreen from "@/components/LandingScreen";
import HomeScreen from "@/components/HomeScreen";
import DeckScreen from "@/components/DeckScreen";
import AuthScreen from "@/components/AuthScreen";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

type Screen = "landing" | "auth" | "home" | "deck";

function AppContent() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"m" | "f">("m");
  const [activeCatKey, setActiveCatKey] = useState("SOS");
  const [isHydrated, setIsHydrated] = useState(false);
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // יצירת רפרנס לפרופיל המבוסס על ה-UID בלבד (המזהה הייחודי מפיירבייס)
  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "userProfiles", user.uid);
  }, [user, firestore]);

  // האזנה בזמן אמת לפרופיל מהענן
  const { data: profileData } = useDoc(profileRef);

  // סנכרון מידע מהענן למצב המקומי ברגע שהוא נטען
  useEffect(() => {
    if (profileData) {
      setName(profileData.name || "");
      setGender(profileData.gender || "m");
      if (screen === "landing" || screen === "auth") {
        setScreen("home");
      }
    }
  }, [profileData, screen]);

  // טעינה ראשונית מהזיכרון המקומי (עבור אורחים)
  useEffect(() => {
    const savedData = localStorage.getItem("compass_user_data");
    if (savedData) {
      try {
        const { name: savedName, gender: savedGender } = JSON.parse(savedData);
        if (savedName) {
          setName(savedName);
          setGender(savedGender || "m");
          if (!user) setScreen("home");
        }
      } catch (e) {
        console.error("Error loading user data", e);
      }
    }
    setIsHydrated(true);
  }, [user]);

  const handleOnboardingComplete = (userName: string, userGender: "m" | "f") => {
    setName(userName);
    setGender(userGender);
    localStorage.setItem("compass_user_data", JSON.stringify({ name: userName, gender: userGender }));
    
    // אם המשתמש מחובר, נסנכרן מיד לענן באמצעות ה-ID בלבד
    if (user && profileRef) {
      setDocumentNonBlocking(profileRef, { 
        id: user.uid, 
        name: userName, 
        gender: userGender, 
        email: user.email, 
        createdAt: new Date().toISOString() 
      }, { merge: true });
    }
    
    setScreen("home");
  };

  const handleAuthSuccess = () => {
    // הסנכרון יתבצע אוטומטית דרך useDoc ו-useEffect ברגע שה-Auth יתעדכן
    setScreen("home");
  };

  const handleSelectCategory = (key: string) => {
    setActiveCatKey(key);
    setScreen("deck");
  };

  if (!isHydrated || isUserLoading) return null;

  return (
    <main className="min-h-screen">
      {screen === "landing" && (
        <LandingScreen 
          onComplete={handleOnboardingComplete} 
          onGoToAuth={() => setScreen("auth")}
          initialName={name}
          initialGender={gender}
        />
      )}
      {screen === "auth" && (
        <AuthScreen 
          onSuccess={handleAuthSuccess} 
          onBack={() => setScreen("landing")} 
          localProfile={{ name, gender }}
        />
      )}
      {screen === "home" && (
        <HomeScreen 
          name={name} 
          gender={gender}
          onSelectCategory={handleSelectCategory} 
          onBack={() => setScreen("landing")} 
        />
      )}
      {screen === "deck" && (
        <DeckScreen 
          catKey={activeCatKey} 
          gender={gender} 
          onBack={() => setScreen("home")} 
        />
      )}
    </main>
  );
}

export default function App() {
  return (
    <FirebaseClientProvider>
      <AppContent />
    </FirebaseClientProvider>
  );
}
