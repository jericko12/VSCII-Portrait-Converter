import React, { useRef, useState, useEffect } from 'react';
import { FiCopy, FiDownload, FiImage, FiFileText, FiType, FiSettings } from 'react-icons/fi';

interface VSCIIPreviewProps {
  vsciiOutput: string | null;
  isColor: boolean;
  darkMode: boolean;
  animate?: boolean;
  animationType?: 'simple' | 'pulse' | 'wave' | 'random';
}

const VSCIIPreview: React.FC<VSCIIPreviewProps> = ({ vsciiOutput, isColor, darkMode, animate = false, animationType = 'simple' }) => {
  const [previewType, setPreviewType] = useState<'text' | 'image'>('text');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const [fontFamily, setFontFamily] = useState<string>('monospace');
  const [lineHeight, setLineHeight] = useState<number>(1.2);
  const [bgColor, setBgColor] = useState<string>(darkMode ? '#1E293B' : '#FFFFFF');
  const [textColor, setTextColor] = useState<string>(darkMode ? '#E5E7EB' : '#111827');
  const [animationFrame, setAnimationFrame] = useState<number>(0);
  const [animationScale, setAnimationScale] = useState<number>(1.0);
  const [animationPhase, setAnimationPhase] = useState<number>(0);
  
  const previewRef = useRef<HTMLPreElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Update colors when darkMode changes
  useEffect(() => {
    setBgColor(darkMode ? '#1E293B' : '#FFFFFF');
    setTextColor(darkMode ? '#E5E7EB' : '#111827');
  }, [darkMode]);
  
  // Handle animation effect
  useEffect(() => {
    if (animate && vsciiOutput) {
      // Start animation loop
      const startTime = Date.now();
      
      const animateText = () => {
        const elapsed = Date.now() - startTime;
        
        // Handle different animation types
        switch (animationType) {
          case 'simple':
            // Change animation frame every 150ms for simple rotation
            const newFrame = Math.floor(elapsed / 150) % 4;
            setAnimationFrame(newFrame);
            break;
            
          case 'pulse':
            // Create a pulsing effect that changes size/scale
            const pulseScale = 0.8 + (0.4 * Math.sin(elapsed / 500));
            setAnimationScale(pulseScale);
            setAnimationFrame(Math.floor(elapsed / 200) % 4);
            break;
            
          case 'wave':
            // Create a wave-like animation that moves through the text
            setAnimationPhase((elapsed / 100) % (Math.PI * 2));
            setAnimationFrame(Math.floor(elapsed / 200) % 4);
            break;
            
          case 'random':
            // Randomly change characters at different rates
            if (elapsed % 80 === 0) {
              setAnimationFrame(Math.floor(Math.random() * 1000));
            }
            break;
            
          default:
            setAnimationFrame(Math.floor(elapsed / 150) % 4);
        }
        
        animationRef.current = requestAnimationFrame(animateText);
      };
      
      animationRef.current = requestAnimationFrame(animateText);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [animate, animationType, vsciiOutput]);

  const downloadAsTxt = () => {
    if (!vsciiOutput) return;
    
    setDownloadStarted(true);
    
    // Create a text file with the VSCII art
    // Make sure to use the actual current content
    const content = previewRef.current?.textContent || vsciiOutput;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    
    // Create download link
    element.href = URL.createObjectURL(file);
    element.download = 'vscii-art.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setTimeout(() => setDownloadStarted(false), 1000);
  };

  const copyToClipboard = () => {
    if (!vsciiOutput) return;
    
    navigator.clipboard.writeText(vsciiOutput)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const downloadAsImage = () => {
    if (!canvasRef.current || !vsciiOutput) return;

    setDownloadStarted(true);
    // Draw the VSCII art to the canvas
    renderTextToCanvas();
    
    // Create a download link
    const link = document.createElement('a');
    link.download = 'vscii-art.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    setTimeout(() => setDownloadStarted(false), 1000);
  };

  // Apply animation to characters based on type
  const applyAnimation = (char: string, index: number, lineIndex: number) => {
    if (!animate) return char;
    
    // Simple character animation based on frame and character position
    const animationSet = ['|', '/', '-', '\\'];
    
    switch (animationType) {
      case 'simple':
        // Simple rotation animation
        const shouldAnimateSimple = (index % 10 === 0); // Animate every 10th character
        if (shouldAnimateSimple) {
          return animationSet[animationFrame];
        }
        break;
        
      case 'pulse':
        // Pulse animation - characters breathe in and out
        const shouldAnimatePulse = ((index + lineIndex) % 7 === 0);
        if (shouldAnimatePulse) {
          const pulseChar = animationScale > 1.0 ? '#' : '.';
          return pulseChar;
        }
        break;
        
      case 'wave':
        // Wave animation - wave passes through the text
        const shouldAnimateWave = (Math.sin(index * 0.2 + animationPhase) > 0.7);
        if (shouldAnimateWave) {
          return animationSet[animationFrame];
        }
        break;
        
      case 'random':
        // Random character animation
        const shouldAnimateRandom = ((index * lineIndex) % 23 === animationFrame % 23);
        if (shouldAnimateRandom) {
          const randomChars = '@#$%&*+=-:.?!|/\\';
          return randomChars[Math.floor(Math.random() * randomChars.length)];
        }
        break;
    }
    
    return char;
  };

  const renderTextToCanvas = () => {
    if (!canvasRef.current || !vsciiOutput) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background based on dark mode
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate the dimensions based on the VSCII output
    const lines = vsciiOutput.split('\n');
    const maxLineWidth = Math.max(...lines.map(line => line.length)) * (fontSize * 0.6);
    
    // Set canvas size
    canvas.width = maxLineWidth + 40; // Add padding
    canvas.height = lines.length * (fontSize * lineHeight) + 40;
    
    // Set text properties
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';
    
    // Draw the text
    if (isColor) {
      // For color mode, each character might have color information
      lines.forEach((line, lineIndex) => {
        Array.from(line).forEach((char, charIndex) => {
          // Generate a color based on the character (for demonstration)
          const hue = (char.charCodeAt(0) * 10) % 360;
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
          
          const animatedChar = applyAnimation(char, charIndex, lineIndex);
          ctx.fillText(animatedChar, 20 + charIndex * (fontSize * 0.6), 20 + lineIndex * (fontSize * lineHeight));
        });
      });
    } else {
      // Set text color based on dark mode
      ctx.fillStyle = textColor;
      lines.forEach((line, lineIndex) => {
        if (animate) {
          // Apply animation to individual characters
          Array.from(line).forEach((char, charIndex) => {
            const animatedChar = applyAnimation(char, charIndex, lineIndex);
            ctx.fillText(animatedChar, 20 + charIndex * (fontSize * 0.6), 20 + lineIndex * (fontSize * lineHeight));
          });
        } else {
          ctx.fillText(line, 20, 20 + lineIndex * (fontSize * lineHeight));
        }
      });
    }
  };

  useEffect(() => {
    if (previewType === 'image' && vsciiOutput) {
      renderTextToCanvas();
    }
  }, [previewType, vsciiOutput, isColor, darkMode, fontSize, fontFamily, lineHeight, bgColor, textColor, animationFrame]);

  // Apply animation to text output
  const getAnimatedText = () => {
    if (!vsciiOutput || !animate) return vsciiOutput;
    
    const lines = vsciiOutput.split('\n');
    const animatedLines = lines.map((line, lineIndex) => {
      return Array.from(line).map((char, charIndex) => {
        return applyAnimation(char, charIndex, lineIndex);
      }).join('');
    });
    
    return animatedLines.join('\n');
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
      {!vsciiOutput && (
        <div className={`flex-grow flex flex-col items-center justify-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} p-6`}>
          <svg className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="text-center font-medium mb-1 text-sm">No preview available yet</p>
          <p className={`text-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Upload an image to see the VSCII preview</p>
        </div>
      )}
      
      {vsciiOutput && (
        <div className="flex-grow flex flex-col h-full">
          <div className="flex justify-between mb-3">
            <div className={`flex ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1 shadow-inner transition-colors duration-200`}>
              <button
                className={`tab-button ${
                  previewType === 'text' 
                    ? `${darkMode ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-600'} shadow`
                    : `${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`
                } rounded-md px-3 py-1 transition-colors`}
                onClick={() => setPreviewType('text')}
              >
                <div className="flex items-center text-sm">
                  <FiFileText className="w-3.5 h-3.5 mr-1" />
                  Text
                </div>
              </button>
              <button
                className={`tab-button ${
                  previewType === 'image' 
                    ? `${darkMode ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-600'} shadow`
                    : `${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`
                } rounded-md px-3 py-1 transition-colors`}
                onClick={() => setPreviewType('image')}
              >
                <div className="flex items-center text-sm">
                  <FiImage className="w-3.5 h-3.5 mr-1" />
                  Image
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              title="Display settings"
            >
              <FiSettings className={`w-4 h-4 ${showSettings ? 'text-blue-500' : ''}`} />
            </button>
          </div>
          
          {showSettings && (
            <div className={`mb-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-sm`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-medium">Font Size</label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="8"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className={`w-full h-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-blue-600`}
                    />
                    <span className="ml-2 text-xs">{fontSize}px</span>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1 text-xs font-medium">Line Height</label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0.8"
                      max="2"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                      className={`w-full h-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-blue-600`}
                    />
                    <span className="ml-2 text-xs">{lineHeight.toFixed(1)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1 text-xs font-medium">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className={`w-full px-2 py-1 text-xs rounded-md border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="monospace">Monospace</option>
                    <option value="'Courier New', Courier, monospace">Courier New</option>
                    <option value="'Lucida Console', Monaco, monospace">Lucida Console</option>
                    <option value="consolas, monospace">Consolas</option>
                  </select>
                </div>
                
                {previewType === 'image' && (
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="block mb-1 text-xs font-medium">Background</label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full h-6 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1 text-xs font-medium">Text Color</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-6 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className={`flex-grow relative ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <div className={`absolute top-0 right-0 flex space-x-1 p-2 ${darkMode ? 'bg-gray-800 bg-opacity-60' : 'bg-white bg-opacity-60'}`}>
              <button
                onClick={copyToClipboard}
                className={`p-1.5 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                title="Copy to clipboard"
              >
                <FiCopy className={`w-3.5 h-3.5 ${copySuccess ? 'text-green-500' : ''}`} />
              </button>
              <button
                onClick={previewType === 'image' ? downloadAsImage : downloadAsTxt}
                className={`p-1.5 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                title={`Download as ${previewType === 'image' ? 'image' : 'text'}`}
              >
                <FiDownload className={`w-3.5 h-3.5 ${downloadStarted ? 'text-green-500' : ''}`} />
              </button>
            </div>
            
            {previewType === 'text' ? (
              <pre 
                ref={previewRef}
                className={`h-full overflow-auto p-4 font-mono text-${fontSize/16}rem leading-[${lineHeight}] whitespace-pre`}
                style={{ fontFamily }}
              >
                {animate ? getAnimatedText() : vsciiOutput}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center p-4">
                <canvas ref={canvasRef} className="max-w-full max-h-full" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VSCIIPreview; 