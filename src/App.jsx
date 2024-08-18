import React, { useState } from 'react';
import './index.css';

function App() {
  const [bookContent, setBookContent] = useState('');
  const [quiz, setQuiz] = useState('');

  const generateQuiz = async () => {
    console.log("hello - one");

    const response = await fetch('http://localhost:5000/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookContent }),
    });
    console.log("hello - two ");
    const data = await response.json();
    console.log("hello- three");

    setQuiz(data.quiz);
  };

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
      {quiz && (
        <div className="mt-4 p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-bold mb-2">Generated Quiz</h2>
          <p>{quiz.replace(/\n/g, '<br />')}</p>
        </div>
      )}
    </div>
  );
}

export default App;
