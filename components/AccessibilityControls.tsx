'use client';

import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Contrast } from 'lucide-react';
import { useAccessibility } from '@/hooks/useAccessibility';

export function AccessibilityControls() {
  const { zoom, highContrast, updateZoom, toggleHighContrast } = useAccessibility();

  return (
    <div className="flex items-center gap-2">
      {/* Controle de zoom */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateZoom(Math.max(100, zoom - 10))}
          className="h-8 px-2"
          disabled={zoom <= 100}
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
        <span className="text-xs font-medium px-2 min-w-[3rem] text-center">
          {zoom}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateZoom(Math.min(150, zoom + 10))}
          className="h-8 px-2"
          disabled={zoom >= 150}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
      </div>

      {/* Toggle alto contraste */}
      <Button
        variant={highContrast ? 'default' : 'outline'}
        size="sm"
        onClick={toggleHighContrast}
        className="h-9 px-3"
        aria-label="Alto contraste"
      >
        <Contrast className="h-4 w-4 mr-1.5" />
        <span className="text-xs">Alto contraste</span>
      </Button>
    </div>
  );
}

