
import React from 'react';
import { marked, type Tokens } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
}

const iconMap: Record<string, { svg: string; className: string }> = {
    Financial: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 mr-1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 010 1.5h-.75m0 0a.75.75 0 01-.75-.75v-.75m0 0A.75.75 0 013 6v.75m0 0v.75A.75.75 0 013.75 9h.75m0 0v-.75A.75.75 0 013.75 6h.75m0 0A.75.75 0 015.25 6v.75m0 0v.75a.75.75 0 01-.75.75h-.75m0 0a.75.75 0 01-.75-.75V7.5m0 0V6A.75.75 0 014.5 5.25h.75M5.25 6h.75a.75.75 0 010 1.5H5.25m0 0V6m0 0a.75.75 0 01.75-.75h.75M6 5.25v.75A.75.75 0 015.25 6h-.75m0 0V5.25m0 0h.75a.75.75 0 01.75.75v.75m0 0a.75.75 0 01-.75.75H6m0 0v.75A.75.75 0 015.25 9h-.75M6 9h.75a.75.75 0 010 1.5H6m0 0v.75A.75.75 0 015.25 12h-.75m0 0V9m0 0a.75.75 0 01.75-.75h.75M7.5 9h.75a.75.75 0 010 1.5H7.5m0 0V9m0 0A.75.75 0 018.25 9h.75m0 0V7.5m0 0A.75.75 0 018.25 6h.75M9 6h.75a.75.75 0 010 1.5H9m0 0V6m0 0A.75.75 0 019.75 5.25h.75M11.25 3.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V3.75m0 0h.75A.75.75 0 0112 4.5v.75m0 0h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75V9m0 0h-3m0 0v.75a.75.75 0 01.75.75h.75a.75.75 0 01.75-.75V9m0 0h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75V12m0 0h-3m0 0v.75a.75.75 0 01.75.75h.75a.75.75 0 01.75-.75V12m0 0h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75v3.75m0 0v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75m0 0h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75V21m0 0h-3m0 0v.75a.75.75 0 01.75.75h.75a.75.75 0 01.75-.75V21m0 0h.75a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75V18.75m-3-3.75h.75a.75.75 0 010 1.5h-.75m0 0V15m0 0A.75.75 0 0112.75 15h.75m0 0V13.5m0 0A.75.75 0 0112.75 12h.75m0 0h.75a.75.75 0 010 1.5h-.75m0 0V12m0 0A.75.75 0 0114.25 11.25h.75m0 0h.75a.75.75 0 010 1.5h-.75m0 0V11.25m0 0a.75.75 0 01.75-.75h.75M15 9h.75a.75.75 0 010 1.5H15m0 0V9m0 0a.75.75 0 01.75-.75h.75M15.75 9h.75a.75.75 0 010 1.5h-.75m0 0V9m0 0A.75.75 0 0116.5 8.25h.75m0 0V7.5m0 0A.75.75 0 0116.5 6h.75m0 0h.75a.75.75 0 010 1.5h-.75m0 0V6m0 0a.75.75 0 01.75-.75h.75m0 0A.75.75 0 0119.5 6v.75m0 0v.75a.75.75 0 01-.75.75h-.75m0 0a.75.75 0 01-.75-.75V7.5m0 0V6"></path></svg>`,
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    Operational: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 mr-1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"></path></svg>`,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    },
    Strategic: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 mr-1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a16.5 16.5 0 01-2.618 6.03m2.618-6.03a16.5 16.5 0 00-2.618-6.03m0 0a16.5 16.5 0 00-6.03-2.618m6.03 2.618a16.5 16.5 0 01-6.03 2.618m0 0a16.5 16.5 0 01-6.03-2.618m6.03 2.618a6 6 0 01-7.38-5.84m12.18 0a16.49 16.49 0 00-7.38-5.84m7.38 5.84a6 6 0 015.84 7.38m-5.84-7.38a16.5 16.5 0 002.618-6.03m-2.618 6.03a16.5 16.5 0 012.618 6.03m0 0a16.5 16.5 0 016.03 2.618m-6.03-2.618a16.5 16.5 0 006.03-2.618m0 0a16.5 16.5 0 007.38 5.84m-7.38-5.84a6 6 0 01-5.84-7.38"></path></svg>`,
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    },
    Compliance: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 mr-1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"></path></svg>`,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
};

const renderer = new marked.Renderer();
renderer.listitem = (token: Tokens.ListItem) => {
    const text = token.text;
    let outputText = text;
    let tagHtml = '';

    const tagKey = Object.keys(iconMap).find(key => text.includes(`(${key})`));

    if (tagKey) {
        const { svg, className } = iconMap[tagKey];
        const printClasses = `print-tag risk-tag-${tagKey.toLowerCase()}`;
        tagHtml = `<span class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${className} ${printClasses}">${svg} ${tagKey}</span>`;
        outputText = text.replace(`(${tagKey})`, '').trim();
    }
    
    const taskListItem = token.task
        ? `<input type="checkbox" disabled ${token.checked ? 'checked' : ''}> `
        : '';
        
    const parsedContent = marked.parseInline(outputText);

    if (tagHtml) {
        return `<li class="flex items-start mb-2">${taskListItem}<span class="flex-grow">${parsedContent}</span><span class="ml-2 flex-shrink-0">${tagHtml}</span></li>`;
    }

    return `<li>${taskListItem}${parsedContent}</li>`;
};
marked.use({ renderer });

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const dirtyHtml = marked.parse(content) as string;
    const cleanHtml = DOMPurify.sanitize(dirtyHtml);

    return (
        <div 
            className="prose prose-blue dark:prose-invert max-w-none 
                       prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400
                       prose-table:border prose-th:p-2 prose-th:border prose-td:p-2 prose-td:border
                       dark:prose-table:border-gray-600 dark:prose-th:border-gray-600 dark:prose-td:border-gray-600"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
    );
};

export default MarkdownRenderer;
