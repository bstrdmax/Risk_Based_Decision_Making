import React, { useState } from 'react';
import { ReportResult } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import CopyIcon from './icons/CopyIcon';
import DownloadIcon from './icons/DownloadIcon';
import PrintIcon from './icons/PrintIcon';
import CheckIcon from './icons/CheckIcon';

interface ReportViewProps {
  reportData: ReportResult;
  onReset: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ reportData, onReset }) => {
  const [copyStatus, setCopyStatus] = useState<'Copy' | 'Copied!' | 'Failed!'>('Copy');
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(reportData.report)
      .then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy'), 2000);
      })
      .catch(err => {
        setCopyStatus('Failed!');
        console.error('Failed to copy report:', err);
        setTimeout(() => setCopyStatus('Copy'), 2000);
      });
  };

  const handleDownload = () => {
    const blob = new Blob([reportData.report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk-assessment-report.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 printable-area-container">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 non-printable">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Assessment Complete</h2>
        <div className="flex items-center space-x-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg">
            <button 
                onClick={handleCopy}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700/50 border border-transparent rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-all ${copyStatus === 'Copied!' ? '!bg-green-100 dark:!bg-green-800/50 !text-green-700 dark:!text-green-200' : ''}`}
            >
                {copyStatus === 'Copied!' ? <CheckIcon /> : <CopyIcon />}
                <span className="w-12 text-left">{copyStatus}</span>
            </button>
            <button 
                onClick={handleDownload}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700/50 border border-transparent rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            >
                <DownloadIcon />
                <span>Download</span>
            </button>
            <button 
                onClick={handlePrint}
                title="Print or save as PDF"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700/50 border border-transparent rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            >
                <PrintIcon />
                <span>Print/PDF</span>
            </button>
        </div>
      </div>
      
      <div className="printable-area bg-white dark:bg-slate-800 p-8 sm:p-12 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
        <header className="pb-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Risk Assessment Report</h1>
          <p className="text-md text-slate-500 dark:text-slate-400 mt-2">Date of Generation: {reportDate}</p>
          <p className="text-md text-slate-500 dark:text-slate-400">Status: <span className="font-medium text-green-600 dark:text-green-400">Completed</span></p>
        </header>
        
        <article className="py-8">
            <MarkdownRenderer content={reportData.report} />
        </article>

        {reportData.sources && reportData.sources.length > 0 && (
          <footer className="pt-8 mt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Grounding Sources</h3>
            <ul className="space-y-3">
              {reportData.sources.map((source, index) => (
                <li key={index} className="text-sm">
                   <span className="font-semibold text-slate-700 dark:text-slate-300">{index + 1}. {source.web.title}</span>
                    <a
                      href={source.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline dark:text-blue-400 truncate"
                      title={source.web.uri}
                    >
                      {source.web.uri}
                    </a>
                </li>
              ))}
            </ul>
          </footer>
        )}
      </div>

      <div className="mt-8 text-center non-printable">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
        >
          Start New Assessment
        </button>
      </div>
    </div>
  );
};

export default ReportView;