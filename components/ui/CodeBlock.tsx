import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({
  code,
  language = 'tsx',
  title,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='relative group'>
      {title && (
        <div className='flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700'>
          <span className='text-sm font-medium text-gray-300'>{title}</span>
          <span className='text-xs text-gray-500'>{language}</span>
        </div>
      )}
      <div className='relative'>
        <pre
          className={`p-4 bg-gray-900 ${title ? '' : 'rounded-t-lg'} rounded-b-lg overflow-x-auto`}
        >
          <code className='text-sm text-gray-100 font-mono'>{code}</code>
        </pre>
        <button
          onClick={copyToClipboard}
          className='absolute top-3 right-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-md transition-colors opacity-0 group-hover:opacity-100'
        >
          {copied ? (
            <>
              <i className='ri-check-line mr-1' />
              Copied!
            </>
          ) : (
            <>
              <i className='ri-file-copy-line mr-1' />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
