import React from 'react';
import AiIcon from './icons/AiIcon';
import UserIcon from './icons/UserIcon';
import MarkdownRenderer from './MarkdownRenderer';

// FIX: The types `Message` and `Role` are no longer exported from `types.ts`.
// They are defined locally here to resolve the import error. This component appears to be unused.
enum Role {
  USER = 'user',
  MODEL = 'model',
}

interface Message {
  role: Role;
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isFinalReport?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isFinalReport = false }) => {
  const isModel = message.role === Role.MODEL;

  const containerClasses = isModel
    ? 'flex items-start space-x-3'
    : 'flex items-start flex-row-reverse space-x-3 space-x-reverse';

  const bubbleClasses = isModel
    ? isFinalReport 
        ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl w-full' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-r-2xl rounded-bl-2xl'
    : 'bg-blue-600 text-white rounded-l-2xl rounded-br-2xl';
    
  const avatar = isModel ? <AiIcon /> : <UserIcon />;

  return (
    <div className={containerClasses}>
      <div className="flex-shrink-0">{avatar}</div>
      <div className={`p-4 max-w-lg ${bubbleClasses}`}>
        {isFinalReport ? (
            <MarkdownRenderer content={message.content} />
        ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;