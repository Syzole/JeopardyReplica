"use client";

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Button } from '@nextui-org/react';
import { hostingIP } from '@/constants';

// Initialize the socket connection
const socket = io(hostingIP); // Replace with your server's URL

interface Team {
    name: string;
    points: number;
    buzzOrder: number | null; // Track the buzz order
}

// Define the BuzzerPage component
const BuzzerPage: React.FC = () => {
    const [ name, setName ] = useState<string | null>(null); // User's name
    const [ tempName, setTempName ] = useState<string>(""); // Temporary state for input field
    const [ buzzOrder, setBuzzOrder ] = useState<string[]>([]); // Store the order of buzzes
    const [ hasBuzzed, setHasBuzzed ] = useState<boolean>(false); // Track if user has buzzed
    const [ nameError, setNameError ] = useState<string | null>(null); // Error message for duplicate name
    const [ teams, setTeams ] = useState<Team[]>([]);

    // Listen for the buzz order update from the server
    useEffect(() => {

        const loadTeams = async () => {
            const response = await fetch('/api/teams');
            const data = await response.json();
            //data.sort((a: Team, b: Team) => b.points - a.points); // Sort teams by points
            setTeams(data);
        };
        loadTeams();

        socket.on('buzz', (newBuzzOrder: string[]) => {
            setBuzzOrder(newBuzzOrder);
        });

        socket.on('teams', () => {
            loadTeams();
        });

        socket.on("disableBuzzers", () => {
            setHasBuzzed(true);
        });

        // Clean up the socket listener when the component unmounts
        return () => {
            socket.off('buzz');
            socket.off('teams');
        };
    }, []);

    // Handle the buzz action
    const handleBuzz = () => {
        if (name && !hasBuzzed) {
            setHasBuzzed(true); // Disable further buzzing for this user
            setTimeout(() => socket.emit('buzz', name), 50); // Send the buzz to the server with a slight delay
        }
    };

    // Reset the buzzer when the server triggers a reset
    useEffect(() => {
        socket.on('resetBuzzer', () => {
            setHasBuzzed(false); // Enable buzzing again
            setBuzzOrder([]); // Clear the buzz order
        });

        socket.on("disableBuzzers", () => {
            setHasBuzzed(true);
        });

        return () => {
            socket.off('resetBuzzer');
        };
    }, []);

    // Handle name submission and check for uniqueness on the server side
    const handleNameSubmit = () => {
        if (tempName.trim() !== "") {
            // Send the name to the server to check if it's already taken
            socket.emit('checkName', tempName, (isNameTaken: boolean) => {
                if (isNameTaken) {
                    setNameError("This name is already taken. Please choose a different one.");
                } else {
                    setName(tempName); // Set name only if it's unique
                    setNameError(null); // Clear any previous error
                }
            });
        } else {
            alert("Please select a name!");
        }
    };

    // Client-side: useEffect with beforeunload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (name) {
                socket.emit('removeName', name);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [ name ]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
            <h1 className="text-4xl font-bold mb-8">Jeopardy Buzzer</h1>

            {/* Display input for name if it's not set */ }
            { !name ? (
                <div className="flex flex-col items-center">
                    {/* Dropdown to select team name */ }
                    <select
                        value={ tempName }
                        onChange={ (e) => setTempName(e.target.value) }
                        className="mb-4 p-2 bg-gray-700 text-white rounded"
                    >
                        <option value="" disabled>Select your team</option>
                        { teams.map((team) => (
                            <option key={ team.name } value={ team.name }>
                                { team.name }
                            </option>
                        )) }
                    </select>
                    <Button
                        onClick={ handleNameSubmit }
                        className="bg-blue-600 text-white"
                    >
                        Join as Team
                    </Button>
                    { nameError && <p className="text-red-500 mt-2">{ nameError }</p> }
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <p className="text-xl mb-4">Hello, { name }! Press the button to buzz in.</p>

                    {/* Buzz button, disabled if the user has already buzzed */ }
                    <Button
                        onClick={ handleBuzz }
                        disabled={ hasBuzzed }
                        className={ `bg-green-600 text-white w-64 h-64 rounded-full ${hasBuzzed ? 'bg-gray-500' : 'bg-green-600'} text-3xl` }
                    >
                        { hasBuzzed ? 'Buzzed' : 'Buzz In!' }
                    </Button>

                    {/* Display the buzz order */ }
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Buzz Order</h2>
                        <ul className="list-disc list-inside">
                            { buzzOrder.map((user, index) => (
                                <li key={ index } className="text-lg">
                                    { index + 1 }. { user }
                                </li>
                            )) }
                        </ul>
                    </div>
                </div>
            ) }
        </div>
    );
};

export default BuzzerPage;
