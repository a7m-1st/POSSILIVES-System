import React, { useEffect, useRef } from 'react';
import {animate} from 'animejs';
import './ScrollingBicycle.css';

const ScrollingBicycle = () => {
  const bicycleRef = useRef<HTMLDivElement>(null);
  const wheelFrontRef = useRef<SVGCircleElement>(null);
  const wheelBackRef = useRef<SVGCircleElement>(null);
  const pedalRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = (scrollY / maxScroll) * 100;
      
      // Calculate horizontal position based on scroll
      const horizontalPosition = (progress / 100) * window.innerWidth;
      
      if (bicycleRef.current) {
        // Move bicycle horizontally
        bicycleRef.current.style.transform = `translateX(${horizontalPosition}px)`;
        
        // Rotate wheels based on scroll
        const rotation = scrollY * 2;
        if (wheelFrontRef.current && wheelBackRef.current && pedalRef.current) {
          wheelFrontRef.current.style.transform = `rotate(${rotation}deg)`;
          wheelBackRef.current.style.transform = `rotate(${rotation}deg)`;
          pedalRef.current.style.transform = `rotate(${rotation}deg)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial animation
    animate({
      targets: bicycleRef.current,
      translateY: [-50, 0],
      opacity: [0, 1],
      duration: 1500,
      easing: 'easeOutElastic(1, .5)'
    }, {});

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bicycle-container" ref={bicycleRef}>
      <svg viewBox="0 0 100 50" width="100" height="50">
        {/* Frame */}
        <path d="M20,40 L40,20 L55,20 L70,40" stroke="#333" strokeWidth="2" fill="none" />
        <path d="M40,20 L35,40" stroke="#333" strokeWidth="2" fill="none" />
        
        {/* Wheels */}
        <circle ref={wheelBackRef} cx="20" cy="40" r="8" stroke="#333" strokeWidth="2" fill="none" />
        <circle ref={wheelFrontRef} cx="70" cy="40" r="8" stroke="#333" strokeWidth="2" fill="none" />
        
        {/* Spokes */}
        <line x1="20" y1="32" x2="20" y2="48" stroke="#333" strokeWidth="1" />
        <line x1="12" y1="40" x2="28" y2="40" stroke="#333" strokeWidth="1" />
        <line x1="14" y1="34" x2="26" y2="46" stroke="#333" strokeWidth="1" />
        <line x1="14" y1="46" x2="26" y2="34" stroke="#333" strokeWidth="1" />
        
        <line x1="70" y1="32" x2="70" y2="48" stroke="#333" strokeWidth="1" />
        <line x1="62" y1="40" x2="78" y2="40" stroke="#333" strokeWidth="1" />
        <line x1="64" y1="34" x2="76" y2="46" stroke="#333" strokeWidth="1" />
        <line x1="64" y1="46" x2="76" y2="34" stroke="#333" strokeWidth="1" />
        
        {/* Handlebar & Seat */}
        <path d="M55,20 L58,15" stroke="#333" strokeWidth="2" fill="none" />
        <line x1="38" y1="20" x2="36" y2="17" stroke="#333" strokeWidth="2" />
        
        {/* Pedal */}
        <circle ref={pedalRef} cx="35" cy="40" r="4" stroke="#333" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
};

export default ScrollingBicycle;