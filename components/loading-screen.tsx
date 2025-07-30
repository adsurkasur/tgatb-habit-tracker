"use client";

import { useTheme } from "./theme-provider";

export function LoadingScreen() {
  const { isLoading, isDark } = useTheme();

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-500 ease-out ${
      isLoading 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-[-10px] pointer-events-none'
    } ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`flex flex-col items-center space-y-6 transition-all duration-700 ease-out ${
        isLoading ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Logo/Icon with pulse animation */}
        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
          isDark 
            ? 'bg-purple-600/20 border border-purple-500/30' 
            : 'bg-purple-100 border border-purple-200'
        } transition-all duration-300`}>
          <div className={`w-8 h-8 rounded-lg transition-all duration-300 ${
            isDark ? 'bg-purple-500' : 'bg-purple-600'
          }`} />
          
          {/* Pulse ring */}
          <div className={`absolute inset-0 rounded-full animate-ping ${
            isDark ? 'bg-purple-500/20' : 'bg-purple-600/20'
          }`} />
        </div>
        
        {/* App Title with slide-up animation */}
        <div className={`text-center transition-all duration-500 delay-100 ${
          isLoading ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}>
          <h1 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            TGATB
          </h1>
          <p className={`text-sm transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Habit Tracker
          </p>
        </div>
        
        {/* Loading Animation with smooth spin */}
        <div className={`relative transition-all duration-500 delay-200 ${
          isLoading ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}>
          <div className={`w-8 h-8 rounded-full border-2 transition-colors duration-300 ${
            isDark 
              ? 'border-purple-900 border-t-purple-500' 
              : 'border-purple-200 border-t-purple-600'
          } animate-spin`} style={{ animationDuration: '1s' }} />
        </div>
        
        {/* Loading Text with fade animation */}
        <p className={`text-xs transition-all duration-500 delay-300 ${
          isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        } ${isDark ? 'text-gray-500' : 'text-gray-500'} animate-pulse`}>
          Loading your habits...
        </p>
      </div>
      
      {/* Background gradient with smooth transition */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        isDark 
          ? 'bg-gradient-to-br from-purple-900/5 via-transparent to-purple-800/5' 
          : 'bg-gradient-to-br from-purple-100/50 via-transparent to-purple-50/50'
      }`} />
      
      {/* Subtle pattern overlay */}
      <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${
        isDark ? 'bg-purple-500' : 'bg-purple-100'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current to-transparent" />
      </div>
    </div>
  );
}
