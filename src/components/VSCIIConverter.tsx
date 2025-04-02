import React, { useState, useEffect } from 'react';
import { FiSliders, FiToggleRight, FiDownload, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { VSCIISettings } from '../App';
import { convertImageToVSCII } from '../utils/vsciiConverter';

interface VSCIIConverterProps {
  imageData: HTMLImageElement | null;
  onVSCIIChange: (vsciString: string, colorOutput: boolean) => void;
  darkMode: boolean;
  settings: VSCIISettings;
  onSettingsChange: (settings: VSCIISettings) => void;
  onConvert: (vsciiOutput: string) => void;
}

const VSCIIConverter: React.FC<VSCIIConverterProps> = ({ 
  imageData, 
  onVSCIIChange,
  darkMode,
  settings,
  onSettingsChange,
  onConvert
}) => {
  const [complexity, setComplexity] = useState<number>(5);
  const [colorOutput, setColorOutput] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<{ width: number, height: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [outputSize, setOutputSize] = useState<{ characters: number, lines: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invertColors, setInvertColors] = useState<boolean>(false);
  const [contrast, setContrast] = useState<number>(1);
  const [selectedCharSet, setSelectedCharSet] = useState<string>("standard");
  const [manualSizeMode, setManualSizeMode] = useState<boolean>(false);
  const [outputWidth, setOutputWidth] = useState<number>(80);
  const [outputHeight, setOutputHeight] = useState<number>(30);
  const [animate, setAnimate] = useState<boolean>(settings.animate);
  const [animationType, setAnimationType] = useState<string>(settings.animationType);
  const [filterPreset, setFilterPreset] = useState<string>(settings.filterPreset);

  // Predefined character sets
  const presetCharacterSets = {
    standard: '@%#*+=-:. ',
    detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
    simple: '@#+-. ',
    binary: '10 ',
    blocks: '█▓▒░ ',
    custom: settings.characterSet
  };

  // Filter presets for different visual effects
  const filterPresets = {
    none: { contrast: 1, invert: false, brightness: 0, name: "None" },
    highContrast: { contrast: 2, invert: false, brightness: 0, name: "High Contrast" },
    vintage: { contrast: 0.8, invert: false, brightness: -20, name: "Vintage" },
    neon: { contrast: 1.5, invert: true, brightness: 20, name: "Neon" },
    sketch: { contrast: 1.2, invert: false, brightness: 10, name: "Sketch" },
    noir: { contrast: 1.8, invert: true, brightness: -10, name: "Film Noir" }
  };

  useEffect(() => {
    if (imageData) {
      if (!manualSizeMode) {
        const aspectRatio = imageData.width / imageData.height;
        let outputWidth = Math.min(Math.round(80 * (complexity / 5)), 120);
        let outputHeight = Math.round(outputWidth / aspectRatio / 2); // Divide by 2 because characters are taller than wide
        
        // Limit height to reasonable size
        if (outputHeight > 60) {
          outputHeight = 60;
          outputWidth = Math.round(outputHeight * aspectRatio * 2);
        }
        
        setOutputWidth(outputWidth);
        setOutputHeight(outputHeight);
        
        setOutputSize({
          characters: outputWidth,
          lines: outputHeight
        });
      } else {
        setOutputSize({
          characters: outputWidth,
          lines: outputHeight
        });
      }
      
      setImageSize({
        width: imageData.width,
        height: imageData.height
      });
      
      // Clear any previous errors
      setError(null);
      
      // Trigger conversion with default settings
      processImage(imageData, complexity, colorOutput);
    } else {
      setImageSize(null);
      setOutputSize(null);
    }
  }, [imageData, manualSizeMode, outputWidth, outputHeight]);
  
  useEffect(() => {
    // Update the custom characters in preset when settings change
    presetCharacterSets.custom = settings.characterSet;
  }, [settings.characterSet]);

  // Update settings when animation toggle changes
  useEffect(() => {
    onSettingsChange({
      ...settings,
      animate
    });
  }, [animate]);
  
  // Update settings when animation type changes
  useEffect(() => {
    onSettingsChange({
      ...settings,
      animationType
    });
  }, [animationType]);
  
  // Apply filter preset when it changes
  useEffect(() => {
    onSettingsChange({
      ...settings,
      filterPreset
    });
    
    if (filterPreset !== 'none' && filterPresets[filterPreset as keyof typeof filterPresets]) {
      const preset = filterPresets[filterPreset as keyof typeof filterPresets];
      setContrast(preset.contrast);
      setInvertColors(preset.invert);
      
      // Apply the filter and reprocess image if one is loaded
      if (imageData) {
        processImage(imageData, complexity, colorOutput);
      }
    }
  }, [filterPreset]);

  const processImage = async (img: HTMLImageElement, complexityLevel: number, useColor: boolean) => {
    if (!img) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get character set to use
      const charSet = presetCharacterSets[selectedCharSet as keyof typeof presetCharacterSets] || presetCharacterSets.standard;

      // Simple conversion without relying on the utility
      const simpleOutput = generateSimpleAsciiArt(img, complexityLevel, useColor, charSet, invertColors, contrast);
      
      // Call the callback functions with the simple output
      onVSCIIChange(simpleOutput, useColor);
      onConvert(simpleOutput);
    } catch (error) {
      console.error('Error converting image:', error);
      setError(error instanceof Error ? error.message : 'Unknown error during conversion');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply contrast to a pixel value (0-255)
  const applyContrast = (value: number, contrastFactor: number): number => {
    const factor = (259 * (contrastFactor + 255)) / (255 * (259 - contrastFactor));
    const result = Math.round(factor * (value - 128) + 128);
    return Math.max(0, Math.min(255, result));
  };
  
  // Apply brightness adjustment to a pixel value (0-255)
  const applyBrightness = (value: number, brightnessFactor: number): number => {
    const result = value + brightnessFactor;
    return Math.max(0, Math.min(255, result));
  };
  
  // Updated generateSimpleAsciiArt to include brightness adjustment from presets
  const generateSimpleAsciiArt = (
    img: HTMLImageElement, 
    complexityLevel: number, 
    useColor: boolean,
    charSet: string,
    invert: boolean,
    contrastFactor: number
  ): string => {
    // Create a canvas to get image data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Calculate dimensions
    const width = manualSizeMode ? outputWidth : Math.min(Math.round(80 * (complexityLevel / 5)), 120);
    const height = manualSizeMode ? outputHeight : Math.round((width / img.width) * img.height / 2);
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Draw image to canvas
    ctx.drawImage(img, 0, 0, width, height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Get brightness adjustment from filter preset
    let brightnessFactor = 0;
    if (filterPreset !== 'none' && filterPresets[filterPreset as keyof typeof filterPresets]) {
      brightnessFactor = filterPresets[filterPreset as keyof typeof filterPresets].brightness;
    }
    
    // Setup character set for mapping
    const chars = charSet.split('');
    
    let result = '';
    
    // Process each pixel and convert to characters
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Get pixel index
        const idx = (y * width + x) * 4;
        
        // Get RGB values
        let r = data[idx];
        let g = data[idx + 1];
        let b = data[idx + 2];
        
        // Apply contrast adjustment if needed
        if (contrastFactor !== 1) {
          r = applyContrast(r, contrastFactor * 50);
          g = applyContrast(g, contrastFactor * 50);
          b = applyContrast(b, contrastFactor * 50);
        }
        
        // Apply brightness adjustment if needed
        if (brightnessFactor !== 0) {
          r = applyBrightness(r, brightnessFactor);
          g = applyBrightness(g, brightnessFactor);
          b = applyBrightness(b, brightnessFactor);
        }
        
        // Calculate grayscale value (weighted average)
        const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        
        // Map brightness to character index
        let charIndex = Math.floor(brightness / 255 * (chars.length - 1));
        
        // Invert mapping if needed
        if (invert) {
          charIndex = chars.length - 1 - charIndex;
        }
        
        // Add character to result
        result += chars[charIndex];
      }
      result += '\n';
    }
    
    return result;
  };

  const handleComplexityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComplexity = parseInt(e.target.value);
    setComplexity(newComplexity);
    
    if (imageData && !manualSizeMode) {
      const aspectRatio = imageData.width / imageData.height;
      let newWidth = Math.min(Math.round(80 * (newComplexity / 5)), 120);
      let newHeight = Math.round(newWidth / aspectRatio / 2);
      
      // Limit height to reasonable size
      if (newHeight > 60) {
        newHeight = 60;
        newWidth = Math.round(newHeight * aspectRatio * 2);
      }
      
      setOutputWidth(newWidth);
      setOutputHeight(newHeight);
      
      setOutputSize({
        characters: newWidth,
        lines: newHeight
      });
      
      processImage(imageData, newComplexity, colorOutput);
    } else if (imageData) {
      processImage(imageData, newComplexity, colorOutput);
    }
  };

  const handleColorOutputChange = () => {
    const newColorOutput = !colorOutput;
    setColorOutput(newColorOutput);
    
    if (imageData) {
      processImage(imageData, complexity, newColorOutput);
    }
  };
  
  const handleInvertColorsChange = () => {
    const newInvertValue = !invertColors;
    setInvertColors(newInvertValue);
    
    if (imageData) {
      processImage(imageData, complexity, colorOutput);
    }
  };
  
  const handleContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContrast = parseFloat(e.target.value);
    setContrast(newContrast);
    
    if (imageData) {
      processImage(imageData, complexity, colorOutput);
    }
  };
  
  const handleCharSetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCharSet = e.target.value;
    setSelectedCharSet(newCharSet);
    
    if (imageData) {
      processImage(imageData, complexity, colorOutput);
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value);
    setOutputWidth(newWidth);
    
    if (!manualSizeMode) {
      setManualSizeMode(true);
    }
  };
  
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value);
    setOutputHeight(newHeight);
    
    if (!manualSizeMode) {
      setManualSizeMode(true);
    }
  };
  
  const toggleManualSize = () => {
    const newMode = !manualSizeMode;
    setManualSizeMode(newMode);
    
    if (!newMode && imageData) {
      // Reset to automatic sizing
      const aspectRatio = imageData.width / imageData.height;
      let newWidth = Math.min(Math.round(80 * (complexity / 5)), 120);
      let newHeight = Math.round(newWidth / aspectRatio / 2);
      
      // Limit height to reasonable size
      if (newHeight > 60) {
        newHeight = 60;
        newWidth = Math.round(newHeight * aspectRatio * 2);
      }
      
      setOutputWidth(newWidth);
      setOutputHeight(newHeight);
      
      setOutputSize({
        characters: newWidth,
        lines: newHeight
      });
      
      processImage(imageData, complexity, colorOutput);
    }
  };

  const downloadVSCII = () => {
    if (!imageData) return;
    
    try {
      // Instead of trying to find the content in the DOM, use the same content 
      // that was passed to the onConvert callback
      // First try to get it from the actual preview element
      let content = '';
      
      // Try getting content from the preview element directly
      const previewElement = document.querySelector('.vscii-preview pre');
      if (previewElement && previewElement.textContent) {
        content = previewElement.textContent;
      } 
      // If that fails, try to get it from any pre element that might have the output
      else {
        const anyPreElement = document.querySelector('pre');
        if (anyPreElement && anyPreElement.textContent) {
          content = anyPreElement.textContent;
        }
      }
      
      // If we still don't have content, check if we have direct access to vsciiOutput callback
      if (!content.trim() && onConvert) {
        const tempOutput = generateSimpleAsciiArt(
          imageData, 
          complexity, 
          colorOutput,
          presetCharacterSets[selectedCharSet as keyof typeof presetCharacterSets] || presetCharacterSets.standard,
          invertColors,
          contrast
        );
        content = tempOutput;
      }
      
      // Final fallback - just regenerate the output
      if (!content.trim()) {
        console.error('Could not find VSCII content, regenerating...');
        content = generateSimpleAsciiArt(
          imageData, 
          complexity, 
          colorOutput,
          presetCharacterSets[selectedCharSet as keyof typeof presetCharacterSets] || presetCharacterSets.standard,
          invertColors,
          contrast
        );
      }
      
      if (!content.trim()) {
        console.error('Failed to generate VSCII content for download');
        return;
      }
      
      // Create the download
      const element = document.createElement('a');
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'vscii-art.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error downloading VSCII:', error);
    }
  };

  const handleSettingChange = (field: keyof VSCIISettings, value: string | number | boolean) => {
    onSettingsChange({
      ...settings,
      [field]: value
    });
  };

  const handleCharacterSetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      // Keep the current custom character set
      return;
    }
    
    const selectedSet = presetCharacterSets[value as keyof typeof presetCharacterSets];
    handleSettingChange('characterSet', selectedSet);
  };

  const getSelectedPreset = () => {
    const entries = Object.entries(presetCharacterSets);
    const found = entries.find(([_, chars]) => chars === settings.characterSet);
    return found ? found[0] : 'custom';
  };
  
  const handleCustomCharSetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCustomSet = e.target.value;
    
    if (newCustomSet.length > 0) {
      handleSettingChange('characterSet', newCustomSet);
      
      if (imageData && selectedCharSet === 'custom') {
        processImage(imageData, complexity, colorOutput);
      }
    }
  };

  const handleAnimateChange = () => {
    const newValue = !animate;
    setAnimate(newValue);
    
    // Also update settings
    onSettingsChange({
      ...settings,
      animate: newValue
    });
  };
  
  const handleAnimationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as 'simple' | 'pulse' | 'wave' | 'random';
    setAnimationType(newValue);
    
    // Also update settings
    onSettingsChange({
      ...settings,
      animationType: newValue
    });
  };
  
  const handleFilterPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterPreset(e.target.value);
  };

  // Access the current VSCII output for download
  const vsciiOutput = (() => {
    try {
      // Try to get it from a ref or state somewhere
      return document.querySelector('.vscii-preview')?.textContent || '';
    } catch (e) {
      return '';
    }
  })();

  return (
    <div className={`w-full h-full ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
      <div className={`flex flex-col p-5 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-200`}>
        <div className="flex items-center mb-4">
          <FiSliders className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className="font-semibold">Settings</h3>
        </div>
        
        {loading && (
          <div className="text-center py-2">
            <div className={`inline-block animate-spin rounded-full h-5 w-5 border-t-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'} border-r-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'} border-b-2 ${darkMode ? 'border-blue-400/30' : 'border-blue-500/30'} border-l-2 ${darkMode ? 'border-blue-400/30' : 'border-blue-500/30'}`}></div>
            <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Processing...</span>
          </div>
        )}
        
        {error && (
          <div className={`text-center py-2 mb-4 px-3 rounded-md ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-500'}`}>
            <div className="flex items-center">
              <FiAlertTriangle className="mr-2" />
              <span className="text-sm">Error: {error}</span>
            </div>
          </div>
        )}
        
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Complexity Level
            </label>
            <div className="flex items-center">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Simple</span>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={complexity}
                onChange={handleComplexityChange}
                className={`mx-2 flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
              />
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Detailed</span>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Output Mode
            </label>
            <div className="flex space-x-4">
              <label className={`inline-flex items-center cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={colorOutput}
                  onChange={handleColorOutputChange}
                />
                <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 ${
                  colorOutput 
                    ? 'bg-blue-600' 
                    : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    colorOutput ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
                <span className="ml-2 text-sm">Color Output</span>
              </label>
              
              <label className={`inline-flex items-center cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={animate}
                  onChange={handleAnimateChange}
                />
                <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 ${
                  animate 
                    ? 'bg-blue-600' 
                    : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    animate ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
                <span className="ml-2 text-sm">Animate</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Character Set
            </label>
            <select
              value={selectedCharSet}
              onChange={handleCharSetChange}
              className={`block w-full rounded-md text-sm py-1.5 px-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-700'
              } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              <option value="standard">Standard Set</option>
              <option value="detailed">Detailed Set</option>
              <option value="simple">Simple Set</option>
              <option value="binary">Binary (0's & 1's)</option>
              <option value="blocks">Block Characters</option>
              <option value="custom">Custom Set</option>
            </select>
            
            {selectedCharSet === 'custom' && (
              <input
                type="text"
                value={settings.characterSet}
                onChange={handleCustomCharSetChange}
                placeholder="Enter custom characters (darkest to lightest)"
                className={`mt-2 block w-full rounded-md text-sm py-1.5 px-2 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
                } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
            )}
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Filter Preset
            </label>
            <select
              value={filterPreset}
              onChange={handleFilterPresetChange}
              className={`block w-full rounded-md text-sm py-1.5 px-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-700'
              } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              {Object.entries(filterPresets).map(([key, preset]) => (
                <option key={key} value={key}>{preset.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Contrast
            </label>
            <div className="flex items-center">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Low</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={contrast}
                onChange={handleContrastChange}
                className={`mx-2 flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
              />
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>High</span>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Invert Colors
            </label>
            <label className={`inline-flex items-center cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                className="sr-only"
                checked={invertColors}
                onChange={handleInvertColorsChange}
              />
              <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 ${
                invertColors 
                  ? 'bg-blue-600' 
                  : darkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  invertColors ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </div>
              <span className="ml-2 text-sm">{invertColors ? 'Inverted' : 'Normal'}</span>
            </label>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Output Size
            </label>
            <label className={`inline-flex items-center cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                className="sr-only"
                checked={manualSizeMode}
                onChange={toggleManualSize}
              />
              <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 ${
                manualSizeMode 
                  ? 'bg-blue-600' 
                  : darkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  manualSizeMode ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </div>
              <span className="ml-2 text-sm">Manual Size</span>
            </label>
          </div>
          
          {manualSizeMode ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Width (chars)
                </label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={outputWidth}
                  onChange={handleWidthChange}
                  className={`block w-full rounded-md text-sm py-1 px-2 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-700'
                  } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Height (lines)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={outputHeight}
                  onChange={handleHeightChange}
                  className={`block w-full rounded-md text-sm py-1 px-2 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-700'
                  } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
            </div>
          ) : (
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {outputSize ? (
                <p>Auto size: {outputSize.characters} × {outputSize.lines} characters</p>
              ) : (
                <p>Size will adjust based on complexity and aspect ratio</p>
              )}
            </div>
          )}
        </div>
        
        {imageSize && outputSize && (
          <div className={`text-xs px-3 py-2 rounded-md mb-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className="flex justify-between mb-1">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Original Size:</span>
              <span>{imageSize.width} × {imageSize.height}px</span>
            </div>
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Output Size:</span>
              <span>{outputSize.characters} × {outputSize.lines} chars</span>
            </div>
          </div>
        )}
        
        {animate && (
          <div className="mt-2 ml-6">
            <label 
              htmlFor="animationType" 
              className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
            >
              Animation Style
            </label>
            <select
              id="animationType"
              value={animationType}
              onChange={handleAnimationTypeChange}
              className={`form-select w-full text-sm rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500'
              }`}
            >
              <option value="simple">Simple Rotation</option>
              <option value="pulse">Pulse Effect</option>
              <option value="wave">Wave Animation</option>
              <option value="random">Random Characters</option>
            </select>
            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Choose an animation style for your VSCII art
            </p>
          </div>
        )}
        
        <button 
          onClick={downloadVSCII}
          className={`mt-2 flex items-center justify-center px-4 py-2 rounded-md ${
            imageData && !loading 
              ? `${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white` 
              : `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
          } transition-colors`}
          disabled={!imageData || loading}
        >
          <FiDownload className="mr-2" />
          <span>Download VSCII</span>
        </button>
      </div>
    </div>
  );
};

export default VSCIIConverter; 