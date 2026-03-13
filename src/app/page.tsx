"use client";

import { useState, useEffect } from "react";
import LandingScreen from "@/components/LandingScreen";
import HomeScreen from "@/components/HomeScreen";
import DeckScreen from "@/components/DeckScreen";
import { CATS } from "@/lib/data";

type Screen = "landing" | "home" | "deck";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"m" | "f">("m");
  const [activeCatKey, setActiveCatKey] = useState("SOS");

  // Simple state management between screens
  const handleOnboardingComplete = (userName: string, userGender: "m" | "f") => {
    setName(userName);
    setGender(userGender);
    setScreen("home");
  };

  const handleSelectCategory = (key: string) => {
    setActiveCatKey(key);
    setScreen("deck");
  };

  return (
    <main className="min-h-screen">
      {screen === "landing" && (
        <LandingScreen onComplete={handleOnboardingComplete} />
      )}
      {screen === "home" && (
        <HomeScreen 
          name={name} 
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
