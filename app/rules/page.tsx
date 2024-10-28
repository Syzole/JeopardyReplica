"use client";

import React, { useState, useEffect } from 'react';
import Rules from '@/app/components/rules';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/react';
import Link from 'next/link';
import io from 'socket.io-client';


const socket = io('http://10.0.0.194:3000'); // Adjust to your server's URL

interface Team {
    name: string;
    points: number;
}


const App: React.FC = () => {

    const [ teams, setTeams ] = useState<Team[]>([]);
    const [ teamName, setTeamName ] = useState('');
    const [ hasAdded, setHasAdded ] = useState(false);

    // Function to load teams from the server
    const loadTeams = async () => {
        const response = await fetch('/api/teams');
        const data = await response.json();
        setTeams(data);
    };

    // Load teams on component mount
    useEffect(() => {
        loadTeams();
    }, []);

    // Function to add a new team
    const addTeam = async () => {
        if (teamName.trim() === '') return;

        const response = await fetch('/api/teams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: teamName }),
        });

        if (response.ok) {
            setTeamName('');
            loadTeams(); // Reload teams after adding
            socket.emit('teams'); // Notify clients of updated
            setHasAdded(true);
        }
    };

    // Function to remove a team
    const removeTeam = async (name: string) => {
        const response = await fetch('/api/teams', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

        if (response.ok) {
            loadTeams(); // Reload teams after removing
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center space--4">
            <div className="text-center">
                <Rules showAdminNotes={ false } />
            </div>
            {/* Add team section */ }
            <div className="mb-8 w-full max-w-lg">
                <h2 className="text-2xl font-semibold mb-4">Create Teams:</h2>

                <div className="flex mb-4">
                    <Input
                        fullWidth
                        placeholder="Team Name"
                        value={ teamName }
                        onChange={ (e) => setTeamName(e.target.value) }
                        className={ "mr-4" + (hasAdded ? ' bg-gray-300' : 'bg-cyan-800') }
                    />
                    <Button onClick={ addTeam }
                        disabled={ hasAdded }
                    >Add Team</Button>
                </div>

                { teams.length > 0 ? (
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Teams:</h3>
                        <ul className="space-y-2">
                            { teams.map((team, index) => (
                                <li key={ index } className="bg-gray-800 p-4 rounded-lg flex justify-between">
                                    <div>
                                        <span className="font-bold">{ team.name }</span>: { team.points } points
                                    </div>
                                </li>
                            )) }
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-400">No teams created yet.</p>
                ) }
            </div>
            <div className="text-center">
                <p className="text-2xl font-semibold mb-4">Once your done click the buttont to head to the buzzer page</p>
                <Link href="/buzzerPage">
                    <Button>Go to buzzer</Button>
                </Link>
            </div>
        </div>
    );
};

export default App;
