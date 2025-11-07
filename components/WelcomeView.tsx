import React from 'react';
import DocumentAnalyticsIcon from './icons/DocumentAnalyticsIcon';
import FeatureProcessIcon from './icons/FeatureProcessIcon';
import FeatureAiIcon from './icons/FeatureAiIcon';
import FeatureReportIcon from './icons/FeatureReportIcon';

interface WelcomeViewProps {
  onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex flex-col items-center text-center p-6 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
    <div className="w-12 h-12 p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{children}</p>
  </div>
);

const WelcomeView: React.FC<WelcomeViewProps> = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-8">
      <div className="max-w-4xl w-full">
        <div className="w-20 h-20 p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400 mb-6 mx-auto">
          <DocumentAnalyticsIcon />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-gray-100">
          AI Risk-Based Decision Assistant
        </h1>
        <p className="max-w-3xl mx-auto mt-4 text-lg text-slate-600 dark:text-slate-400">
          Make informed, data-driven decisions with a structured risk assessment process adhering to GAO and OMB standards.
        </p>
        <div className="mt-10">
          <button
            onClick={onStart}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all transform hover:scale-105"
          >
            Begin Analysis
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FeatureCard icon={<FeatureProcessIcon />} title="Structured Process">
            Follow a guided, step-by-step questionnaire to ensure all critical aspects of your decision are covered.
          </FeatureCard>
          <FeatureCard icon={<FeatureAiIcon />} title="AI-Powered Revision">
            Enhance your inputs with an AI assistant to ensure clarity, professionalism, and detail in your answers.
          </FeatureCard>
          <FeatureCard icon={<FeatureReportIcon />} title="Professional Reports">
            Generate comprehensive, print-ready risk assessment documents grounded in verifiable data sources.
          </FeatureCard>
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;