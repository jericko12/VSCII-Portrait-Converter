import React, { useState, useCallback, useRef } from 'react';
import { FiUpload, FiCamera, FiX } from 'react-icons/fi';

interface ImageUploaderProps {
  onImageChange: (image: HTMLImageElement | null) => void;
  darkMode: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, darkMode }) => {
  const [image, setImage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = useCallback((file: File) => {
    setError(null);
    setLoading(true);

    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
        
        // Create image element to pass dimensions to parent
        const img = new Image();
        img.onload = () => {
          console.log('Image loaded successfully:', img.width, 'x', img.height);
          onImageChange(img);
          setLoading(false);
        };
        img.onerror = (e) => {
          console.error('Failed to load image:', e);
          setError('Failed to load image');
          setLoading(false);
        };
        img.src = event.target.result as string;
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  }, [handleImageChange]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageChange(e.target.files[0]);
    }
  }, [handleImageChange]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clearImage = useCallback(() => {
    setImage(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageChange]);

  return (
    <div className={`w-full h-full ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept="image/*"
      />
      
      {!image ? (
        <div
          className={`w-full h-[300px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            dragging 
              ? `${darkMode ? 'border-blue-400 bg-blue-900/10' : 'border-blue-500 bg-blue-50'}` 
              : `${darkMode ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`
          }`}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <div className={`animate-spin rounded-full h-10 w-10 border-t-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'} border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'}`}></div>
              <span className="mt-3 text-sm">Processing...</span>
            </div>
          ) : (
            <>
              <FiUpload className={`w-10 h-10 mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className="text-sm font-medium mb-1">Drag & drop your image here</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>or click to browse</p>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </>
          )}
        </div>
      ) : (
        <div className={`relative w-full h-[300px] rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} transition-colors duration-200`}>
          <img 
            src={image} 
            alt="Preview" 
            className="object-contain w-full h-full"
          />
          <div className="absolute top-0 right-0 p-2">
            <button 
              onClick={clearImage}
              className={`p-1 rounded-full ${darkMode ? 'bg-gray-900 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-200'} shadow transition-colors`}
              aria-label="Remove image"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <div className={`absolute bottom-0 left-0 right-0 p-2 ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm`}>
            <div className="flex items-center text-xs">
              <FiCamera className="w-3 h-3 mr-1" />
              <span className="truncate">Source Image</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 