
"use client";

import { useState, useEffect, useRef } from "react";
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
import ClinicalAssessment from "@/components/ClinicalAssessment";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { onMessageListener } from "@/firebase/messaging";
import { useAmbientMixer } from "@/hooks/use-ambient-mixer";

type Screen = "landing" | "auth" | "home" | "deck" | "about" | "guided" | "journal" | "sounds" | "breathing" | "bilateral" | "imagery" | "assessment";

interface HistoryState {
  screen: Screen;
  index: number;
  catKey?: string;
  practiceIdx?: number;
  breathingParams?: {
    initialBreathingId?: string;
  };
  assessmentType?: "gad7" | "phq9";
}

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
  const [assessmentType, setAssessmentType] = useState<"gad7" | "phq9">("gad7");

  const ambientMixer = useAmbientMixer();
  const { stopAll } = ambientMixer;

  const currentIndex = useRef(0);

  const navigateTo = (
    newScreen: Screen,
    params?: {
      catKey?: string;
      practiceIdx?: number;
      breathingParams?: { initialBreathingId?: string };
      assessmentType?: "gad7" | "phq9";
    },
    replace = false
  ) => {
    if (params?.catKey !== undefined) setActiveCatKey(params.catKey);
    if (params?.practiceIdx !== undefined) setActivePracticeIdx(params.practiceIdx);
    if (params?.breathingParams !== undefined) setBreathingParams(params.breathingParams);
    if (params?.assessmentType !== undefined) setAssessmentType(params.assessmentType);
    setScreen(newScreen);

    if (typeof window === "undefined") return;

    const nextIndex = replace ? currentIndex.current : currentIndex.current + 1;
    const state: HistoryState = {
      screen: newScreen,
      index: nextIndex,
      catKey: params?.catKey !== undefined ? params.catKey : (newScreen === "deck" || newScreen === "guided" ? activeCatKey : undefined),
      practiceIdx: params?.practiceIdx !== undefined ? params.practiceIdx : (newScreen === "guided" ? activePracticeIdx : undefined),
      breathingParams: params?.breathingParams !== undefined ? params.breathingParams : (newScreen === "breathing" ? breathingParams : undefined),
      assessmentType: params?.assessmentType !== undefined ? params.assessmentType : (newScreen === "assessment" ? assessmentType : undefined)
    };

    if (replace) {
      window.history.replaceState(state, "");
    } else {
      window.history.pushState(state, "");
      currentIndex.current = nextIndex;
    }
  };

  const handleBack = (fallbackScreen: Screen, fallbackParams?: any) => {
    if (currentIndex.current > 0) {
      window.history.back();
    } else {
      navigateTo(fallbackScreen, fallbackParams, true);
    }
  };

  // Sync back button / popstate events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as HistoryState | null;
      if (state && state.screen) {
        currentIndex.current = state.index;
        if (state.catKey !== undefined) setActiveCatKey(state.catKey);
        if (state.practiceIdx !== undefined) setActivePracticeIdx(state.practiceIdx);
        if (state.breathingParams !== undefined) setBreathingParams(state.breathingParams);
        if (state.assessmentType !== undefined) setAssessmentType(state.assessmentType);
        setScreen(state.screen);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Cleanup effect for sounds screen
  useEffect(() => {
    if (isHydrated && screen !== "sounds") {
      stopAll();
    }
  }, [screen, isHydrated, stopAll]);

  // Cleanup effect for breathing parameters
  useEffect(() => {
    if (isHydrated && screen !== "breathing") {
      setBreathingParams({});
    }
  }, [screen, isHydrated]);

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Load state from localStorage on mount
  useEffect(() => {
    // אתחול האזנה להודעות פוש כשהאפליקציה פתוחה
    onMessageListener();

    if (typeof window !== "undefined") {
      // Register service worker for PWA installability
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/firebase-messaging-sw.js")
          .then((reg) => console.log("PWA Service Worker registered:", reg.scope))
          .catch((err) => console.error("PWA Service Worker registration failed:", err));
      }
      const storedTheme = localStorage.getItem("matzpen_theme") as "light" | "dark" | null;
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      }

      const storedScreen = localStorage.getItem("matzpen_screen") as Screen | null;
      let initialScreen = storedScreen;
      let initialCatKey = undefined;
      let initialPracticeIdx = undefined;
      let initialBreathingParams = undefined;

      if (storedScreen && ["landing", "auth", "home", "deck", "about", "guided", "journal", "sounds", "breathing", "bilateral", "imagery", "assessment"].includes(storedScreen)) {
        const storedCatKey = localStorage.getItem("matzpen_catKey");
        const storedPracticeIdx = localStorage.getItem("matzpen_practiceIdx");
        const storedBreathingParams = localStorage.getItem("matzpen_breathingParams");
        const storedAssessmentType = localStorage.getItem("matzpen_assessmentType") as "gad7" | "phq9" | null;

        if (storedCatKey) {
          setActiveCatKey(storedCatKey);
          initialCatKey = storedCatKey;
        }
        if (storedPracticeIdx) {
          setActivePracticeIdx(Number(storedPracticeIdx));
          initialPracticeIdx = Number(storedPracticeIdx);
        }
        if (storedBreathingParams) {
          try {
            const parsed = JSON.parse(storedBreathingParams);
            setBreathingParams(parsed);
            initialBreathingParams = parsed;
          } catch (e) {}
        }
        if (storedAssessmentType) {
          setAssessmentType(storedAssessmentType);
        }
        setScreen(storedScreen);
      } else {
        initialScreen = "landing";
      }

      window.history.replaceState({
        screen: initialScreen || "landing",
        index: 0,
        catKey: initialCatKey,
        practiceIdx: initialPracticeIdx,
        breathingParams: initialBreathingParams
      }, "");
    }
    setIsHydrated(true);
  }, []);

  // Persist state in localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("matzpen_screen", screen);
      localStorage.setItem("matzpen_theme", theme);
      localStorage.setItem("matzpen_catKey", activeCatKey);
      localStorage.setItem("matzpen_practiceIdx", String(activePracticeIdx));
      localStorage.setItem("matzpen_breathingParams", JSON.stringify(breathingParams));
      localStorage.setItem("matzpen_assessmentType", assessmentType);
    }
  }, [screen, theme, activeCatKey, activePracticeIdx, breathingParams, assessmentType, isHydrated]);

  // Splash screen show/skip logic
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("matzpen_splash_shown") === "true") {
      setShowSplash(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("matzpen_splash_shown", "true");
      }
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
          navigateTo("home", undefined, true);
        }
      } else {
        if (screen === "home" || screen === "deck" || screen === "guided" || screen === "journal" || screen === "sounds" || screen === "breathing" || screen === "bilateral" || screen === "imagery") {
          navigateTo("auth", undefined, true);
        }
      }
    }
  }, [profileData, user, isUserLoading, screen]);

  useEffect(() => {
    if (isHydrated && !isUserLoading && !user && screen !== "landing" && screen !== "auth" && screen !== "about") {
      navigateTo("landing", undefined, true);
    }
  }, [user, isUserLoading, isHydrated, screen]);

  const handleGoToAuth = () => {
    navigateTo("auth");
  };

  const handleAuthSuccess = () => {
    navigateTo("home", undefined, true);
  };

  const handleSelectCategory = (key: string) => {
    navigateTo("deck", { catKey: key });
  };

  const handleStartGuided = (catKey: string, practiceIdx: number) => {
    if (catKey === "JOURNAL") {
      navigateTo("journal");
      return;
    }
    if (catKey === "MEDITATION") {
      navigateTo("sounds");
      return;
    }
    if (catKey === "BILATERAL") {
      navigateTo("bilateral");
      return;
    }
    navigateTo("guided", { catKey, practiceIdx });
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
            onComplete={() => navigateTo("auth")}
            onGoToAuth={handleGoToAuth}
            onGoToAbout={() => navigateTo("about")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {screen === "about" && (
          <AboutScreen
            onBack={() => handleBack("landing")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {screen === "auth" && (
          <AuthScreen
            onSuccess={handleAuthSuccess}
            onBack={() => handleBack("landing")}
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
            onGoToJournal={() => navigateTo("journal")}
            onGoToSounds={(soundId) => {
              // מנגן את הצליל באופן מיידי בתוך אינטראקציית המשתמש (לחיצה),
              // כך שדפדפנים לא יחסמו את הניגון האוטומטי כ-autoplay
              if (soundId) ambientMixer.play(soundId);
              navigateTo("sounds");
            }}
            onGoToBreathing={(breathingId) => {
              navigateTo("breathing", { breathingParams: { initialBreathingId: breathingId } });
            }}
            onGoToBilateral={() => navigateTo("bilateral")}
            onGoToImagery={() => navigateTo("imagery")}
            onGoToAssessment={(type) => navigateTo("assessment", { assessmentType: type })}
            onBack={() => handleBack("landing")} 
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {(screen === "deck" && user) && (
          <DeckScreen
            catKey={activeCatKey}
            gender={gender}
            onBack={() => handleBack("home")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {(screen === "guided" && user) && (
          <GuidedSession
            catKey={activeCatKey}
            practiceIdx={activePracticeIdx}
            gender={gender}
            onBack={() => handleBack("home")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {/* Journal screen disabled for PTSD focus - archived
        {(screen === "journal" && user) && (
          <ThoughtJournal
            gender={gender}
            onBack={() => handleBack("home")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        */}
        {(screen === "sounds" && user) && (
          <SoundsScreen
            onBack={() => {
              handleBack("home");
            }}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
            mixer={ambientMixer}
          />
        )}
        {(screen === "breathing" && user) && (
          <BreathingScreen
            onBack={() => {
              handleBack("home");
            }}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
            {...breathingParams}
          />
        )}
        {(screen === "bilateral" && user) && (
          <BilateralProcessing
            gender={gender}
            onBack={() => handleBack("home")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {(screen === "imagery" && user) && (
          <GuidedImageryScreen
            onBack={() => handleBack("home")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
          />
        )}
        {/* Assessment screen disabled for PTSD focus - archived
        {(screen === "assessment" && user) && (
          <ClinicalAssessment
            gender={gender}
            onBack={() => handleBack("home")}
            theme={theme}
            toggleTheme={() => setTheme(prev => prev === "light" ? "dark" : "light")}
            type={assessmentType}
          />
        )}
        */}
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
