import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 p-4 flex items-center space-x-4 sticky top-0 z-10 non-printable">
      <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
        </svg>
      </div>
      <div>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">AI Risk Decision Assistant</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini</p>
      </div>
    </header>
  );
};

export default Header;