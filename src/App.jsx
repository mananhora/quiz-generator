import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [bookContent, setBookContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState('');
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const generateQuiz = async () => {
    console.log("Generating quiz...");
    try {
      const response = await fetch('http://localhost:5000/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookContent }),
      });
      const data = await response.json();
      if (data.quiz) {
        console.log("Quiz generated successfully:", data.quiz);
        setQuestions(data.quiz);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setFeedback('');
        setIsQuizFinished(false);
        console.log("Quiz state reset for new quiz");
      } else {
        console.error("No quiz data in response");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
    }
  };

  const handleNextQuestion = () => {
    console.log("Attempting to move to next question");
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => {
        console.log("Moving to next question. New index:", prevIndex + 1);
        return prevIndex + 1;
      });
      setFeedback('');
    } else {
      console.log("Last question answered. Setting quiz to finished.");
      setIsQuizFinished(true);
    }
  };

  const handlePreviousQuestion = () => {
    console.log("Attempting to move to previous question");
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setFeedback('');
      console.log("Moved to previous question. New index:", currentQuestionIndex - 1);
    }
  };

  const handleOptionSelect = async (option) => {
    console.log("Option selected:", option);
    setUserAnswers(prevAnswers => {
      const newAnswers = {
        ...prevAnswers,
        [currentQuestionIndex]: option
      };
      console.log("Updated user answers:", newAnswers);
      return newAnswers;
    });

    try {
      const response = await fetch('http://localhost:5000/check-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionIndex: currentQuestionIndex,
          selectedOption: option,
          correctOption: questions[currentQuestionIndex].correct
        }),
      });
      const data = await response.json();
      console.log("Answer check response:", data);
      if (data.isCorrect) {
        setFeedback('Correct!');
        if (currentQuestionIndex === questions.length - 1) {
          console.log("Last question answered correctly. Finishing quiz.");
          setIsQuizFinished(true);
        }
      } else {
        setFeedback('Incorrect. Please try again.');
      }
    } catch (error) {
      console.error("Error checking answer:", error);
    }
  };

  const redoQuiz = () => {
    console.log("Redoing quiz");
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFeedback('');
    setIsQuizFinished(false);
    console.log("Quiz state reset for redo");
  };

  useEffect(() => {
    console.log("useEffect triggered");
    console.log("Current question index:", currentQuestionIndex);
    console.log("Is quiz finished?", isQuizFinished);
  }, [currentQuestionIndex, isQuizFinished]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz Generator</h1>
      <textarea
        className="w-full p-2 border border-gray-300 rounded mb-4"
        rows="10"
        placeholder="Enter book content here..."
        value={bookContent}
        onChange={(e) => setBookContent(e.target.value)}
      ></textarea>
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={generateQuiz}
      >
        Generate Quiz
      </button>
      {questions.length > 0 && !isQuizFinished && (
        <div className="mt-4 p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-bold mb-2">Generated Quiz</h2>
          <div className="mb-4">
            <p className="font-bold">Question {currentQuestionIndex + 1}:</p>
            <p>{questions[currentQuestionIndex].question}</p>
            <div className="mt-2">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={userAnswers[currentQuestionIndex] === option}
                    onChange={() => handleOptionSelect(option)}
                    className="mr-2"
                  />
                  <label htmlFor={`option-${index}`}>{option}</label>
                </div>
              ))}
            </div>
            {feedback && (
              <p className={`mt-2 font-bold ${feedback === 'Correct!' ? 'text-green-500' : 'text-red-500'}`}>
                {feedback}
              </p>
            )}
          </div>
          <div className="flex justify-between">
            <button
              className="bg-gray-500 text-white p-2 rounded"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous Question
            </button>
            <button
              className="bg-green-500 text-white p-2 rounded"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1 || feedback !== 'Correct!'}
            >
              Next Question
            </button>
          </div>
        </div>
      )}
      {isQuizFinished && (
        <div className="mt-4 p-4 border border-gray-300 rounded">
          <h2 className="text-2xl font-bold mb-4 text-green-500">FINISHED! Nice Job!</h2>
          <button
            className="bg-blue-500 text-white p-2 rounded"
            onClick={redoQuiz}
          >
            Redo the quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default App;