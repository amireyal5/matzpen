
"use client";

import { useState, useEffect } from "react";
import LandingScreen from "@/components/LandingScreen";
import HomeScreen from "@/components/HomeScreen";
import DeckScreen from "@/components/DeckScreen";
import AuthScreen from "@/components/AuthScreen";
import SplashScreen from "@/components/SplashScreen";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

type Screen = "landing" | "auth" | "home" | "deck";

function AppContent() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [showSplash, setShowSplash] = useState(true);
  const [activeCatKey, setActiveCatKey] = useState("SOS");
  const [isHydrated, setIsHydrated] = useState(false);
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Splash Screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // Reference to user profile based on UID
  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "userProfiles", user.uid);
  }, [user, firestore]);

  // Real-time listen to profile data
  const { data: profileData } = useDoc(profileRef);

  // Sync profile logic and redirection
  useEffect(() => {
    if (user && !isUserLoading) {
      const isVerified = user.emailVerified || user.providerData.some(p => p.providerId === 'google.com');
      
      if (isVerified) {
        if (screen === "landing" || screen === "auth") {
          setScreen("home");
        }
      } else {
        if (screen === "home" || screen === "deck") {
          setScreen("auth");
        }
      }
    }
  }, [profileData, user, isUserLoading, screen]);

  // Handle initial hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirect to landing if user logs out
  useEffect(() => {
    if (isHydrated && !isUserLoading && !user && screen !== "landing" && screen !== "auth") {
      setScreen("landing");
    }
  }, [user, isUserLoading, isHydrated, screen]);

  const handleGoToAuth = () => {
    setScreen("auth");
  };

  const handleAuthSuccess = () => {
    setScreen("home");
  };

  const handleSelectCategory = (key: string) => {
    setActiveCatKey(key);
    setScreen("deck");
  };

  // While showing splash or loading initial data
  if (showSplash || !isHydrated || isUserLoading) {
    return <SplashScreen />;
  }

  const name = profileData?.name || user?.displayName || "";
  const gender = profileData?.gender || "m";

  return (
    <main className="min-h-screen">
      {screen === "landing" && (
        <LandingScreen 
          onComplete={() => setScreen("auth")} 
          onGoToAuth={handleGoToAuth}
        />
      )}
      {screen === "auth" && (
        <AuthScreen 
          onSuccess={handleAuthSuccess} 
          onBack={() => setScreen("landing")} 
        />
      )}
      {(screen === "home" && user) && (
        <HomeScreen 
          name={name} 
          gender={gender}
          onSelectCategory={handleSelectCategory} 
          onBack={() => setScreen("landing")} 
        />
      )}
      {(screen === "deck" && user) && (
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
