import React, { useState } from 'react';
import { generateFinalReport, reviseAnswer } from './services/geminiService';
import { QUESTIONS } from './constants';
import Header from './components/Header';
import DecisionForm from './components/DecisionForm';
import ReportView from './components/ReportView';
import SpinnerIcon from './components/icons/SpinnerIcon';
import { ReportResult } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'form' | 'report' | 'loading'>('form');
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(''));
  const [reportData, setReportData] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revisionLoading, setRevisionLoading] = useState<Record<number, boolean>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    setAnswers(Array(QUESTIONS.length).fill(''));
    setReportData(null);
    setError(null);
    setCurrentStep(0);
    setView('form');
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
    setView('loading');
    setError(null);
    try {
      const fullContext = answers
        .map((answer, index) => `Question: ${QUESTIONS[index]}\nAnswer: ${answer}`)
        .join('\n\n');
      
      const finalPrompt = `Based on the following information, please generate the final risk assessment document in Markdown format with the specified sections:\n\n${fullContext}`;
      
      const finalReportData = await generateFinalReport(finalPrompt);
      setReportData(finalReportData);
      setView('report');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Error generating report: ${errorMessage}`);
      setView('form');
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'loading':
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <SpinnerIcon />
            <h2 className="text-2xl font-semibold mt-4 text-gray-700 dark:text-gray-300">Generating Your Assessment</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">The AI is analyzing your responses and consulting sources. This may take a moment...</p>
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
            revisionLoading={revisionLoading}
            error={error}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans antialiased text-gray-800 dark:text-gray-200">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;