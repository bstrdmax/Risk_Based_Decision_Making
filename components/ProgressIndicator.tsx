import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full px-4 sm:px-0">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isCurrent ? 'bg-blue-600 text-white font-bold ring-4 ring-blue-200 dark:ring-blue-500/50' : ''
                  } ${
                    isCompleted ? 'bg-blue-600 text-white' : ''
                  } ${
                    !isCurrent && !isCompleted ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : ''
                  }`}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
              </div>
              {step < totalSteps && (
                <div
                  className={`flex-auto border-t-2 transition-colors duration-300 ${
                    isCompleted ? 'border-blue-600' : 'border-gray-200 dark:border-gray-700'
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