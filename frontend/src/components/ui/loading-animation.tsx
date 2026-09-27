import React, { useEffect, useRef } from 'react';

const RadialPulseLoader = ({ 
  size = 140, 
  color = '#B98958',
  text = 'Loading...',
  subtext = '',
  showText = true 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Support High-DPI displays for ultra-sharp canvas rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    
    const centerX = size / 2;
    const centerY = size / 2;
    let time = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      
      const numRays = 8;
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2;
        const sinVal = Math.sin(time * 0.04 + i * 0.5);
        const pulse = (sinVal * 0.5 + 0.5) * (size * 0.18) + (size * 0.24);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const x = centerX + Math.cos(angle) * pulse;
        const y = centerY + Math.sin(angle) * pulse;
        ctx.lineTo(x, y);
        
        // Clamp opacity safely between 0.18 and 1.0
        const opacity = Math.max(0.18, Math.min(1, 0.25 + (sinVal * 0.5 + 0.5) * 0.75));
        const alphaHex = Math.floor(opacity * 255).toString(16).padStart(2, '0');
        ctx.strokeStyle = `${color}${alphaHex}`;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        
        // Ray tip node
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${alphaHex}`;
        ctx.fill();
      }
      
      // Center pulsing core node
      const centerPulse = 3.5 + (Math.sin(time * 0.06) * 0.5 + 0.5) * 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerPulse, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      time++;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, color]);

  return (
    <div className="radial-pulse-loader" role="status" aria-live="polite">
      <canvas ref={canvasRef}></canvas>
      {showText && (
        <div className="loader-text-group">
          <div className="loader-text">{text}</div>
          {subtext && <div className="loader-subtext">{subtext}</div>}
        </div>
      )}
    </div>
  );
};

export default RadialPulseLoader;

