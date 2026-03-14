"use client";

import { useState, useEffect } from "react";
import LandingScreen from "@/components/LandingScreen";
import HomeScreen from "@/components/HomeScreen";
import DeckScreen from "@/components/DeckScreen";
import AuthScreen from "@/components/AuthScreen";
import AboutScreen from "@/components/AboutScreen";
import SplashScreen from "@/components/SplashScreen";
import GuidedSession from "@/components/GuidedSession";
import ThoughtJournal from "@/components/ThoughtJournal";
import MeditationScreen from "@/components/MeditationScreen";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

type Screen = "landing" | "auth" | "home" | "deck" | "about" | "guided" | "journal" | "meditation";

function AppContent() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [showSplash, setShowSplash] = useState(true);
  const [activeCatKey, setActiveCatKey] = useState("SOS");
  const [activePracticeIdx, setActivePracticeIdx] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "userProfiles", user.uid);
  }, [user, firestore]);

  const { data: profileData } = useDoc(profileRef);

  useEffect(() => {
    if (user && !isUserLoading) {
      const isVerified = user.emailVerified || user.providerData.some(p => p.providerId === 'google.com');
      
      if (isVerified) {
        if (screen === "landing" || screen === "auth") {
          setScreen("home");
        }
      } else {
        if (screen === "home" || screen === "deck" || screen === "guided" || screen === "journal" || screen === "meditation") {
          setScreen("auth");
        }
      }
    }
  }, [profileData, user, isUserLoading, screen]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isUserLoading && !user && screen !== "landing" && screen !== "auth" && screen !== "about") {
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

  const handleStartGuided = (catKey: string, practiceIdx: number) => {
    if (catKey === "JOURNAL") {
      setScreen("journal");
      return;
    }
    if (catKey === "MEDITATION") {
      setScreen("meditation");
      return;
    }
    setActiveCatKey(catKey);
    setActivePracticeIdx(practiceIdx);
    setScreen("guided");
  };

  if (showSplash || !isHydrated || isUserLoading) {
    return <SplashScreen />;
  }

  const name = profileData?.name || user?.displayName || "";
  const gender = (profileData?.gender || "m") as "m" | "f";

  return (
    <main className="min-h-screen">
      {screen === "landing" && (
        <LandingScreen 
          onComplete={() => setScreen("auth")} 
          onGoToAuth={handleGoToAuth}
          onGoToAbout={() => setScreen("about")}
        />
      )}
      {screen === "about" && (
        <AboutScreen onBack={() => setScreen("landing")} />
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
          onStartGuided={handleStartGuided}
          onGoToJournal={() => setScreen("journal")}
          onGoToMeditation={() => setScreen("meditation")}
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
      {(screen === "guided" && user) && (
        <GuidedSession 
          catKey={activeCatKey}
          practiceIdx={activePracticeIdx}
          gender={gender}
          onBack={() => setScreen("home")}
        />
      )}
      {(screen === "journal" && user) && (
        <ThoughtJournal 
          gender={gender}
          onBack={() => setScreen("home")}
        />
      )}
      {(screen === "meditation" && user) && (
        <MeditationScreen 
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
