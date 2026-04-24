import { useState, useCallback, useRef } from 'react';
import { PERSONAS } from '@/data/maxdiff-data';
import { calculateMaxDiffScores } from '@/lib/scoring';
import type { SetAnswer, AssessmentResult, Persona } from '@/types/assessment';
import type { UserBirthData } from '@/types/user-data';
import { isExpressMode } from '@/config/constants';
import { api } from '@/lib/api';

export type StepType = 'welcome' | 'personaSelect' | 'maxdiff' | 'analyzing' | 'result' | 'flowerTest' | 'expressLoading' | 'expressSuccess';

interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
}

function captureUtm(): UtmParams {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get('utm_source'),
    utm_medium: p.get('utm_medium'),
    utm_campaign: p.get('utm_campaign'),
    utm_content: p.get('utm_content'),
  };
}

export const useQuizFlow = () => {
  const [step, setStep] = useState<StepType>('welcome');
  const [personaId, setPersonaId] = useState<string>('');
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [setAnswers, setSetAnswers] = useState<SetAnswer[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [userBirthData, setUserBirthData] = useState<UserBirthData | null>(null);
  const [reportToken, setReportToken] = useState<string | null>(null);

  // Capture UTM params once on mount; useRef so it's stable across renders.
  const utmRef = useRef<UtmParams>(captureUtm());

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

      const calculatedResult = calculateMaxDiffScores(persona!, newAnswers);
      const topTwo = calculatedResult.top_problems;

      api.post<AssessmentResult['ai_recommendation']>('/recommend', {
        persona_id: persona!.id,
        persona_label: persona!.label,
        top_problem_1: topTwo[0]?.label || "",
        top_problem_2: topTwo[1]?.label || ""
      })
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
      const utm = utmRef.current;
      const payload = {
        name: data.fullName,
        email: data.email,
        persona_label: assessmentResult.persona_label,
        persona_id: assessmentResult.persona_id,
        top_problem_1: assessmentResult.top_problems[0]?.label || "",
        top_problem_2: assessmentResult.top_problems[1]?.label || "",
        scores: assessmentResult.scores,
        ai_recommendation: assessmentResult.ai_recommendation,
        source: utm.utm_source ?? (typeof window !== 'undefined' ? window.location.hostname : "web"),
        occupation: data.occupation,
        feeling: data.feeling,
        dob: data.dob,
        birthTime: data.birthTime,
        gender: data.gender,
        birthPlace: data.birthPlaceTimezone || data.birthPlace,
        birthPlaceName: data.birthPlace,
        birthPlaceLat: data.birthPlaceLat,
        birthPlaceLng: data.birthPlaceLng,
        phone: data.phone || undefined,
        telegram: data.telegram || undefined,
        mode: isExpressMode ? 'express' : 'drip',
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
      };

      api.post<{ report_token?: string; success?: boolean }>('/send-result', payload)
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
