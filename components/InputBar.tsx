import React, { useState, useRef, useEffect } from 'react';
import SendIcon from './icons/SendIcon';

interface InputBarProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  placeholderText: string;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading, placeholderText }) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSendMessage(content);
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <footer className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 z-10">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            rows={1}
            disabled={isLoading}
            style={{ maxHeight: '200px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </footer>
  );
};

export default InputBar;
