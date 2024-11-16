"use client";

import { useState, useEffect } from 'react';
import { Button, Input } from '@nextui-org/react';
import questionsData from '@/data/qna.json'; // Import the JSON data
import io from 'socket.io-client';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { controlPassword, hostingIP } from '@/constants';
import { TeamItem } from '../components/teamItem';

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
    const [ showSwapPage, setShowSwapPage ] = useState<boolean>(false); // Whether to show the swap page

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

    const swapPlayerPoints = (team1: string, team2: string) => {
        // swap teams on this page
        const team1Index = teams.findIndex((team) => team.name === team1);
        const team2Index = teams.findIndex((team) => team.name === team2);

        if (team1Index === -1 || team2Index === -1) {
            return;
        }

        const tempPoints = teams[ team1Index ].points;
        const updatedTeams = [ ...teams ];
        updatedTeams[ team1Index ].points = updatedTeams[ team2Index ].points;
        updatedTeams[ team2Index ].points = tempPoints;

        setTeams(updatedTeams);

        socket.emit("updateTeams", teams);
    };

    const randomizeTeamPoints = () => {
        // Create a copy of the teams
        const updatedTeams = [ ...teams ];

        // Extract points and shuffle them
        const points = updatedTeams.map(team => team.points);
        for (let i = points.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [ points[ i ], points[ randomIndex ] ] = [ points[ randomIndex ], points[ i ] ]; // Swap
        }

        // Assign shuffled points back without mutating state
        const shuffledTeams = updatedTeams.map((team, index) => ({
            ...team,
            points: points[ index ],
        }));

        // Update state with new teams
        setTeams(shuffledTeams);

        // Emit the updated teams
        socket.emit("updateTeams", shuffledTeams);
    };

    const revealQuestion = () => {
        console.log("Revealing Question");
        socket.emit("revalQuestion");
    };


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
                    <Button onClick={ () => setShowSwapPage(true) } className={ `bg-blue-600` }>
                        Swap Players Points
                    </Button>
                    <Button onClick={ removeTopBuzzer } className="bg-blue-600"> Next Buzzer</Button>
                    <Button onClick={ toggleShowPlayers } className={ `${showPlayers ? 'bg-green-600' : 'bg-red-600'}` }>{ showPlayers ? 'Showing Players' : 'Control Only' }</Button>

                </div>
                <div className='flex space-x-4'>
                    <Button onClick={ () => sendWheelType('good') } className="bg-green-600">Good Wheel</Button>
                    <Button onClick={ () => sendWheelType('bad') } className="bg-red-600">Bad Wheel</Button>
                    <Button onClick={ () => sendWheelType(null) } className="bg-blue-600">Reset Wheel</Button>
                    <Button onClick={ spinWheel } className="bg-yellow-600">Spin Wheel</Button>
                </div>
            </div>

            {/* Team Management Section */ }
            <div className="mb-8 w-full max-w-lg">
                <h2 className="text-2xl font-semibold mb-4">Manage Teams:</h2>

                { teams.length > 0 ? (
                    <ul className="space-y-2">
                        { teams.map((team, index) => (
                            <TeamItem
                                key={ team.name }
                                team={ team }
                                pointsInput={ teamPointsInput[ index ] || '' }
                                onPointsInputChange={ (value) => handlePointsInputChange(index, value) }
                                onUpdatePoints={ () => updatePoints(index) }
                            />
                        )) }
                    </ul>
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
                    <div className="flex justify-center items-center flex-col">
                        <div className='flex flex-col items-center'>
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full mb-2 flex flex-col flex-grow space-y-8">
                                <p className="text-3xl font-semibold text-black text-wrap">{ selectedQuestion.question }</p>
                                <p className="mt-4 text-3xl text-gray-600">Answer: { showPlayers ? selectedQuestion.answer : '****' }</p>
                                <p className="mt-4 text-3xl text-gray-600">Points: { selectedQuestion.points }</p>
                                <div className="mt-4 space-x-4 items-center justify-center flex">
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
                                    <Button onClick={ revealQuestion } className="bg-gray-600 text-white px-4 py-2 rounded-lg">
                                        Reval Question
                                    </Button>
                                </div>
                                { !showPlayers && (
                                    <Button onClick={ () => setShowPlayers(true) } className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4">Show answer to Control</Button>
                                ) }
                            </div>
                            <div className=' bg-white rounded-lg justify-center items-center flex flex-col px-10'>
                                <h2 className="text-2xl font-semibold mb-4 text-black">Select Team For Points:</h2>
                                <div className='flex flex-row'>
                                    { teams.map((team, index) => (
                                        <div className='flex flex-col'
                                            key={ index }
                                        >
                                            <Button
                                                key={ "Correct" + index }
                                                onClick={ () => handleCorrectAnswer(index) }
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg mr-2 mb-2"
                                            >
                                                { team.name }
                                            </Button>
                                            <Button
                                                key={ "Incorrect " + index }
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

            {/* Swap Players Section */ }
            { showSwapPage && (
                <div className='fixed inset-0 bg-gray-800 bg-opacity-75 z-10 justify-center items-center flex'>
                    <div className="bg-black p-6 rounded-lg shadow-lg max-w-md">
                        <h2 className="text-2xl font-semibold mb-4">Swap Players Points:</h2>
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col gap-4'>
                                <select id="team1" className="bg-gray-700 text-white p-2 rounded-lg">
                                    <option value="">Select Team 1</option>
                                    { teams.map((team, index) => (
                                        <option key={ index } value={ team.name }>{ team.name }</option>
                                    )) }
                                </select>
                                <select id="team2" className="bg-gray-700 text-white p-2 rounded-lg">
                                    <option value="">Select Team 2</option>
                                    { teams.map((team, index) => (
                                        <option key={ index } value={ team.name }>{ team.name }</option>
                                    )) }
                                </select>
                                <Button
                                    onClick={ () => {
                                        const team1 = (document.getElementById('team1') as HTMLSelectElement).value;
                                        const team2 = (document.getElementById('team2') as HTMLSelectElement).value;
                                        if (team1 && team2) {
                                            if (team1 === team2) {
                                                alert('Please select two different teams to swap points.');
                                            } else {
                                                swapPlayerPoints(team1, team2);
                                            }
                                        } else {
                                            alert('Please select both teams to swap points.');
                                        }
                                    } }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Swap Points
                                </Button>
                            </div>
                        </div>
                        <Button onClick={ () => randomizeTeamPoints() } className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4">
                            Randomize Points
                        </Button>
                        <Button onClick={ () => setShowSwapPage(false) } className="bg-gray-600 text-white px-4 py-2 rounded-lg mt-4">
                            Close
                        </Button>
                    </div>
                </div>
            ) }

        </div>
    );
}
