
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
import SoundsScreen from "@/components/SoundsScreen";
import BreathingScreen from "@/components/BreathingScreen";
import GuidedImageryScreen from "@/components/GuidedImageryScreen";
import BilateralProcessing from "@/components/BilateralProcessing";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { onMessageListener } from "@/firebase/messaging";
import { useAmbientMixer } from "@/hooks/use-ambient-mixer";

type Screen = "landing" | "auth" | "home" | "deck" | "about" | "guided" | "journal" | "sounds" | "breathing" | "bilateral" | "imagery";

function AppContent() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showSplash, setShowSplash] = useState(true);
  const [activeCatKey, setActiveCatKey] = useState("SOS");
  const [activePracticeIdx, setActivePracticeIdx] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [breathingParams, setBreathingParams] = useState<{
    initialBreathingId?: string;
  }>({});

  const ambientMixer = useAmbientMixer();

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    // אתחול האזנה להודעות פוש כשהאפליקציה פתוחה
    onMessageListener();
    
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
        if (screen === "home" || screen === "deck" || screen === "guided" || screen === "journal" || screen === "sounds" || screen === "breathing" || screen === "bilateral" || screen === "imagery") {
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
      setScreen("sounds");
      return;
    }
    if (catKey === "BILATERAL") {
      setScreen("bilateral");
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
    <div className={theme === "light" ? "light" : "dark"}>
      <main className={`min-h-screen transition-colors duration-500 ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-white"}`}>
        {screen === "landing" && (
          <LandingScreen
            onComplete={() => setScreen("auth")}
            onGoToAuth={handleGoToAuth}
            onGoToAbout={() => setScreen("about")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {screen === "about" && (
          <AboutScreen
            onBack={() => setScreen("landing")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {screen === "auth" && (
          <AuthScreen
            onSuccess={handleAuthSuccess}
            onBack={() => setScreen("landing")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {(screen === "home" && user) && (
          <HomeScreen 
            name={name} 
            gender={gender}
            onSelectCategory={handleSelectCategory} 
            onStartGuided={handleStartGuided}
            onGoToJournal={() => setScreen("journal")}
            onGoToSounds={(soundId) => {
              // מנגן את הצליל באופן מיידי בתוך אינטראקציית המשתמש (לחיצה),
              // כך שדפדפנים לא יחסמו את הניגון האוטומטי כ-autoplay
              if (soundId) ambientMixer.play(soundId);
              setScreen("sounds");
            }}
            onGoToBreathing={(breathingId) => {
              setBreathingParams({ initialBreathingId: breathingId });
              setScreen("breathing");
            }}
            onGoToBilateral={() => setScreen("bilateral")}
            onGoToImagery={() => setScreen("imagery")}
            onBack={() => setScreen("landing")} 
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {(screen === "deck" && user) && (
          <DeckScreen
            catKey={activeCatKey}
            gender={gender}
            onBack={() => setScreen("home")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {(screen === "guided" && user) && (
          <GuidedSession
            catKey={activeCatKey}
            practiceIdx={activePracticeIdx}
            gender={gender}
            onBack={() => setScreen("home")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {(screen === "journal" && user) && (
          <ThoughtJournal
            gender={gender}
            onBack={() => setScreen("home")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {(screen === "sounds" && user) && (
          <SoundsScreen
            onBack={() => {
              ambientMixer.stopAll();
              setScreen("home");
            }}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
            mixer={ambientMixer}
          />
        )}
        {(screen === "breathing" && user) && (
          <BreathingScreen
            onBack={() => {
              setBreathingParams({});
              setScreen("home");
            }}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
            {...breathingParams}
          />
        )}
        {(screen === "bilateral" && user) && (
          <BilateralProcessing
            gender={gender}
            onBack={() => setScreen("home")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {(screen === "imagery" && user) && (
          <GuidedImageryScreen
            onBack={() => setScreen("home")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <FirebaseClientProvider>
      <AppContent />
    </FirebaseClientProvider>
  );
}
