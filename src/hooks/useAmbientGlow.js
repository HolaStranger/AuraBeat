import { useEffect } from 'react';

export const useAmbientGlow = (imageUrl) => {
  useEffect(() => {
    if (!imageUrl) {
      document.documentElement.style.setProperty('--ambient-rgb', '139, 92, 246'); // Default purple
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 10;
      canvas.height = 10;
      ctx.drawImage(img, 0, 0, 10, 10);

      const data = ctx.getImageData(0, 0, 10, 10).data;
      let r = 0, g = 0, b = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      const count = data.length / 4;
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      // Increase saturation/brightness slightly for better glow
      const factor = 1.2;
      r = Math.min(255, Math.floor(r * factor));
      g = Math.min(255, Math.floor(g * factor));
      b = Math.min(255, Math.floor(b * factor));

      document.documentElement.style.setProperty('--ambient-rgb', `${r}, ${g}, ${b}`);
    };
  }, [imageUrl]);
};
