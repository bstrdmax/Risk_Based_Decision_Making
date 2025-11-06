import React, { useState } from 'react';
import { ReportResult } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import CopyIcon from './icons/CopyIcon';
import DownloadIcon from './icons/DownloadIcon';
import PrintIcon from './icons/PrintIcon';

interface ReportViewProps {
  reportData: ReportResult;
  onReset: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ reportData, onReset }) => {
  const [copyStatus, setCopyStatus] = useState('Copy');
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
    <div className="max-w-4xl mx-auto p-4 md:p-8">
       <div className="flex justify-between items-center mb-6 non-printable">
        <div />
        <div className="flex items-center space-x-2">
            <button 
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
                <CopyIcon />
                <span>{copyStatus}</span>
            </button>
            <button 
                onClick={handleDownload}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
                <DownloadIcon />
                <span>Download MD</span>
            </button>
            <button 
                onClick={handlePrint}
                title="Print or save as PDF"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
                <PrintIcon />
                <span>Print</span>
            </button>
        </div>
      </div>
      
      <div className="printable-area bg-white dark:bg-gray-800 dark-print:bg-white p-8 sm:p-12 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 dark-print:border-gray-200">
        <header className="pb-6 border-b-2 border-gray-200 dark:border-gray-600 dark-print:border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white dark-print:text-black">Risk Assessment Report</h1>
          <p className="text-md text-gray-500 dark:text-gray-400 dark-print:text-black mt-2">Date of Generation: {reportDate}</p>
          <p className="text-md text-gray-500 dark:text-gray-400 dark-print:text-black">Status: <span className="font-medium text-green-600 dark:text-green-400">Completed</span></p>
        </header>
        
        <article className="py-8">
            <MarkdownRenderer content={reportData.report} />
        </article>

        {reportData.sources && reportData.sources.length > 0 && (
          <footer className="pt-6 border-t border-gray-200 dark:border-gray-600 dark-print:border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 dark-print:text-black mb-3">Grounding Sources</h3>
            <ul className="space-y-3">
              {reportData.sources.map((source, index) => (
                <li key={index} className="text-sm">
                   <span className="font-semibold text-gray-700 dark:text-gray-300 dark-print:text-black">{index + 1}. {source.web.title}</span>
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
          className="px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
        >
          Start New Assessment
        </button>
      </div>
    </div>
  );
};

export default ReportView;