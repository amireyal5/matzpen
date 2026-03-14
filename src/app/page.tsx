
"use client";

import { useState, useEffect } from "react";
import LandingScreen from "@/components/LandingScreen";
import HomeScreen from "@/components/HomeScreen";
import DeckScreen from "@/components/DeckScreen";
import AuthScreen from "@/components/AuthScreen";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Screen = "landing" | "auth" | "home" | "deck";

function AppContent() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"m" | "f">("m");
  const [activeCatKey, setActiveCatKey] = useState("SOS");
  const [isHydrated, setIsHydrated] = useState(false);
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Initial local load for guests
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

  // Sync with Firestore when user logs in
  useEffect(() => {
    async function syncProfile() {
      if (user && firestore) {
        const docRef = doc(firestore, "userProfiles", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setGender(data.gender || "m");
          setScreen("home");
        } else {
          // If logged in but no profile, use local or ask to complete (stay on home/landing)
          if (name) {
            await setDoc(docRef, { 
              id: user.uid, 
              name, 
              gender, 
              email: user.email, 
              createdAt: new Date().toISOString() 
            });
            setScreen("home");
          }
        }
      }
    }
    syncProfile();
  }, [user, firestore, name, gender]);

  const handleOnboardingComplete = (userName: string, userGender: "m" | "f") => {
    setName(userName);
    setGender(userGender);
    localStorage.setItem("compass_user_data", JSON.stringify({ name: userName, gender: userGender }));
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
          onSuccess={() => setScreen("home")} 
          onBack={() => setScreen("landing")} 
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
