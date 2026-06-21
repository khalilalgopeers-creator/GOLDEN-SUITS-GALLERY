import { GoogleGenAI } from "@google/genai";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Download } from "lucide-react";

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: 'A high-quality cinematic fashion photograph of six handsome men wearing tailored high-fashion golden suits, posing together dynamically inside an opulent, dimly lit ballroom with shimmering crystal chandeliers and dark wood paneling.',
            },
          ],
        },
      });
      
      let foundUrl = null;
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            foundUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
            break;
          }
        }
      }
      
      if (foundUrl) {
        setImageUrl(foundUrl);
      } else {
        setError("No image data found in the response.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while generating the image.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "golden-essence-editorial.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    generateImage();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-zinc-950 text-zinc-100 p-6 md:px-10 md:py-10 font-sans">
      <div className="w-full max-w-5xl flex-1 flex flex-col items-center pb-8">
        <header className="mb-10 text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-black leading-none uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-700">
            Golden Essence
          </h1>
          <p className="mt-4 text-zinc-400 max-w-md font-medium text-sm md:text-base mx-auto">
            An AI-generated editorial featuring six gentlemen in immaculate metallic gold suits.
          </p>
        </header>
        
        <div className="relative w-full aspect-[4/3] md:aspect-video bg-gradient-to-b from-amber-400 to-amber-900 rounded-3xl overflow-hidden shadow-2xl shadow-amber-900/20 flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 text-amber-500 transition-all duration-300">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="tracking-widest uppercase text-xs font-semibold">Generating Masterpiece...</p>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="text-red-400 p-8 text-center bg-zinc-950/90 rounded-lg max-w-lg z-10 border border-red-900/50">
              <p className="font-semibold mb-2">Generation Failed</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          )}
          
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Six handsome men wearing golden suits" 
              className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoading ? 'opacity-50 grayscale hover:grayscale-0' : 'opacity-100'}`}
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <button
            onClick={generateImage}
            disabled={isLoading}
            className="group relative inline-flex items-center justify-center gap-3 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:-rotate-90 transition-transform duration-500'}`} />
            <span className="text-sm">
              {isLoading ? 'Generating...' : 'Regenerate'}
            </span>
          </button>
          
          {imageUrl && !isLoading && (
            <button
              onClick={downloadImage}
              className="group relative inline-flex items-center justify-center gap-3 px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800 text-amber-500 font-bold uppercase tracking-widest rounded-full transition-all duration-300"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" />
              <span className="text-sm">Download Image</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
