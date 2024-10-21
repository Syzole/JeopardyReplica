"use client";
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import questionsData from '@/data/qna.json'; // Import the JSON data for questions
import { Question } from '../control/page';

const socket = io('http://10.0.0.194:3000'); // Adjust to your server's URL

// Define the team structure
interface Team {
    name: string;
    points: number;
}

export default function DisplayPage() {
    const [ currentQuestion, setCurrentQuestion ] = useState<{ question: string; answer: string; points: number } | null>(null);
    const [ revealedAnswer, setRevealedAnswer ] = useState<string | null>(null);
    const [ selectedQuestions, setSelectedQuestions ] = useState<Record<string, boolean>>({});
    const [ teams, setTeams ] = useState<Team[]>([]);

    useEffect(() => {
        // Fetch teams from the server on mount
        const loadTeams = async () => {
            const response = await fetch('/api/teams');
            const data = await response.json();
            data.sort((a: Team, b: Team) => b.points - a.points); // Sort teams by points
            setTeams(data);
        };
        loadTeams();

        // Listen for the "currentQuestion" event
        socket.on('currentQuestion', (question: Question | null) => {
            setCurrentQuestion(question);
            setRevealedAnswer(null);
        });

        // Listen for the "revealAnswer" event
        socket.on('revealAnswer', (answer: string, selectedQuestions: Record<string, boolean>) => {
            setRevealedAnswer(answer);
            setSelectedQuestions(selectedQuestions);
        });

        socket.on('selectedQuestions', (selected: Record<string, boolean>) => {
            setSelectedQuestions(selected);
        });

        socket.on('resetGame', () => {
            setCurrentQuestion(null);
            setRevealedAnswer(null);
        });

        socket.on("teams", () => {
            console.log("Refreshing teams...");
            loadTeams();
        });

        socket.emit('refreshSelectedQuestions');

        return () => {
            socket.off('currentQuestion');
            socket.off('revealAnswer');
            socket.off('resetGame');
            socket.off('selectedQuestions');
            socket.off('teams');
        };
    }, []);

    const isQuestionSelected = (currentQuestion: Question) => {
        return selectedQuestions[ `${currentQuestion.question}-${currentQuestion.points}` ];
    };

    const findQuestionCategory = (question: Question) => {

        return questionsData.categories.find((category) =>
            category.questions.some((q) => q.question === question.question)
        )?.name || 'Unknown Category';
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-8xl font-bold mb-10 text-blue-600">Jeopardy</h1>

            { currentQuestion ? (
                <div className="bg-gray-800 p-20 rounded-lg shadow-lg w-full max-w-4xl mb-12 items-center flex flex-col">
                    <p className="text-6xl text-sky-400 mb-20">{ `${findQuestionCategory(currentQuestion)}` }</p>
                    <p className="text-6xl font-semibold">{ currentQuestion.question }</p>
                    <p className="mt-8 text-6xl">Points: { currentQuestion.points }</p>
                    { revealedAnswer && (
                        <p className="mt-8 text-6xl text-green-400">Answer: { revealedAnswer }</p>
                    ) }
                </div>
            ) : (
                // Main content container for the board and teams
                <div className="flex flex-wrap w-full h-full p-4 bg-gray-900">
                    {/* Question Board */ }
                    <div className="flex-grow flex flex-wrap justify-center items-start p-3 bg-gray-900 overflow-hidden">
                        { questionsData.categories.map((category, index) => (
                            <div
                                key={ index }
                                className="flex flex-col items-center bg-slate-800 rounded-lg shadow-lg m-4"
                                style={ { width: '240px', maxHeight: '80vh' } } // Shrinking the size slightly
                            >
                                <h3 className="text-4xl font-semibold mb-4 text-center text-blue-400 overflow-hidden text-ellipsis whitespace-nowrap" style={ { maxWidth: '100%' } }>
                                    { category.name }
                                </h3>
                                <div className="flex flex-col w-full">
                                    { category.questions.map((question) => (
                                        <button
                                            key={ question.points }
                                            className={ `w-full px-4 py-4 mb-4 rounded-lg transition duration-300 ease-in-out ${isQuestionSelected(question)
                                                ? 'bg-gray-500 cursor-not-allowed text-xl'
                                                : 'bg-blue-600 text-white text-xl hover:bg-blue-700'}` }
                                            disabled={ isQuestionSelected(question) }
                                        >
                                            { question.points }
                                        </button>
                                    )) }
                                </div>
                            </div>
                        )) }
                    </div>

                    {/* Teams Section */ }
                    <div className="flex-shrink-0 w-full max-w-sm bg-slate-800 p-6 rounded-lg shadow-lg mt-4">
                        <h2 className="text-4xl font-bold text-center mb-6 text-blue-400">Team Points</h2>
                        <div className="flex flex-col gap-4">
                            { teams.length > 0 ? (
                                teams.map((team, index) => (
                                    <div key={ index } className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                        <span className="text-xl font-semibold">{ team.name }</span>
                                        <span className="text-xl font-bold text-green-400">{ team.points } pts</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No teams available</p>
                            ) }
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
}
