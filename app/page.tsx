"use client";

import { useState } from 'react';
import path2json from '../data/qna.json'; // Import the JSON

// Define the types for the question and category
interface Question {
  points: number;
  question: string;
  answer: string;
}

interface Category {
  name: string;
  questions: Question[];
}

export default function Home() {
  // The type for selectedQuestion can be Question or null
  const [ selectedQuestion, setSelectedQuestion ] = useState<Question | null>(null);

  const handleClick = (question: Question) => {
    setSelectedQuestion(question);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">Jeopardy Game Board</h1>

      { selectedQuestion && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <p className="text-lg font-semibold text-black">{ selectedQuestion.question }</p>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={ () => setSelectedQuestion(null) }
            >
              Close
            </button>
          </div>
        </div>
      ) }

      <div className="grid grid-cols-5 gap-6 w-full max-w-5xl">
        { path2json.categories.map((category: Category, index: number) => (
          <div key={ index } className="p-4 bg-slate-800 rounded-lg flex flex-col">
            {/* Set a fixed height for the category headers */ }
            <h2 className="text-xl font-semibold mb-4 h-12 flex items-center justify-center text-center">
              { category.name }
            </h2>
            { category.questions.map((question: Question) => (
              <div
                key={ question.points }
                className="bg-blue-600 text-white text-center py-4 mb-2 rounded-lg cursor-pointer hover:bg-blue-800"
                onClick={ () => handleClick(question) }
              >
                <p>{ question.points }</p>
              </div>
            )) }
          </div>
        )) }
      </div>
    </div>
  );
}
