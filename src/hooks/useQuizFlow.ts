import { useState, useCallback } from 'react';
import { PERSONAS } from '@/data/maxdiff-data';
import { calculateMaxDiffScores } from '@/lib/scoring';
import type { SetAnswer, AssessmentResult, Persona } from '@/types/assessment';
import type { UserBirthData } from '@/types/user-data';
import { isExpressMode } from '@/config/constants';

export type StepType = 'welcome' | 'personaSelect' | 'maxdiff' | 'analyzing' | 'result' | 'flowerTest' | 'expressLoading' | 'expressSuccess';

export const useQuizFlow = () => {
  const [step, setStep] = useState<StepType>('welcome');
  const [personaId, setPersonaId] = useState<string>('');
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [setAnswers, setSetAnswers] = useState<SetAnswer[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [userBirthData, setUserBirthData] = useState<UserBirthData | null>(null);
  const [reportToken, setReportToken] = useState<string | null>(null);

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
      
      // Call API for MaxDiff recommendation
      const calculatedResult = calculateMaxDiffScores(persona!, newAnswers);
      const topTwo = calculatedResult.top_problems;
      
      fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          persona_id: persona!.id, 
          persona_label: persona!.label,
          top_problem_1: topTwo[0]?.label || "",
          top_problem_2: topTwo[1]?.label || ""
        })
      })
      .then(res => res.json())
      .then(data => {
        const fullResult: AssessmentResult = {
          persona_id: persona!.id,
          persona_label: persona!.label,
          scores: calculatedResult.scores,
          top_problems: topTwo,
          ai_recommendation: data
        };
        setAssessmentResult(fullResult);
        setStep('result');
      })
      .catch(err => {
        console.error('API Error:', err);
        // Fallback or error state
        setStep('result');
      });
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
    
    if (!isExpressMode) {
      setStep('flowerTest');
    } else {
      setStep('expressLoading');
    }

    if (assessmentResult && persona) {
      const payload = {
        name: data.fullName,
        email: data.email,
        persona_label: assessmentResult.persona_label,
        persona_id: assessmentResult.persona_id,
        top_problem_1: assessmentResult.top_problems[0]?.label || "",
        top_problem_2: assessmentResult.top_problems[1]?.label || "",
        scores: assessmentResult.scores,
        ai_recommendation: assessmentResult.ai_recommendation,
        source: typeof window !== 'undefined' ? window.location.hostname : "web",
        occupation: data.occupation,
        feeling: data.feeling,
        dob: data.dob,
        birthTime: data.birthTime,
        gender: data.gender,
        birthPlace: data.birthPlace,
        mode: isExpressMode ? 'express' : 'drip'
      };

      fetch('/api/send-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(resData => {
        if (isExpressMode && resData.report_token) {
          setReportToken(resData.report_token);
          setStep('expressSuccess');
        }
      })
      .catch(console.error);
    }
  }, [assessmentResult, persona]);

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
    reportToken,
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
