"use client";

import { useState, useEffect } from 'react';
import { Button, Input } from '@nextui-org/react';
import questionsData from '@/data/qna.json'; // Import the JSON data
import io from 'socket.io-client';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { controlPassword, hostingIP } from '@/constants';

const socket = io(hostingIP); // Adjust to your server's URL

// Define the team structure
interface Team {
    name: string;
    points: number;
}

// Define the question structure
export interface Question {
    points: number;
    question: string;
    answer: string;
}

export default function ControlPage() {
    const [ teams, setTeams ] = useState<Team[]>([]);
    const [ teamPointsInput, setTeamPointsInput ] = useState<Record<number, string>>({}); // Input for team points
    const [ selectedQuestion, setSelectedQuestion ] = useState<Question | null>(null);
    const [ selectedQuestions, setSelectedQuestions ] = useState<Record<string, boolean>>({});
    const [ passphrase, setPassphrase ] = useState<string>(''); // State for storing the passphrase input
    const [ isAuthenticated, setIsAuthenticated ] = useState<boolean>(false); // Whether the user is authenticated
    const correctPassphrase = controlPassword || 'password'; // Correct passphrase
    const [ buzzOrder, setBuzzOrder ] = useState<string[]>([]);
    const [ showPlayers, setShowPlayers ] = useState<boolean>(true); // Whether to show the players or only display on control page

    // Load teams from the server on mount
    useEffect(() => {
        const loadTeams = async () => {
            const response = await fetch('/api/teams');
            const data = await response.json();
            data.sort((a: Team, b: Team) => a.name.localeCompare(b.name)); // Sort teams by name
            setTeams(data);
        };
        loadTeams();

        //check if passphrase is stored in local storage
        const storedPassphrase = Cookies.get('passphrase');
        if (storedPassphrase === correctPassphrase) {
            setIsAuthenticated(true);
        }

        // Listen for the 'selectedQuestions' event from the server
        socket.on('selectedQuestions', (data: Record<string, boolean>) => {
            setSelectedQuestions(data); // Update state with the received data
        });

        socket.on("teams", () => {
            loadTeams();
        });

        socket.on('buzz', (newBuzzOrder: string[]) => {
            setBuzzOrder(newBuzzOrder);
        });

        refreshSelectedQuestions(); // Fetch selected questions when the component mounts

        // Clean up the event listener on unmount
        return () => {
            socket.off('selectedQuestions');
            socket.off('teams');
        };
    }, [ correctPassphrase ]);

    // Function to handle passphrase submission
    const handlePassphraseSubmit = () => {
        if (passphrase === correctPassphrase) {
            setIsAuthenticated(true); // Allow access if passphrase is correct
            Cookies.set('passphrase', passphrase, { expires: 1, secure: false, sameSite: 'Strict' }); // Store passphrase in cookie
        } else {
            alert("Incorrect passphrase, please try again.");
        }
    };

    // Function to handle input change for passphrase
    const handlePassphraseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassphrase(e.target.value);
    };

    // Function to add points to a team manually
    const updatePoints = async (teamIndex: number) => {
        const points = parseInt(teamPointsInput[ teamIndex ], 10);

        if (isNaN(points)) return; // Do nothing if input is not a number

        const updatedTeam = { ...teams[ teamIndex ], points: points };

        socket.emit('addPoints', updatedTeam.name, points); // Emit event to add points to the team

        const response = await fetch('/api/teams', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTeam),
        });

        if (response.ok) {
            const updatedTeams = await response.json(); // Fetch updated teams from server
            setTeams(updatedTeams);
            setTeamPointsInput((prev) => ({ ...prev, [ teamIndex ]: '' })); // Reset input after submission
        }
    };

    // Handle points input change
    const handlePointsInputChange = (teamIndex: number, value: string) => {
        setTeamPointsInput((prev) => ({ ...prev, [ teamIndex ]: value }));
    };

    // Function to set a new question
    const handleSelectQuestion = (question: Question) => {

        if (showPlayers) {
            socket.emit('newQuestion', question); // Emit the selected question to the display page
        }

        setSelectedQuestion(question);

    };

    // Function to reveal the answer
    const revealAnswer = () => {
        if (selectedQuestion) {
            socket.emit('revealAnswer'); // Emit event to reveal answer on display page
        }
    };

    // Function to refresh selected questions from the server
    const refreshSelectedQuestions = () => {
        socket.emit('refreshSelectedQuestions'); // Emit the request to refresh the selected questions
    };

    // Reset the game
    const resetGame = () => {
        //setSelectedQuestion(null); // Reset the selected question
        socket.emit('resetGame'); // Emit reset event
    };

    // Award points to a team for answering the question correctly
    const handleCorrectAnswer = (teamIndex: number) => {
        if (selectedQuestion) {
            const points = teams[ teamIndex ].points + selectedQuestion.points;
            const updatedTeam = { ...teams[ teamIndex ], points: points };

            //use alert to ask for confirmation
            // let sure = window.confirm("Are you sure you want to add " + selectedQuestion.points + " points to " + updatedTeam.name + " ?");

            // if (!sure) {
            //     return;
            // }

            socket.emit('addPoints', updatedTeam.name, selectedQuestion.points); // Emit event to add points
            setTeams((prev) => prev.map((team, idx) => (idx === teamIndex ? updatedTeam : team))); // Update local state
        }
    };

    // Deduct points from a team for answering the question incorrectly
    const handleIncorrectAnswer = (teamIndex: number) => {
        if (selectedQuestion && teams[ teamIndex ]) {
            const points = Math.max(0, teams[ teamIndex ].points - selectedQuestion.points); // Prevent negative points
            const updatedTeam = { ...teams[ teamIndex ], points: points };

            //use alert to ask for confirmation

            // let sure = window.confirm("Are you sure you want to deduct " + selectedQuestion.points + " points from " + updatedTeam.name + "?");

            // if (!sure) {
            //     return;
            // }

            socket.emit('addPoints', updatedTeam.name, -selectedQuestion.points); // Emit event to deduct points
            setTeams((prev) => prev.map((team, idx) => (idx === teamIndex ? updatedTeam : team))); // Update local state
        }
    };

    // Function to reset the buzzer
    const resetBuzzer = () => {
        const sure = window.confirm("Are you sure you want to reset the buzzer?");
        if (!sure) {
            return;
        }
        socket.emit('resetBuzzer'); // Emit event to reset the buzzer
    };

    //Function to remove the person on the top of the buzzer list
    const removeTopBuzzer = () => {
        socket.emit('removeTopBuzzer'); // Emit event to remove the top buzzer
    };

    const sendWheelType = (wheelType: string | null) => {
        socket.emit('wheel', wheelType);
    }

    const spinWheel = () => {
        socket.emit('spinWheel');
    };

    const toggleShowPlayers = () => {
        setShowPlayers((prev) => !prev);
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <h1 className="text-4xl font-bold mb-8 text-blue-600">Jeopardy Game Control</h1>
                <Input
                    value={ passphrase }
                    onChange={ handlePassphraseChange }
                    placeholder="Enter passphrase"
                    className="mb-4"
                />
                <Button onClick={ handlePassphraseSubmit } className="bg-blue-600 text-white">
                    Submit
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-8 text-blue-600">Jeopardy Game Control</h1>

            {/* Link to manage teams */ }
            <div className='space-y-4'>
                <div className="flex space-x-4">
                    <Link href="/teams">
                        <Button className="bg-green-600">Manage Players</Button>
                    </Link>
                    <Button onClick={ resetBuzzer } className="bg-yellow-600">
                        Reset Buzzer
                    </Button>
                    <Button onClick={ removeTopBuzzer } className="bg-blue-600"> Next Buzzer</Button>
                    <Button onClick={ toggleShowPlayers } className={ `${showPlayers ? 'bg-green-600' : 'bg-red-600'}` }>{ showPlayers ? 'Showing Players' : 'Control Only' }</Button>

                </div>
                <div className='flex space-x-4'>
                    <Button onClick={ () => sendWheelType('good') } className="bg-green-600">Good Wheel</Button>
                    <Button onClick={ () => sendWheelType('bad') } className="bg-red-600">Bad Wheel</Button>
                    <Button onClick={ () => sendWheelType(null) } className="bg-blue-600">Reset Wheel</Button>
                    <Button onClick={ spinWheel } className="bg-yellow-600">Spin Wheel</Button>
                    <Button onClick={ () => console.log(selectedQuestions) } className="bg-blue-600">Console.log</Button>
                </div>
            </div>

            {/* Team Management Section */ }
            <div className="mb-8 w-full max-w-lg">
                <h2 className="text-2xl font-semibold mb-4">Manage Teams:</h2>

                { teams.length > 0 ? (
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Teams:</h3>
                        <ul className="space-y-2">
                            { teams.map((team, index) => (
                                <li key={ index } className={ `bg-gray-800 p-4 rounded-lg flex justify-between items-center ` }>
                                    <div>
                                        <span className="font-bold">{ team.name }</span>: { team.points } points
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {/* Input for manually entering points */ }
                                        <Input
                                            value={ teamPointsInput[ index ] || '' }
                                            onChange={ (e) => handlePointsInputChange(index, e.target.value) }
                                            className="w-20"
                                            placeholder="Points"
                                            type="number"
                                        />
                                        <Button onClick={ () => updatePoints(index) } className="bg-blue-600 text-white">
                                            Set Points
                                        </Button>
                                    </div>
                                </li>
                            )) }
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-400">No teams created yet.</p>
                ) }
            </div>

            {/* Question Selection Section */ }
            <div className="mb-8 w-full">
                <h2 className="text-2xl font-semibold mb-4">Select Question:</h2>
                <div className="flex justify-between">
                    { questionsData.categories.map((category, index) => (
                        <div key={ index } className="p-4 bg-slate-800 flex flex-col grow">
                            <h3 className="text-xl font-semibold mb-2">{ category.name }</h3>
                            { category.questions.map((question) => {
                                const isQuestionSelected = selectedQuestions[ `${question.question}-${question.points}` ];
                                return (
                                    <Button
                                        key={ question.points }
                                        color="primary"
                                        className={ `mb-2 ${isQuestionSelected ? 'bg-gray-500' : 'bg-blue-600 text-white'}` }
                                        onClick={ () => handleSelectQuestion(question) }
                                    >
                                        { question.points }
                                    </Button>
                                );
                            }) }
                        </div>
                    )) }
                </div>
            </div>

            <div className="flex">
                <Button onClick={ resetGame } className="bg-red-600 text-white px-4 py-2 rounded-lg mr-32">
                    Show Game
                </Button>
                <Button
                    onClick={ () => {
                        if (window.confirm("Are you sure you want to perform a True Refresh? This action cannot be undone.")) {
                            socket.emit("TrueRefresh");
                        }
                    } }
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    True Refresh
                </Button>
            </div>

            {/* Display selected question and answer */ }
            { selectedQuestion && (
                <div className='fixed inset-0 bg-gray-800 bg-opacity-75 z-10 justify-center items-center flex'>
                    <div className="  flex justify-center items-center flex-col mr-2">
                        <div className='items-start'>
                            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mb-2">
                                <p className="text-lg font-semibold text-black">{ selectedQuestion.question }</p>
                                <p className="mt-4 text-md text-gray-600">Answer: { showPlayers ? selectedQuestion.answer : '****' }</p>
                                <p className="mt-4 text-md text-gray-600">Points: { selectedQuestion.points }</p>
                                <div className="mt-4 flex space-x-4">
                                    <Button onClick={ revealAnswer } className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                                        Reveal Answer
                                    </Button>
                                    <Button onClick={ () => {
                                        const teamIndex = teams.findIndex((team) => team.name === buzzOrder[ 0 ]);
                                        handleIncorrectAnswer(teamIndex);
                                        socket.emit('removeTopBuzzer');
                                    } } className="bg-green-600 text-white"> Next Buzzer</Button>
                                    <Button onClick={ resetGame } className="bg-red-600 text-white px-4 py-2 rounded-lg mr-32">
                                        Show Game
                                    </Button>
                                    <Button onClick={ () => setSelectedQuestion(null) } className="bg-gray-600 text-white px-4 py-2 rounded-lg">
                                        Close
                                    </Button>
                                </div>
                                { !showPlayers && (
                                    <Button onClick={ () => setShowPlayers(true) } className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4">Show answer to Control</Button>
                                ) }
                            </div>
                            <div className=' bg-white rounded-lg justify-center items-center flex flex-col'>
                                <h2 className="text-2xl font-semibold mb-4 text-black">Select Team For Points:</h2>
                                <div className='flex flex-row'>
                                    { teams.map((team, index) => (
                                        <div className='flex flex-col'
                                            key={ index }
                                        >
                                            <Button
                                                key={ index }
                                                onClick={ () => handleCorrectAnswer(index) }
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg mr-2 mb-2"
                                            >
                                                { team.name }
                                            </Button>
                                            <Button
                                                key={ index }
                                                onClick={ () => handleIncorrectAnswer(index) }
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg mr-2 mb-2"
                                            >
                                                { team.name }
                                            </Button>
                                        </div>
                                    )) }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='text-xl'>
                        { buzzOrder.length > 0 && (
                            <div className="mt-8 ">
                                <h2 className="text-2xl font-bold text-center mb-4 text-yellow-400">Buzz Order</h2>
                                <ul className="flex flex-col gap-2">
                                    { buzzOrder.map((team, index) => (
                                        <li
                                            key={ index }
                                            className="flex justify-between items-center bg-gray-600 p-3 rounded-lg"
                                        >
                                            <span className="font-semibold mr-2">{ team }</span>
                                            <span className="font-bold text-yellow-400">Buzzed #{ index + 1 }</span>
                                        </li>
                                    )) }
                                </ul>
                            </div>
                        ) }
                    </div>
                </div>
            ) }
        </div>
    );
}
