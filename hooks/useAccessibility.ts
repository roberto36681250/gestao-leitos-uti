'use client';

import { useState, useEffect } from 'react';

const ZOOM_KEY = 'gestao-leitos-zoom';
const CONTRAST_KEY = 'gestao-leitos-contrast';

export function useAccessibility() {
  const [zoom, setZoom] = useState<number>(100);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    // Carregar do localStorage
    const savedZoom = localStorage.getItem(ZOOM_KEY);
    const savedContrast = localStorage.getItem(CONTRAST_KEY);

    if (savedZoom) {
      setZoom(Number(savedZoom));
    }
    if (savedContrast === 'true') {
      setHighContrast(true);
    }
  }, []);

  useEffect(() => {
    // Aplicar zoom no documento
    document.documentElement.style.fontSize = `${zoom}%`;
  }, [zoom]);

  useEffect(() => {
    // Aplicar paleta daltônica
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const updateZoom = (newZoom: number) => {
    setZoom(newZoom);
    localStorage.setItem(ZOOM_KEY, newZoom.toString());
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem(CONTRAST_KEY, newValue.toString());
  };

  return {
    zoom,
    highContrast,
    updateZoom,
    toggleHighContrast,
  };
}

