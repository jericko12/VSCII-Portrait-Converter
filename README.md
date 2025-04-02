# VSCII Portrait Converter

A web application that converts portrait images to VSCII (Visual ASCII Art) directly in your browser.

## Features

- Convert portrait images to ASCII-based VSCII art
- Adjust resolution and character set for different levels of detail
- Toggle between grayscale and color output
- Dark mode support for comfortable viewing
- Live preview as you adjust settings
- Download as text file (.txt) or image (PNG)
- Copy to clipboard functionality
- Fully client-side processing (your images never leave your computer)
- Responsive design for desktop and mobile

## Running the Application

### Using the Batch File (Windows)

1. Double-click the `start-app.bat` file
2. Open your browser and navigate to http://localhost:5173/

### Using npm

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

If you encounter PowerShell execution policy issues on Windows, use:
```bash
npm run win-dev
```

## How to Use

1. Upload an image by dragging and dropping or using the file selector
2. Adjust the settings:
   - Resolution: Controls the width of the output
   - Character Set: Choose from presets or create your own
   - Grayscale Mode: Toggle between grayscale and color output
   - Custom Prompt: Add specific instructions for the output style
3. View the VSCII preview in real-time
4. Switch between text and image preview modes
5. Download the result as a text file or image, or copy it to your clipboard

## Technologies Used

- TypeScript
- React
- Vite
- Tailwind CSS

## License

ISC 