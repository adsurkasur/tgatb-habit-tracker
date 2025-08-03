"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Toast-style notification at bottom */}
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex items-center space-x-3 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              You're offline
            </p>
            <p className="text-xs text-gray-500">
              App works offline. Data syncs when reconnected.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex-shrink-0 bg-[#6750a4] hover:bg-[#5a47a0] text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
      
      {/* Fallback content for when the main app fails to load */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-2xl font-bold text-[#6750a4] mb-4">
            TGATB Habit Tracker
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Loading your habits...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6750a4] mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
