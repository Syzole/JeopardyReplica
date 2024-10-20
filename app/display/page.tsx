// app/display/page.tsx

"use client"; // Ensure this component is a client component
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Adjust to your server's URL

export default function DisplayPage() {
    const [ currentQuestion, setCurrentQuestion ] = useState<{ question: string; answer: string } | null>(null);

    useEffect(() => {
        // Listen for the "question" event from the server
        socket.on('currentQuestion', (question: { question: string; answer: string }) => {
            setCurrentQuestion(question);
        });

        return () => {
            socket.off('currentQuestion'); // Clean up the event listener
            console.log('Unmounting DisplayPage');
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-8 text-blue-600">Current Question</h1>

            { currentQuestion ? (
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md">
                    <p className="text-lg font-semibold">{ currentQuestion.question }</p>
                    <p className="mt-2 text-md">{ currentQuestion.answer }</p>
                </div>
            ) : (
                <p className="text-lg">Waiting for a question...</p>
            ) }
        </div>
    );
}
