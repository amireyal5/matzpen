
"use client";

import { useState, useEffect } from "react";
import LandingScreen from "@/components/LandingScreen";
import HomeScreen from "@/components/HomeScreen";
import DeckScreen from "@/components/DeckScreen";
import { FirebaseClientProvider } from "@/firebase/client-provider";

type Screen = "landing" | "home" | "deck";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"m" | "f">("m");
  const [activeCatKey, setActiveCatKey] = useState("SOS");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved user data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("compass_user_data");
    if (savedData) {
      try {
        const { name: savedName, gender: savedGender } = JSON.parse(savedData);
        if (savedName) {
          setName(savedName);
          setGender(savedGender || "m");
          setScreen("home");
        }
      } catch (e) {
        console.error("Error loading user data", e);
      }
    }
    setIsHydrated(true);
  }, []);

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

  const handleBackToLanding = () => {
    setScreen("landing");
  };

  // Prevent hydration flicker
  if (!isHydrated) return null;

  return (
    <FirebaseClientProvider>
      <main className="min-h-screen">
        {screen === "landing" && (
          <LandingScreen 
            onComplete={handleOnboardingComplete} 
            initialName={name}
            initialGender={gender}
          />
        )}
        {screen === "home" && (
          <HomeScreen 
            name={name} 
            gender={gender}
            onSelectCategory={handleSelectCategory} 
            onBack={handleBackToLanding} 
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
    </FirebaseClientProvider>
  );
}
