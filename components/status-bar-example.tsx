'use client';

import { useStatusBar } from '@/hooks/use-status-bar';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Example component demonstrating how to use the enhanced status bar functionality
 * This shows how to dynamically control status bar appearance
 */
export const StatusBarExample = () => {
  const t = useTranslations('StatusBarExample');
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
      <h3 className="text-lg font-semibold">{t('title')}</h3>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {t('status', { visibility: visible ? t('visible') : t('hidden'), height })}
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setVisible(!visible)}
          >
            {visible ? t('actions.hide') : t('actions.show')} {t('label')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={setLightStyle}
          >
            {t('actions.lightStyle')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={setDarkStyle}
          >
            {t('actions.darkStyle')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={setDefaultStyle}
          >
            {t('actions.defaultStyle')}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setBackgroundColor('#FF0000')}
          >
            {t('actions.redBackground')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setBackgroundColor('#00FF00')}
          >
            {t('actions.greenBackground')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setBackgroundColor('#0000FF')}
          >
            {t('actions.blueBackground')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setBackgroundColor('#FFFFFF')}
          >
            {t('actions.resetToWhite')}
          </Button>
        </div>
      </div>
    </div>
  );
};
