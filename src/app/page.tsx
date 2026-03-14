
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
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"m" | "f">("m");
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

  // Sync profile from cloud to local state and redirect to home if logged in and verified
  useEffect(() => {
    if (user) {
      const isVerified = user.emailVerified || user.providerData.some(p => p.providerId === 'google.com');
      
      if (isVerified) {
        if (profileData) {
          setName(profileData.name || user.displayName || "");
          setGender(profileData.gender || "m");
          if (screen === "landing" || screen === "auth") {
            setScreen("home");
          }
        } else if (screen !== "home" && screen !== "deck") {
          setScreen("home");
        }
      } else {
        if (screen === "home" || screen === "deck") {
          setScreen("auth");
        }
      }
    }
  }, [profileData, user, screen]);

  // Handle initial hydration and check for existing local data
  useEffect(() => {
    const savedData = localStorage.getItem("compass_user_data");
    if (savedData) {
      try {
        const { name: savedName, gender: savedGender } = JSON.parse(savedData);
        if (savedName) {
          setName(savedName);
          setGender(savedGender || "m");
        }
      } catch (e) {
        console.error("Error loading user data", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Redirect to landing if user logs out
  useEffect(() => {
    if (isHydrated && !isUserLoading && !user && screen !== "landing" && screen !== "auth") {
      setScreen("landing");
    }
  }, [user, isUserLoading, isHydrated, screen]);

  const handleOnboardingStart = (userName: string, userGender: "m" | "f") => {
    setName(userName);
    setGender(userGender);
    localStorage.setItem("compass_user_data", JSON.stringify({ name: userName, gender: userGender }));
    setScreen("auth");
  };

  const handleAuthSuccess = () => {
    if (user) {
       const isVerified = user.emailVerified || user.providerData.some(p => p.providerId === 'google.com');
       if (isVerified) {
         setScreen("home");
       }
    }
  };

  const handleSelectCategory = (key: string) => {
    setActiveCatKey(key);
    setScreen("deck");
  };

  // While showing splash or loading initial data
  if (showSplash || !isHydrated || isUserLoading) {
    return <SplashScreen />;
  }

  return (
    <main className="min-h-screen">
      {screen === "landing" && (
        <LandingScreen 
          onComplete={handleOnboardingStart} 
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
