'use client';

import { useStatusBar } from '@/hooks/use-status-bar';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

/**
 * Example component demonstrating how to use the enhanced status bar functionality
 * This shows how to dynamically control status bar appearance
 */
export const StatusBarExample = () => {
  const { 
    visible, 
    height, 
    isNative, 
    setVisible,
    setBackgroundColor,
    setLightStyle,
    setDarkStyle,
    setDefaultStyle
  } = useStatusBar();
  
  const { theme } = useTheme();

  // Automatically adjust status bar based on theme
  useEffect(() => {
    if (!isNative) return;
    
    if (theme === 'dark') {
      setBackgroundColor('#0f172a'); // Dark background
      setLightStyle(); // Light text on dark background
    } else {
      setBackgroundColor('#FFFFFF'); // Light background
      setDarkStyle(); // Dark text on light background
    }
  }, [theme, isNative, setBackgroundColor, setLightStyle, setDarkStyle]);

  if (!isNative) {
    return null; // Only show on native platforms
  }

  return (
    <div className="p-4 space-y-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Status Bar Controls</h3>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Status Bar: {visible ? 'Visible' : 'Hidden'} | Height: {height}px
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setVisible(!visible)}
          >
            {visible ? 'Hide' : 'Show'} Status Bar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={setLightStyle}
          >
            Light Style
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={setDarkStyle}
          >
            Dark Style
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={setDefaultStyle}
          >
            Default Style
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setBackgroundColor('#FF0000')}
          >
            Red Background
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setBackgroundColor('#00FF00')}
          >
            Green Background
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setBackgroundColor('#0000FF')}
          >
            Blue Background
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setBackgroundColor('#FFFFFF')}
          >
            Reset to White
          </Button>
        </div>
      </div>
    </div>
  );
};
