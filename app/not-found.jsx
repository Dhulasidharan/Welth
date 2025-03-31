'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [funnyError, setFunnyError] = useState('');
  const isClient = useRef(false);
  const [alienPosition, setAlienPosition] = useState({ x: 0, y: 0 });
  const [showTip, setShowTip] = useState(false);

  const funnyErrors = [
    "Oops! Our webpage has gone on vacation without telling us.",
    "404: Page playing hide and seek. It's winning.",
    "This page is in another castle.",
    "Looks like this page took a wrong turn at Albuquerque.",
    "Our servers are having an existential crisis.",
    "This page has been abducted by aliens!",
    "Error 404: Page not found. But we found a GIF of a cat instead.",
    "The page you're looking for is socially distancing.",
    "This link is broken, just like my dreams.",
    "Page not found. Did you try turning it off and on again?"
  ];

  // Generate stars for space background
  const generateStars = (count) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: ((i * 83) % 100),
        y: ((i * 47) % 100),
        size: ((i % 3) + 1),
        blink: i % 5 === 0
      });
    }
    return stars;
  };

  // Handle client-side effects
  useEffect(() => {
    isClient.current = true;
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      // Move alien to follow mouse with a delay
      setTimeout(() => {
        setAlienPosition({
          x: e.clientX - 50,
          y: e.clientY - 50
        });
      }, 300);
    };

    // Set a random funny error
    setFunnyError(funnyErrors[Math.floor(Date.now() % funnyErrors.length)]);
    
    window.addEventListener("mousemove", handleMouseMove);
    
    // Make elements visible after component mounts for fade-in effect
    setIsVisible(true);
    
    // Show tips after 5 seconds
    const tipTimer = setTimeout(() => setShowTip(true), 5000);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(tipTimer);
    };
  }, []);

  // Handle fake search
  const handleSearch = (e) => {
    e.preventDefault();
    setCount(prev => prev + 1);
    
    // Show a new funny error message when searching
    setFunnyError(funnyErrors[Math.floor((Date.now() + count) % funnyErrors.length)]);
    
    // Clear search after the search animation
    setTimeout(() => setSearchTerm(''), 1200);
  };

  const stars = generateStars(100);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] text-center relative overflow-hidden bg-gradient-to-b from-blue-950 to-purple-950 text-white">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-white ${star.blink ? 'twinkling-star' : ''}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.size === 1 ? 0.6 : 0.9
            }}
          />
        ))}
      </div>

      {/* UFO alien ship */}
      {isClient.current && (
        <div 
          className="absolute ufo"
          style={{
            left: alienPosition.x, 
            top: alienPosition.y,
            transition: 'top 0.4s ease-out, left 0.4s ease-out',
            zIndex: 5
          }}
        >
          <div className="w-24 h-12 bg-slate-600 rounded-full relative flex items-center justify-center overflow-visible">
            <div className="absolute -bottom-2 w-16 h-2 bg-slate-700 rounded-full"></div>
            <div className="absolute -top-4 w-12 h-8 bg-green-400 rounded-full overflow-hidden flex justify-center items-start pt-1">
              <div className="w-4 h-1 bg-black rounded-full"></div>
              <div className="w-4 h-1 bg-black rounded-full ml-2"></div>
            </div>
            <div className="absolute -bottom-6 w-1 h-6 bg-yellow-400"></div>
          </div>
        </div>
      )}

      {/* Hover effect light beam */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-screen pointer-events-none opacity-10 abduction-beam"></div>

      {/* Main content with parallax effect */}
      <div
        className="relative z-10 main-content p-8"
        style={{
          transform: isClient.current ? `translate(${mousePosition.x / 80}px, ${mousePosition.y / 80}px)` : 'translate(0, 0)',
          transition: 'transform 0.6s ease-out'
        }}
      >
        <div className={`floating-container ${isVisible ? 'visible' : ''}`}>
          <h1 className="text-9xl font-black mb-2 text-purple-300 glowing-text">404</h1>
          <h2 className="text-xl font-semibold mb-6 text-green-300">PAGE ABDUCTED</h2>
          
          <p className="text-xl mb-8 max-w-md mx-auto font-light">
            {funnyError}
          </p>

          {/* Fake search bar */}
          <form onSubmit={handleSearch} className="mb-8 relative max-w-md mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Try to find it..."
              className="w-full p-3 rounded-full bg-opacity-20 bg-white border-2 border-purple-400 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
            />
            <Button 
              type="submit"
              className="absolute right-1 top-1 rounded-full p-2 bg-purple-500 hover:bg-purple-600 hover:scale-110 transition-all"
            >
              <span className="pointer-events-none">🔍</span>
            </Button>
          </form>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/">
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg text-lg hover:scale-105 transition-all duration-300 hover:shadow-blue-500/25 pulse-animation"
              >
                Return to Earth
                {count > 2 && " 🛸"}
              </Button>
            </Link>
            
            <Link href="/sitemap">
              <Button 
                variant="outline"
                className="border-2 border-green-400 text-green-300 px-6 py-3 rounded-lg text-lg hover:bg-green-900 hover:bg-opacity-20 transition-all"
              >
                Explore Galaxy Map
              </Button>
            </Link>
          </div>

          {/* Tip that appears after a few seconds */}
          {showTip && (
            <div className="mt-6 text-purple-300 text-sm max-w-md mx-auto fade-in">
              <p>Tip: Move your mouse around to control the UFO!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for animations and effects */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 10px rgba(192, 132, 252, 0.7), 0 0 20px rgba(192, 132, 252, 0.5); }
          50% { text-shadow: 0 0 15px rgba(192, 132, 252, 0.9), 0 0 30px rgba(192, 132, 252, 0.7); }
        }
        
        @keyframes beam {
          0%, 100% { opacity: 0.1; width: 40px; }
          50% { opacity: 0.2; width: 60px; }
        }
        
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4); }
          50% { box-shadow: 0 0 0 15px rgba(147, 51, 234, 0); }
        }
        
        .floating-container {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1s ease, transform 1s ease;
        }
        
        .floating-container.visible {
          opacity: 1;
          transform: translateY(0);
          animation: float 6s ease-in-out infinite;
        }
        
        .twinkling-star {
          animation: twinkle 3s ease-in-out infinite;
          animation-delay: calc(var(--i, 0) * 0.5s);
        }
        
        .glowing-text {
          animation: glow 3s ease-in-out infinite;
        }
        
        .abduction-beam {
          background: linear-gradient(to bottom, rgba(132, 204, 22, 0.6), rgba(132, 204, 22, 0));
          animation: beam 4s ease-in-out infinite;
          border-radius: 50%;
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        .ufo {
          filter: drop-shadow(0 0 10px rgba(74, 222, 128, 0.5));
        }

        .fade-in {
          animation: fadeIn 1s forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}