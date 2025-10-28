"use client";
import React, { useEffect, useRef, useState } from "react";

interface GridBox {
  id: number;
  isActive: boolean;
  animationDelay: number;
}

export function BackgroundRippleEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 });
  const [boxes, setBoxes] = useState<GridBox[]>([]);

  useEffect(() => {
    const updateGridSize = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const boxSize = 40; // Size of each grid box
      const cols = Math.floor(rect.width / boxSize);
      const rows = Math.floor(rect.height / boxSize);
      
      setGridSize({ rows, cols });
      
      // Create grid boxes
      const newBoxes: GridBox[] = [];
      for (let i = 0; i < rows * cols; i++) {
        newBoxes.push({
          id: i,
          isActive: false,
          animationDelay: Math.random() * 2,
        });
      }
      setBoxes(newBoxes);
    };

    updateGridSize();
    window.addEventListener('resize', updateGridSize);

    return () => {
      window.removeEventListener('resize', updateGridSize);
    };
  }, []);

  const handleBoxClick = (boxId: number) => {
    setBoxes(prev => prev.map(box => 
      box.id === boxId 
        ? { ...box, isActive: true }
        : box
    ));

    // Reset after animation
    setTimeout(() => {
      setBoxes(prev => prev.map(box => 
        box.id === boxId 
          ? { ...box, isActive: false }
          : box
      ));
    }, 1000);
  };

  const handleMouseEnter = (boxId: number) => {
    setBoxes(prev => prev.map(box => 
      box.id === boxId 
        ? { ...box, isActive: true }
        : box
    ));
  };

  const handleMouseLeave = (boxId: number) => {
    setBoxes(prev => prev.map(box => 
      box.id === boxId 
        ? { ...box, isActive: false }
        : box
    ));
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-white"
      style={{ zIndex: 1 }}
    >
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Interactive Grid Boxes */}
      <div className="absolute inset-0 grid" style={{
        gridTemplateColumns: `repeat(${gridSize.cols}, 40px)`,
        gridTemplateRows: `repeat(${gridSize.rows}, 40px)`,
        gap: '0px'
      }}>
        {boxes.map((box) => (
          <div
            key={box.id}
            className="cursor-pointer transition-all duration-300 hover:bg-orange-500/2 border border-black/5"
            onMouseEnter={() => handleMouseEnter(box.id)}
            onMouseLeave={() => handleMouseLeave(box.id)}
            onClick={() => handleBoxClick(box.id)}
            style={{
              animationDelay: `${box.animationDelay}s`
            }}
          >
            {box.isActive && (
              <div
                className="w-full h-full bg-orange-500/5 animate-cell-ripple border border-black/8"
                style={{
                  animationDuration: '1s',
                  animationTimingFunction: 'ease-out'
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}