import React from 'react';
import { QUESTIONS } from '../constants';
import SparkleIcon from './icons/SparkleIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import ProgressIndicator from './ProgressIndicator';

interface DecisionFormProps {
  currentStep: number;
  answers: string[];
  onAnswerChange: (index: number, value: string) => void;
  onReviseAnswer: (index: number) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
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
    <div className="max-w-3xl mx-auto p-4 md:p-8 flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">New Decision Analysis</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Follow the steps below to analyze your decision.</p>
      </div>
      
      <ProgressIndicator currentStep={currentStep + 1} totalSteps={QUESTIONS.length} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative my-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col">
        <div className="my-8 flex-1">
          <label htmlFor={`question-${currentStep}`} className="block text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
            {QUESTIONS[currentStep]}
          </label>
          <div className="relative">
            <textarea
              id={`question-${currentStep}`}
              value={answers[currentStep]}
              onChange={(e) => onAnswerChange(currentStep, e.target.value)}
              placeholder="Your detailed answer here..."
              className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm resize-y min-h-[200px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              rows={8}
              autoFocus
            />
            <button
              type="button"
              onClick={() => onReviseAnswer(currentStep)}
              disabled={revisionLoading[currentStep] || isCurrentAnswerEmpty}
              className="absolute bottom-3 right-3 flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-gray-700 rounded-full hover:bg-blue-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={`Revise answer for step ${currentStep + 1} with AI`}
            >
              {revisionLoading[currentStep] ? <SpinnerIcon /> : <SparkleIcon />}
              <span>{revisionLoading[currentStep] ? 'Revising...' : 'Revise with AI'}</span>
            </button>
          </div>
        </div>
        
        <div className="mt-auto pt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            disabled={currentStep === 0}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isCurrentAnswerEmpty}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isLastStep ? 'Generate Risk Assessment' : 'Next Step'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DecisionForm;
