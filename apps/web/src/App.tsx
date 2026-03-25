/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import RatingScreen from "./components/RatingScreen";
import ProgressScreen from "./components/ProgressScreen";
import ScannerScreen from "./components/ScannerScreen";
import CompletionScreen from "./components/CompletionScreen";

type Screen = 'login' | 'rating' | 'progress' | 'scanner' | 'completion';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [unlockedStalls, setUnlockedStalls] = useState<string[]>(() => {
    const saved = localStorage.getItem('unlockedStalls');
    return saved ? JSON.parse(saved) : [];
  });
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('ratings');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentStallId, setCurrentStallId] = useState<string | null>(null);
  
  const totalStalls = 5;

  const unlockStall = (id: string) => {
    setUnlockedStalls(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('unlockedStalls', JSON.stringify(next));
      return next;
    });
  };

  // Handle URL parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stallId = params.get('stallId');
    
    if (stallId) {
      setCurrentStallId(stallId);
      // If not logged in, we stay on login but remember the stallId
      if (isLoggedIn) {
        // If logged in and stall is already rated, go to progress
        if (ratings[stallId] !== undefined) {
          setCurrentScreen('progress');
        } else {
          // Unlock it and go to rating
          unlockStall(stallId);
          setCurrentScreen('rating');
        }
      } else {
        setCurrentScreen('login');
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (isLoggedIn) {
      setCurrentScreen('progress');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    
    if (currentStallId) {
      unlockStall(currentStallId);
      setCurrentScreen('rating');
    } else {
      setCurrentScreen('progress');
    }
  };

  const handleRatingSubmit = (rating: number) => {
    if (!currentStallId) return;

    const newRatings = { ...ratings, [currentStallId]: rating };
    setRatings(newRatings);
    localStorage.setItem('ratings', JSON.stringify(newRatings));

    const ratedCount = Object.keys(newRatings).length;
    if (ratedCount >= totalStalls) {
      setCurrentScreen('completion');
    } else {
      setCurrentScreen('progress');
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    // Expecting URL like https://.../?stallId=5 or just "5"
    let stallId = decodedText;
    try {
      if (decodedText.includes('stallId=')) {
        const url = new URL(decodedText);
        stallId = url.searchParams.get('stallId') || decodedText;
      }
    } catch {
      // Not a URL, use as is
    }

    setCurrentStallId(stallId);
    unlockStall(stallId);
    setCurrentScreen('rating');
  };

  return (
    <main className="min-h-screen bg-[#2A0040]">
      {currentScreen === 'login' && (
        <LoginScreen onStart={handleLogin} />
      )}
      
      {currentScreen === 'scanner' && (
        <ScannerScreen 
          onScanSuccess={handleScanSuccess}
          onClose={() => setCurrentScreen('progress')}
        />
      )}

      {currentScreen === 'rating' && currentStallId && (
        <RatingScreen 
          stallId={currentStallId}
          onBack={() => setCurrentScreen('scanner')} 
          onProgress={() => setCurrentScreen('progress')}
          onSubmitSuccess={handleRatingSubmit}
          ratedCount={Object.keys(ratings).length}
          totalCount={totalStalls}
        />
      )}

      {currentScreen === 'progress' && (
        <ProgressScreen 
          unlockedStalls={unlockedStalls}
          ratings={ratings}
          onScanNext={() => setCurrentScreen('scanner')}
          totalCount={totalStalls}
          onBackToVote={() => setCurrentScreen('scanner')}
        />
      )}

      {currentScreen === 'completion' && (
        <CompletionScreen 
          onClose={() => setCurrentScreen('progress')}
          onGoToProfile={() => setCurrentScreen('progress')}
          onViewLeaderboard={() => setCurrentScreen('progress')}
        />
      )}
    </main>
  );
}

