import { useState, useCallback } from 'react';
import { PERSONAS } from '@/data/maxdiff-data';
import { calculateMaxDiffScores } from '@/lib/scoring';
import type { SetAnswer, AssessmentResult, Persona } from '@/types/assessment';
import type { UserBirthData } from '@/types/user-data';

export type StepType = 'welcome' | 'personaSelect' | 'maxdiff' | 'analyzing' | 'result' | 'flowerTest';

export const useQuizFlow = () => {
  const [step, setStep] = useState<StepType>('welcome');
  const [personaId, setPersonaId] = useState<string>('');
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [setAnswers, setSetAnswers] = useState<SetAnswer[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [userBirthData, setUserBirthData] = useState<UserBirthData | null>(null);

  const persona: Persona | undefined = personaId ? PERSONAS[personaId] : undefined;
  const totalSets = persona?.sets.length ?? 0;

  const handlePersonaSelect = useCallback((id: string) => {
    setPersonaId(id);
    setCurrentSetIndex(0);
    setSetAnswers([]);
    setStep('maxdiff');
  }, []);

  const handleSetAnswer = useCallback((answer: SetAnswer) => {
    const newAnswers = [...setAnswers, answer];
    setSetAnswers(newAnswers);

    if (currentSetIndex >= totalSets - 1) {
      setStep('analyzing');
      const result = calculateMaxDiffScores(persona!, newAnswers);
      setAssessmentResult(result);
      setTimeout(() => setStep('result'), 2500);
    } else {
      setCurrentSetIndex(prev => prev + 1);
    }
  }, [setAnswers, currentSetIndex, totalSets, persona]);

  const handleRestart = useCallback(() => {
    setStep('welcome');
    setPersonaId('');
    setCurrentSetIndex(0);
    setSetAnswers([]);
    setAssessmentResult(null);
  }, []);

  const handleMaxDiffBack = useCallback(() => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(prev => prev - 1);
      setSetAnswers(prev => prev.slice(0, -1));
    } else {
      setStep('personaSelect');
    }
  }, [currentSetIndex]);

  const handleAdvancedTestStart = useCallback((data: UserBirthData) => {
    setUserBirthData(data);
    setStep('flowerTest');
  }, []);

  const handleBackToResult = useCallback(() => {
    setStep('result');
  }, []);

  const getProgress = useCallback(() => {
    switch (step) {
      case 'welcome': return 0;
      case 'personaSelect': return 10;
      case 'maxdiff': return 10 + ((currentSetIndex / totalSets) * 80);
      case 'analyzing': return 95;
      case 'result': return 100;
      case 'flowerTest': return 100;
      default: return 0;
    }
  }, [step, currentSetIndex, totalSets]);

  return {
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
  };
};
