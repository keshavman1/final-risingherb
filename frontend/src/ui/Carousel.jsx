import React, { useEffect, useState } from 'react';

export default function Carousel({ images = [], interval = 3000, overlayText = '' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  return (
    <div style={{
      position: 'relative',
      height: '480px',
      overflow: 'hidden',
      borderRadius: '16px',
      background: 'linear-gradient(to bottom, #fff, #f5f5f5)'
    }}>
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Slide ${i + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: i === index ? 1 : 0,
            transition: 'opacity 1s ease-in-out'
          }}
        />
      ))}

      {overlayText && (
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '15px 25px',
          borderRadius: '10px',
          fontSize: '1.8rem',
          fontWeight: '700',
          fontFamily: 'Georgia, serif'
        }}>
          {overlayText}
        </div>
      )}
    </div>
  );
}
