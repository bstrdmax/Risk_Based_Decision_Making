import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_NAMES = [
  "Context",
  "Stakeholders",
  "Benefits",
  "Risks",
  "Resources",
  "Timeline",
  "Compliance",
];

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full px-4 sm:px-0">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    isCurrent ? 'bg-blue-600 text-white font-bold border-blue-600 ring-4 ring-blue-500/20' : ''
                  } ${
                    isCompleted ? 'bg-blue-600 border-blue-600 text-white' : ''
                  } ${
                    !isCurrent && !isCompleted ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400' : ''
                  }`}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </div>
                <p className={`absolute top-10 text-center text-xs w-24 transition-colors duration-300 ${isCurrent ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {STEP_NAMES[index]}
                </p>
              </div>
              {stepNumber < totalSteps && (
                <div
                  className={`flex-auto border-t-2 transition-colors duration-300 h-0 ${
                    isCompleted ? 'border-blue-600' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;