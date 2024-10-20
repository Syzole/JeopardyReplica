// app/control/page.tsx (or wherever your control page is)

"use client";

import { useState } from 'react';
import questionsData from '@/data/qna.json'; // Import the JSON
import io from 'socket.io-client';
import { Button } from '@nextui-org/react';

const socket = io('http://localhost:3000'); // Adjust to your server's URL

interface Question {
    points: number;
    question: string;
    answer: string;
}

interface Category {
    name: string;
    questions: Question[];
}

export default function ControlPage() {
    const [ selectedQuestion, setSelectedQuestion ] = useState<Question | null>(null);

    const handleClick = (question: Question | null) => {
        setSelectedQuestion(question);
        // Emit the selected question to the display page
        socket.emit('newQuestion', question);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-8 text-blue-600">Jeopardy Game Control</h1>

            { selectedQuestion && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-10">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                        <p className="text-lg font-semibold text-black">{ selectedQuestion.question }</p>
                        <button
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                            onClick={ () => handleClick(null) }
                        >
                            Close
                        </button>
                    </div>
                </div>
            ) }

            <div className="grid grid-cols-5 gap-6 w-full max-w-5xl">
                { questionsData.categories.map((category: Category, index: number) => (
                    <div key={ index } className="p-4 bg-slate-800 rounded-lg flex flex-col">
                        <h2 className="text-xl font-semibold mb-4 h-12 flex items-center justify-center text-center">
                            { category.name }
                        </h2>
                        { category.questions.map((question: Question) => (
                            <Button
                                key={ question.points }
                                color="primary"
                                className='mb-2'
                                onClick={ () => handleClick(question) }
                            >{ question.points }</Button>
                        )) }
                    </div>
                )) }
            </div>
        </div>
    );
}


