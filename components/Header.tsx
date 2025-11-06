
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center space-x-3 sticky top-0 z-10 non-printable">
      <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">AI Risk-Based Decision Assistant</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Gemini</p>
      </div>
    </header>
  );
};

export default Header;