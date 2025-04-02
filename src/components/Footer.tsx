import React from 'react';
import { FiGithub, FiInstagram, FiFacebook, FiCoffee } from 'react-icons/fi';

interface FooterProps {
  darkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  return (
    <footer className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm mt-auto border-t transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-3 md:mb-0">
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium text-sm`}>
              VSCII Portrait Converter &copy; {new Date().getFullYear()}
            </p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mt-0.5`}>
              All processing is done locally in your browser
            </p>
          </div>
          <div className="flex space-x-3">
            <a 
              href="https://github.com/jericko12" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'} transition-colors`}
              aria-label="GitHub"
              title="GitHub: jericko12"
            >
              <FiGithub className="h-5 w-5" />
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=61574105611075" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'} transition-colors`}
              aria-label="Facebook"
              title="Facebook Page"
            >
              <FiFacebook className="h-5 w-5" />
            </a>
            <a 
              href="https://www.instagram.com/justcallme.eko/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'} transition-colors`}
              aria-label="Instagram"
              title="Instagram: justcallme.eko"
            >
              <FiInstagram className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <div className={`mt-4 pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-100'}`}>
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <FiCoffee className={`mr-2 ${darkMode ? 'text-yellow-500' : 'text-yellow-600'}`} />
              <p className={`font-medium text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Donate a Coffee
              </p>
            </div>
            <div className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>GCash Name: JE****O G.</p>
              <p>GCash Number: 09706436276</p>
            </div>
          </div>
        </div>
        
        <div className={`mt-3 pt-3 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-100'}`}>
          <p className={`text-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Built with TypeScript, React, and Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 