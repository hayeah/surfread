import React, { useEffect, useState, useRef } from 'react';

export const ReadingGuide = () => {
  const [position, setPosition] = useState(window.innerHeight / 2);
  const [isDragging, setIsDragging] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && guideRef.current) {
        const newPosition = e.clientY;
        setPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={guideRef}
      style={{
        position: 'fixed',
        left: 0,
        top: position - 25,
        width: '100%',
        height: '50px',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          width: '100%',
          height: '5px',
          backgroundColor: 'rgba(128, 128, 128, 0.05)',
        }}
      />
    </div>
  );
};
