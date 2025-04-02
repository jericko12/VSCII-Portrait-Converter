import React, { useState } from 'react';
import { FiShare2, FiMail, FiClipboard, FiCheck } from 'react-icons/fi';

interface SocialShareProps {
  vsciiOutput: string;
  darkMode: boolean;
}

const SocialShare: React.FC<SocialShareProps> = ({ vsciiOutput, darkMode }) => {
  const [copied, setCopied] = useState(false);
  
  const shareEmail = () => {
    const subject = encodeURIComponent('My VSCII Art Creation');
    const body = encodeURIComponent(`Check out my VSCII art creation:\n\n${vsciiOutput}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(vsciiOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="flex items-center">
          <FiShare2 className="mr-1" />
          Share Your Creation
        </div>
      </label>
      
      <div className="flex space-x-2">
        <button
          onClick={shareEmail}
          className={`flex-1 flex items-center justify-center rounded-md py-2 text-sm font-medium ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title="Share via Email"
        >
          <FiMail className="mr-1" />
          Email
        </button>
        
        <button
          onClick={copyToClipboard}
          className={`flex-1 flex items-center justify-center rounded-md py-2 text-sm font-medium ${
            darkMode 
              ? copied ? 'bg-green-800 text-green-300' : 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title="Copy ASCII art to clipboard"
        >
          {copied ? (
            <>
              <FiCheck className="mr-1" />
              Copied!
            </>
          ) : (
            <>
              <FiClipboard className="mr-1" />
              Copy Art
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SocialShare; 