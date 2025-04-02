import { VSCIISettings } from '../App';

/**
 * Convert an image to VSCII (Visual ASCII Art)
 * @param imageUrl - The URL of the image to convert
 * @param settings - The VSCII conversion settings
 * @returns The VSCII text output
 */
export const convertImageToVSCII = (imageUrl: string, settings: VSCIISettings): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        // Get the VSCII text representation
        const vsciiText = processImage(img, settings);
        resolve(vsciiText);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = imageUrl;
  });
};

/**
 * Process the image and convert it to VSCII
 * @param img - The image element
 * @param settings - The VSCII conversion settings
 * @returns The VSCII text output
 */
const processImage = (img: HTMLImageElement, settings: VSCIISettings): string => {
  // Create a canvas to get image data
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Calculate dimensions to maintain aspect ratio
  let width = settings.resolution;
  let height = Math.floor((width / img.width) * img.height) / 2; // Adjust for character aspect ratio
  
  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;
  
  // Draw image to canvas
  ctx.drawImage(img, 0, 0, width, height);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Generate VSCII output based on settings
  return generateVSCII(data, width, height, settings);
};

/**
 * Generate VSCII text from image data
 * @param data - The image data
 * @param width - The width of the image
 * @param height - The height of the image
 * @param settings - The VSCII conversion settings
 * @returns The VSCII text output
 */
const generateVSCII = (data: Uint8ClampedArray, width: number, height: number, settings: VSCIISettings): string => {
  const { characterSet, grayscale, customPrompt } = settings;
  const chars = characterSet.split('');
  let result = '';
  
  // Apply custom prompt if needed
  if (customPrompt) {
    result = `/* ${customPrompt} */\n\n`;
  }
  
  // Process each pixel and convert to characters
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Get pixel index
      const idx = (y * width + x) * 4;
      
      // Get RGB values
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (grayscale) {
        // Calculate grayscale value (weighted)
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Map brightness to character
        const charIndex = Math.floor(brightness / 255 * (chars.length - 1));
        result += chars[chars.length - 1 - charIndex]; // Inverted mapping (darkest char for brightest pixel)
      } else {
        // For color, we still need to map to a character based on brightness
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        const charIndex = Math.floor(brightness / 255 * (chars.length - 1));
        
        // We'll use the same character mapping for simplicity
        // In a full implementation, you might want to apply actual color to the characters
        result += chars[chars.length - 1 - charIndex];
      }
    }
    result += '\n';
  }
  
  return result;
};

/**
 * Apply custom prompt to VSCII output (placeholder for future enhancement)
 * @param vsciiText - The VSCII text to modify
 * @param prompt - The custom prompt to apply
 * @returns The modified VSCII text
 */
export const applyCustomPrompt = (vsciiText: string, prompt: string): string => {
  // In a real application, this function could potentially use AI or other algorithms
  // to modify the VSCII output based on the prompt
  // For now, we'll just add the prompt as a comment
  return prompt ? `/* ${prompt} */\n\n${vsciiText}` : vsciiText;
}; 