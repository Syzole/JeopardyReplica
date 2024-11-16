"use client";

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import questionsData from '@/data/qna.json'; // Import the JSON data for questions
import { Question } from '../control/page';
import ListOfFortune from '../components/wheelOfLuck';
import { hostingIP } from '@/constants';

const socket = io(hostingIP); // Adjust to your server's URL

// Define the team structure
interface Team {
    name: string;
    points: number;
    buzzOrder: number | null; // Track the buzz order
}

export default function DisplayPage() {
    const [ currentQuestion, setCurrentQuestion ] = useState<{ question: string; answer: string; points: number } | null>(null);
    const [ revealedAnswer, setRevealedAnswer ] = useState<string | null>(null);
    const [ selectedQuestions, setSelectedQuestions ] = useState<Record<string, boolean>>({});
    const [ teams, setTeams ] = useState<Team[]>([]);
    const [ buzzOrder, setBuzzOrder ] = useState<string[]>([]); // New state for buzz order
    const [ wheelType, setWheelType ] = useState<'good' | 'bad' | null>(null);
    const [ showQuestionText, setShowQuestionText ] = useState(false);

    const currentQuestionRef = useRef(currentQuestion); // Ref to track the current question

    useEffect(() => {
        currentQuestionRef.current = currentQuestion; // Always keep the ref updated with the latest value
    }, [ currentQuestion ]);

    useEffect(() => {
        const buzzerSound = new Audio('/buzzer.mp3'); // Load the buzzer sound
        buzzerSound.volume = 0.5; // Set the volume to 50%

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

        socket.on("revalQuestion", () => {
            setShowQuestionText(true);
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
            setBuzzOrder([]); // Reset buzz order
            setShowQuestionText(false);
        });

        // Handle buzz event
        socket.on('buzz', (buzzedTeams: string[], shouldBuzz: boolean = true) => {
            // Only play the sound if there is a current question
            if (shouldBuzz && currentQuestionRef.current) {
                buzzerSound.play().catch((error) => {
                    console.error('Error playing buzzer sound:', error);
                }); // Play the buzzer sound
            } else {
                console.warn('Buzz received but no current question is set. Ignoring...');
            }
            setBuzzOrder(buzzedTeams); // Update the buzz order
        });


        socket.on("resetBuzzer", () => {
            setBuzzOrder([]); // Clear the buzz order
        });

        socket.on("teams", () => {
            loadTeams();
        });

        socket.on('wheel', (type: 'good' | 'bad' | null) => {
            setWheelType(type);
        });


        socket.emit('refreshSelectedQuestions');

        return () => {
            socket.off('currentQuestion');
            socket.off('revealAnswer');
            socket.off('resetGame');
            socket.off('selectedQuestions');
            socket.off('buzz');
            socket.off('teams');
            socket.off('wheel');
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
        <div className="h-screen w-screen flex flex-col items-center bg-gray-900 text-white">
            {/* <h1 className="text-8xl font-bold mb-10 text-blue-600">Jeopardy</h1> */ }

            { currentQuestion ? (
                <div className='flex flex-row gap-x-8 justify-center items-center h-full'>
                    <div className="bg-gray-800 p-20 rounded-lg shadow-lg w-full max-w-4xl mb-12 items-center flex flex-col">
                        <p className="text-6xl text-sky-400 mb-20">{ `${findQuestionCategory(currentQuestion)}` }</p>
                        <p className={ `text-6xl font-semibold ${showQuestionText ? '' : 'blur-lg'}` }>
                            { currentQuestion.question }
                        </p>
                        <p className="mt-8 text-6xl">Points: { currentQuestion.points }</p>
                        { revealedAnswer && (
                            <p className="mt-8 text-6xl text-green-400 text-center">Answer: { revealedAnswer }</p>
                        ) }
                    </div>
                    {/* Teams Section with Buzz Order */ }
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
                    {/* Buzz Order Section */ }
                    { buzzOrder.length > 0 && (
                        <div className="mt-8 ">
                            <h2 className="text-6xl font-bold text-center mb-4 text-yellow-400">Buzz Order</h2>
                            <ul className="flex flex-col gap-2">
                                { buzzOrder.map((team, index) => (
                                    <li
                                        key={ index }
                                        className="flex justify-between items-center bg-gray-600 p-3 rounded-lg"
                                    >
                                        <span className="text-6xl font-semibold mr-2">{ team }</span>
                                        <span className="text-6xl font-bold text-yellow-400">Buzzed #{ index + 1 }</span>
                                    </li>
                                )) }
                            </ul>
                        </div>
                    ) }
                </div>
            ) : (
                // Main content container for the board and teams
                <div className="flex w-full h-full p-4 bg-gray-900 items-center">
                    {/* Question Board */ }
                    <div className="flex-grow flex justify-center items-start p-3 bg-gray-900 overflow-hidden">
                        { questionsData.categories.map((category, index) => (
                            <div
                                key={ index }
                                className="flex flex-col items-center bg-slate-800 rounded-lg shadow-lg m-4"
                                style={ { width: '240px', maxHeight: '80vh' } } // Shrinking the size slightly
                            >
                                <h3 className="text-4xl font-semibold mb-4 text-center text-blue-400 overflow-hidden text-ellipsis whitespace-nowrap" style={ { maxWidth: '100%' } }>{ category.name }</h3>
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

                    {/* Teams Section with Buzz Order */ }
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
            { wheelType && (
                <div className="mt-8 z-50 fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-gray-800 p-10 rounded-lg shadow-lg">
                        <h2 className="text-6xl font-bold text-center mb-4 text-yellow-400">Wheel of Fortune</h2>
                        <ListOfFortune type={ wheelType } />
                    </div>
                </div>
            ) }
        </div>
    );
}
