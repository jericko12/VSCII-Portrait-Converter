import { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import VSCIIConverter from './components/VSCIIConverter';
import VSCIIPreview from './components/VSCIIPreview';
import Header from './components/Header';
import Footer from './components/Footer';
import SocialShare from './components/SocialShare';
import Gallery from './components/Gallery';

export interface VSCIISettings {
  resolution: number;
  characterSet: string;
  grayscale: boolean;
  customPrompt: string;
  animate: boolean;
  animationType: 'simple' | 'pulse' | 'wave' | 'random';
  filterPreset: string;
}

function App() {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [vsciiOutput, setVsciiOutput] = useState<string | null>(null);
  const [isColorOutput, setIsColorOutput] = useState<boolean>(false);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [savedArts, setSavedArts] = useState<Array<{name: string, art: string, isColor: boolean, date: Date}>>(() => {
    const saved = localStorage.getItem('savedArts');
    return saved ? JSON.parse(saved) : [];
  });
  const [saveNotification, setSaveNotification] = useState<{visible: boolean, message: string}>({
    visible: false,
    message: ''
  });
  const [saveButtonState, setSaveButtonState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [settings, setSettings] = useState<VSCIISettings>({
    resolution: 80,
    characterSet: '@%#*+=-:. ',
    grayscale: true,
    customPrompt: '',
    animate: false,
    animationType: 'simple',
    filterPreset: 'none',
  });

  // Reset VSCII output when image is removed
  useEffect(() => {
    if (!uploadedImage) {
      setVsciiOutput(null);
    }
  }, [uploadedImage]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('savedArts', JSON.stringify(savedArts));
  }, [savedArts]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleVSCIIChange = (vsciiString: string, colorOutput: boolean) => {
    setVsciiOutput(vsciiString);
    setIsColorOutput(colorOutput);
  };
  
  const saveCurrentArt = (name: string) => {
    if (!vsciiOutput) return;
    
    // Show saving state
    setSaveButtonState('saving');
    
    // Simulate a small delay to show the saving state
    setTimeout(() => {
      setSavedArts(prev => [
        {
          name,
          art: vsciiOutput,
          isColor: isColorOutput,
          date: new Date()
        },
        ...prev
      ]);
      
      // Show saved state
      setSaveButtonState('saved');
      
      // Show save notification
      setSaveNotification({
        visible: true,
        message: `"${name}" saved to gallery!`
      });
      
      // Reset button state after some time
      setTimeout(() => {
        setSaveButtonState('idle');
      }, 1500);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setSaveNotification({
          visible: false,
          message: ''
        });
      }, 3000);
    }, 500);
  };
  
  const loadArt = (art: string, isColor: boolean) => {
    setVsciiOutput(art);
    setIsColorOutput(isColor);
    setShowGallery(false);
  };
  
  const deleteArt = (index: number) => {
    setSavedArts(prev => prev.filter((_, i) => i !== index));
  };

  const toggleGallery = (show: boolean) => {
    setShowGallery(show);
    
    if (show) {
      // When switching to gallery view, temporarily clear the image and preview
      // This ensures a clean state when switching back
      setUploadedImage(null);
      setVsciiOutput(null);
    } else if (!uploadedImage) {
      // When returning to converter with no image, ensure preview is cleared
      setVsciiOutput(null);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'
    }`}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* Save Notification */}
      {saveNotification.visible && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg bg-green-500 text-white transform transition-all duration-300 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {saveNotification.message}
        </div>
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-center mb-6">
          <div className="flex space-x-4">
            <button 
              onClick={() => toggleGallery(false)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                !showGallery
                  ? darkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Converter
            </button>
            <button 
              onClick={() => toggleGallery(true)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                showGallery
                  ? darkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              My Gallery
            </button>
          </div>
        </div>
        
        {!showGallery ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className={`card hover:shadow-lg transition-all duration-300 h-full ${
              darkMode ? 'bg-gray-800 border-gray-700 hover:shadow-blue-900/20' : 'bg-white border-gray-100 hover:shadow-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center`}>
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Portrait Image
              </h2>
              <div className="mb-6">
                <ImageUploader 
                  onImageChange={setUploadedImage}
                  darkMode={darkMode}
                />
              </div>
              
              {uploadedImage && (
                <div className={`mt-8 pt-8 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-100'}`}>
                  <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center`}>
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Conversion Settings
                  </h2>
                  <VSCIIConverter
                    imageData={uploadedImage}
                    settings={settings}
                    onSettingsChange={setSettings}
                    onVSCIIChange={handleVSCIIChange}
                    onConvert={setVsciiOutput}
                    darkMode={darkMode}
                  />
                </div>
              )}
            </div>
            
            <div className={`card hover:shadow-lg transition-all duration-300 h-full flex flex-col ${
              darkMode ? 'bg-gray-800 border-gray-700 hover:shadow-blue-900/20' : 'bg-white border-gray-100 hover:shadow-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center`}>
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                VSCII Preview
              </h2>
              <div className="flex-grow">
                <VSCIIPreview
                  vsciiOutput={vsciiOutput}
                  isColor={isColorOutput}
                  darkMode={darkMode}
                  animate={settings.animate}
                  animationType={settings.animationType}
                />
              </div>
              
              {vsciiOutput && (
                <div className={`mt-4 pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Save to Gallery
                      </label>
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          id="artName" 
                          placeholder="Name your creation" 
                          className={`flex-1 text-sm rounded-md px-3 py-2 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400'
                          } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        />
                        <button 
                          onClick={() => {
                            const input = document.getElementById('artName') as HTMLInputElement;
                            if (input.value.trim()) {
                              saveCurrentArt(input.value.trim());
                              input.value = '';
                            }
                          }}
                          disabled={saveButtonState !== 'idle'}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            saveButtonState === 'idle'
                              ? darkMode 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                              : saveButtonState === 'saving'
                                ? 'bg-blue-500 text-white cursor-wait'
                                : 'bg-green-500 text-white'
                          } transition-colors flex items-center justify-center min-w-[80px]`}
                        >
                          {saveButtonState === 'idle' && 'Save'}
                          {saveButtonState === 'saving' && (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          )}
                          {saveButtonState === 'saved' && (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                              </svg>
                              Saved!
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <SocialShare 
                      vsciiOutput={vsciiOutput} 
                      darkMode={darkMode} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Gallery 
            arts={savedArts}
            onLoad={loadArt}
            onDelete={deleteArt}
            darkMode={darkMode}
            onClose={() => setShowGallery(false)}
          />
        )}
      </main>
      
      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App; 