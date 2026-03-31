"use client";

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { WelcomeScreen } from '@/components/quiz/WelcomeScreen';
import { StageSelectionScreen } from '@/components/quiz/StageSelectionScreen';
import { MaxDiffSetScreen } from '@/components/quiz/MaxDiffSetScreen';
import { AnalyzingScreen } from '@/components/quiz/AnalyzingScreen';
import { ResultScreen } from '@/components/quiz/ResultScreen';
import { AdvancedTestScreen } from '@/components/quiz/AdvancedTestScreen';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useQuizFlow } from '@/hooks/useQuizFlow';

export default function Home() {
  const {
    step,
    persona,
    currentSetIndex,
    totalSets,
    assessmentResult,
    userBirthData,
    handlePersonaSelect,
    handleSetAnswer,
    handleRestart,
    handleMaxDiffBack,
    handleAdvancedTestStart,
    handleBackToResult,
    getProgress,
    setStep
  } = useQuizFlow();

  const renderCurrentStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeScreen onStart={() => setStep('personaSelect')} />;

      case 'personaSelect':
        return <StageSelectionScreen onSelect={handlePersonaSelect} />;

      case 'maxdiff':
        if (!persona) return null;
        return (
          <MaxDiffSetScreen
            persona={persona}
            currentSetIndex={currentSetIndex}
            totalSets={totalSets}
            onAnswer={handleSetAnswer}
            onBack={handleMaxDiffBack}
          />
        );

      case 'analyzing':
        return <AnalyzingScreen />;

      case 'result':
        if (!assessmentResult || !persona) return null;
        return (
          <ResultScreen
            result={assessmentResult}
            persona={persona}
            onRestart={handleRestart}
            onAdvancedTestStart={handleAdvancedTestStart}
          />
        );
        
      case 'flowerTest':
        if (!persona || !userBirthData) return null;
        return (
          <AdvancedTestScreen 
            onBackToResult={handleBackToResult}
            persona={persona}
            userBirthData={userBirthData}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center relative w-full min-h-[100dvh] bg-[#FDFCFB] md:py-12">
      <ProgressBar progress={getProgress()} />

      <div className="w-full max-w-xl flex flex-col justify-center bg-white min-h-[100dvh] md:min-h-[auto] md:rounded-3xl md:shadow-lg md:border border-[#F0EBE5] overflow-x-hidden p-6 md:p-12 relative z-10 transition-all duration-300">
        {renderCurrentStep()}

        <footer className="hidden md:flex mt-12 text-[#A39A92] items-center justify-center gap-2 opacity-60">
          <CheckCircle2 size={14} />
          <span className="text-xs tracking-widest uppercase font-medium">N-Education Ecosystem | 2026</span>
        </footer>
      </div>
    </main>
  );
}
