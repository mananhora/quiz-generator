import React, { useState, useCallback } from 'react';
import './index.css';
import debounce from 'lodash/debounce';
import CompletionCelebration from './components/CompletionCelebration';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function App() {
  const [bookContent, setBookContent] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [reviewStack, setReviewStack] = useState([]);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState({});
  const [totalCardsStudied, setTotalCardsStudied] = useState(0);
  const [initialCardCount, setInitialCardCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const generateFlashcards = async (retries = 3) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/generate-flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookContent }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.flashcards) {
        setFlashcards(data.flashcards);
        setInitialCardCount(data.flashcards.length);
        setCurrentCardIndex(0);
        setIsCardFlipped(false);
        setReviewStack([]);
        setIsFlashcardMode(true);
        setTotalCardsStudied(0);
      }
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await generateFlashcards(retries - 1);
      } else {
        alert('Unable to generate flashcards. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedGenerate = useCallback(
    debounce(async () => {
      if (!bookContent.trim()) return;
      await generateFlashcards();
    }, 500),
    [bookContent]
  );

  const handleCardFlip = () => {
    setIsCardFlipped(!isCardFlipped);
  };

  const handleGotIt = () => {
    setTotalCardsStudied(prev => prev + 1);
    if (reviewStack.includes(flashcards[currentCardIndex])) {
      setReviewStack(stack => stack.filter(card => card !== flashcards[currentCardIndex]));
    }
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsCardFlipped(false);
    } else {
      setShowCelebration(true);
    }
  };

  const handleNeedsReview = () => {
    if (!reviewStack.includes(flashcards[currentCardIndex])) {
      setReviewStack([...reviewStack, flashcards[currentCardIndex]]);
    }
    setFlashcards(cards => [...cards, cards[currentCardIndex]]);
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsCardFlipped(false);
    }
  };

  const handleReviewAgain = () => {
    setShowCelebration(false);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setTotalCardsStudied(0);
  };

  const handleBackToLibrary = () => {
    setShowCelebration(false);
    setIsFlashcardMode(false);
    setBookContent('');
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setTotalCardsStudied(0);
  };

  return (
    <div className="container mx-auto p-4 bg-background min-h-screen text-textColor font-inter">
      <h1 className="text-4xl font-playfair text-center mb-8 text-primary">MemoRead</h1>
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-3xl px-4">
          <input
            type="text"
            className="w-full p-3 border border-primary/20 rounded bg-white/80 font-source text-lg min-w-[500px]"
            placeholder="Enter the name of the book you want to revise..."
            value={bookContent}
            onChange={(e) => setBookContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                debouncedGenerate();
              }
            }}
          />
          <button
            className={`${
              isLoading ? 'bg-primary/50' : 'bg-primary'
            } text-white p-3 rounded flex items-center justify-center mt-2 w-full text-lg`}
            onClick={debouncedGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Help me recall'
            )}
          </button>
        </div>
      </div>

      {isFlashcardMode && flashcards.length > 0 && (
        <div className="mt-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-progress transition-all duration-300"
                style={{ width: `${(totalCardsStudied / initialCardCount) * 100}%` }}
              />
            </div>
            <span className="text-sm text-textColor/70 font-medium">
              {flashcards.length - currentCardIndex} remaining
            </span>
          </div>
          <div className="relative">
            <div 
              className={`flashcard-container cursor-pointer ${isCardFlipped ? 'flipped' : ''}`}
              onClick={handleCardFlip}
            >
              <div className="flashcard">
                <div className="flashcard-front p-6 rounded-lg shadow-lg bg-white">
                  <p className="text-xl font-source">{flashcards[currentCardIndex].question}</p>
                </div>
                <div className="flashcard-back p-6 rounded-lg shadow-lg bg-white">
                  <p className="text-xl font-source">{flashcards[currentCardIndex].answer}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <div className="flex gap-2">
                <button
                  className="bg-success text-white px-4 py-2 rounded hover:bg-success/90 transition-colors"
                  onClick={handleGotIt}
                >
                  Got It
                </button>
                <button
                  className="bg-review text-white px-4 py-2 rounded hover:bg-review/90 transition-colors"
                  onClick={handleNeedsReview}
                >
                  Needs Review
                </button>
              </div>
            </div>
          </div>
          {showCelebration && (
            <CompletionCelebration
              onReviewAgain={handleReviewAgain}
              onBackToLibrary={handleBackToLibrary}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;