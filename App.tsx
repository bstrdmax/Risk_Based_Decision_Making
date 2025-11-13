import React, { useState, useEffect } from 'react';
import { generateFinalReport, reviseAnswer } from './services/geminiService';
import { QUESTIONS } from './constants';
import Header from './components/Header';
import DecisionForm from './components/DecisionForm';
import ReportView from './components/ReportView';
import SpinnerIcon from './components/icons/SpinnerIcon';
import WelcomeView from './components/WelcomeView';
import { ReportResult } from './services/geminiService';

const LOADING_MESSAGES = [
  "Analyzing context and decision parameters...",
  "Consulting GAO Greenbook, OMB A-123, OIG reports, and VA/VHA policies...",
  "Identifying potential risks and opportunities...",
  "Cross-referencing data for grounding...",
  "Structuring the final assessment document...",
  "Almost there, finalizing your report...",
];

type View = 'welcome' | 'form' | 'report' | 'loading';

const App: React.FC = () => {
  const [view, setView] = useState<View>('welcome');
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(''));
  const [reportData, setReportData] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revisionLoading, setRevisionLoading] = useState<Record<number, boolean>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (view === 'loading') {
      interval = setInterval(() => {
        setLoadingMessageIndex((prevIndex) => (prevIndex + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [view]);

  const changeView = (newView: View) => {
    setIsExiting(true);
    setTimeout(() => {
      setView(newView);
      setIsExiting(false);
    }, 300); // Match animation duration
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };
  
  const handleStart = () => {
    changeView('form');
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setAnswers(Array(QUESTIONS.length).fill(''));
    setReportData(null);
    setError(null);
    setCurrentStep(0);
    changeView('welcome');
  };

  const handleReviseAnswer = async (index: number) => {
    setRevisionLoading(prev => ({ ...prev, [index]: true }));
    setError(null);
    try {
      const question = QUESTIONS[index];
      const context = answers
        .slice(0, index)
        .map((ans, i) => `Q: ${QUESTIONS[i]}\nA: ${ans}`)
        .join('\n\n');
      
      const userAnswer = answers[index];
      if (!userAnswer.trim()) {
        setError("Please write an answer before trying to revise it.");
        return;
      }

      const revisedText = await reviseAnswer(question, context, userAnswer);
      handleAnswerChange(index, revisedText);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Error revising answer: ${errorMessage}`);
    } finally {
      setRevisionLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleGenerateReport = async () => {
    if (!answers.every(answer => answer.trim() !== '')) {
      setError("Please answer all questions before generating the report.");
      return;
    }
    changeView('loading');
    setError(null);
    try {
      const fullContext = answers
        .map((answer, index) => `Question: ${QUESTIONS[index]}\nAnswer: ${answer}`)
        .join('\n\n');
      
      const finalPrompt = `Based on the following information, please generate the final risk assessment document in Markdown format with the specified sections:\n\n${fullContext}`;
      
      const finalReportData = await generateFinalReport(finalPrompt);
      setReportData(finalReportData);
      changeView('report');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Error generating report: ${errorMessage}`);
      changeView('form');
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'welcome':
        return <WelcomeView onStart={handleStart} />;
      case 'loading':
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-blue-600 w-16 h-16">
              <SpinnerIcon />
            </div>
            <h2 className="text-2xl font-semibold mt-6 text-slate-800 dark:text-slate-200">Generating Your Assessment</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 transition-opacity duration-500">{LOADING_MESSAGES[loadingMessageIndex]}</p>
          </div>
        );
      case 'report':
        return <ReportView reportData={reportData!} onReset={handleReset} />;
      case 'form':
      default:
        return (
          <DecisionForm
            currentStep={currentStep}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onReviseAnswer={handleReviseAnswer}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleGenerateReport}
            onReset={handleReset}
            revisionLoading={revisionLoading}
            error={error}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans antialiased text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1 overflow-y-auto flex flex-col">
         <div className={`transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            {renderContent()}
         </div>
      </main>
    </div>
  );
};

export default App;