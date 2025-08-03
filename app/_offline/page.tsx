export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-6">📱</div>
        <h1 className="text-2xl font-bold text-[#6750a4] mb-4">
          You're Offline
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          TGATB Habit Tracker is available offline. Your habit data will sync when you're back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#6750a4] hover:bg-[#5a47a0] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
