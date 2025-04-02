import React, { useState } from 'react';
import { FiTrash2, FiEye, FiX, FiSearch, FiDownload } from 'react-icons/fi';

interface GalleryProps {
  arts: Array<{name: string, art: string, isColor: boolean, date: Date}>;
  onLoad: (art: string, isColor: boolean) => void;
  onDelete: (index: number) => void;
  darkMode: boolean;
  onClose: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ arts, onLoad, onDelete, darkMode, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewArt, setPreviewArt] = useState<{name: string, art: string, isColor: boolean} | null>(null);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  const filteredArts = arts.filter(art => 
    art.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const downloadAsTxt = (art: string, name: string) => {
    const element = document.createElement('a');
    const file = new Blob([art], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <div className={`max-w-6xl mx-auto ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            My VSCII Art Gallery
          </h2>
        </div>
        
        <div className="mb-6">
          <div className={`relative ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className={`block w-full pl-10 pr-3 py-2 rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-200 placeholder-gray-400'
              } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="Search saved arts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredArts.length === 0 ? (
          <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
            <p className="font-medium mb-1">No saved arts found</p>
            <p className="text-sm">When you save your VSCII creations, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArts.map((art, index) => (
              <div key={index} className={`border rounded-lg overflow-hidden ${
                darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className={`p-3 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{art.name}</h3>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(art.date)}
                    </div>
                  </div>
                </div>
                
                <div className={`relative p-3 overflow-hidden hover:overflow-auto text-xs ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`} style={{ maxHeight: '120px', whiteSpace: 'pre', fontFamily: 'monospace' }}>
                  {art.art}
                </div>
                
                <div className={`p-2 flex justify-between ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onLoad(art.art, art.isColor)}
                      className={`p-2 rounded ${
                        darkMode 
                          ? 'hover:bg-gray-600 text-blue-400' 
                          : 'hover:bg-gray-200 text-blue-600'
                      }`}
                      title="Load this art"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => downloadAsTxt(art.art, art.name)}
                      className={`p-2 rounded ${
                        darkMode 
                          ? 'hover:bg-gray-600 text-gray-300' 
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Download as text file"
                    >
                      <FiDownload className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setPreviewArt(art)}
                      className={`p-2 rounded ${
                        darkMode 
                          ? 'hover:bg-gray-600 text-green-400' 
                          : 'hover:bg-gray-200 text-green-600'
                      }`}
                      title="View full size"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => onDelete(index)}
                    className={`p-2 rounded ${
                      darkMode 
                        ? 'hover:bg-gray-600 text-red-400' 
                        : 'hover:bg-gray-200 text-red-600'
                    }`}
                    title="Delete this art"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {previewArt && (
        <div className="fixed inset-0 p-4 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className={`relative max-w-4xl w-full max-h-screen overflow-auto rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 px-4 py-3 border-b flex justify-between items-center ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="font-medium">{previewArt.name}</h3>
              <button
                onClick={() => setPreviewArt(null)}
                className={`p-2 rounded-full ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div 
              className={`p-4 overflow-auto font-mono ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}
              style={{ whiteSpace: 'pre' }}
            >
              {previewArt.art}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery; 