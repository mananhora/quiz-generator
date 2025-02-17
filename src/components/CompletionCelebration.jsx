import React from 'react';

function CompletionCelebration({ onReviewAgain, onBackToLibrary }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-lg shadow-lg transform transition-all duration-500 animate-fade-in">
      <div className="text-center">
        <h2 className="font-playfair text-3xl text-primary mb-4">Well Done!</h2>
        <div className="text-4xl mb-6">📚 🎉</div>
        <p className="font-source text-textColor/80 mb-8">
          You've completed this review session
        </p>
        <div className="flex gap-4">
          <button
            onClick={onReviewAgain}
            className="bg-primary text-white px-6 py-3 rounded hover:bg-primary/90 transition-colors font-inter"
          >
            Review Again
          </button>
          <button
            onClick={onBackToLibrary}
            className="border border-primary/20 text-primary px-6 py-3 rounded hover:bg-primary/5 transition-colors font-inter"
          >
            Back to Library
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletionCelebration; 