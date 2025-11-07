import React from 'react';
import { QUESTIONS } from '../constants';
import SparkleIcon from './icons/SparkleIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import ProgressIndicator from './ProgressIndicator';
import RestartIcon from './icons/RestartIcon';

interface DecisionFormProps {
  currentStep: number;
  answers: string[];
  onAnswerChange: (index: number, value: string) => void;
  onReviseAnswer: (index: number) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  onReset: () => void;
  revisionLoading: Record<number, boolean>;
  error: string | null;
}

const DecisionForm: React.FC<DecisionFormProps> = ({
  currentStep,
  answers,
  onAnswerChange,
  onReviseAnswer,
  onNext,
  onBack,
  onSubmit,
  onReset,
  revisionLoading,
  error,
}) => {
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const isCurrentAnswerEmpty = answers[currentStep]?.trim() === '';

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLastStep) {
      onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 md:p-12 flex flex-col relative">
        
        <button 
          onClick={onReset}
          className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-full transition-colors"
          title="Start a new analysis from scratch"
        >
          <RestartIcon />
          <span>Start Over</span>
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100">New Decision Analysis</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Follow the steps below to analyze your decision.</p>
        </div>
        
        <div className="mb-12">
          <ProgressIndicator currentStep={currentStep + 1} totalSteps={QUESTIONS.length} />
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative mb-6 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col">
          <div className="flex-1">
            <label htmlFor={`question-${currentStep}`} className="block text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 text-left">
              {QUESTIONS[currentStep]}
            </label>
            <div className="relative">
              <textarea
                id={`question-${currentStep}`}
                value={answers[currentStep]}
                onChange={(e) => onAnswerChange(currentStep, e.target.value)}
                placeholder="Your detailed answer here..."
                className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm resize-y min-h-[250px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-shadow"
                rows={10}
                autoFocus
              />
              <button
                type="button"
                onClick={() => onReviseAnswer(currentStep)}
                disabled={revisionLoading[currentStep] || isCurrentAnswerEmpty}
                className="absolute bottom-3 right-3 flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={`Revise answer for step ${currentStep + 1} with AI`}
              >
                {revisionLoading[currentStep] ? <SpinnerIcon /> : <SparkleIcon />}
                <span>{revisionLoading[currentStep] ? 'Revising...' : 'Revise with AI'}</span>
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <button
              type="button"
              onClick={onBack}
              disabled={currentStep === 0}
              className="px-6 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg shadow-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isCurrentAnswerEmpty}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
            >
              {isLastStep ? 'Generate Risk Assessment' : 'Next Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DecisionForm;