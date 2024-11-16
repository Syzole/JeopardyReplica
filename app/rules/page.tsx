"use client";

import React, { useState, useEffect } from 'react';
import Rules from '@/app/components/rules';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/react';
import Link from 'next/link';
import io from 'socket.io-client';
import { hostingIP } from '@/constants';


const socket = io(hostingIP); // Adjust to your server's URL

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

        socket.on("teams", () => {
            loadTeams();
        });

        return () => {
            socket.off("teams");
        }

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

        console.log(response);

        if (response.status !== 400) {
            setTeamName('');
            loadTeams(); // Reload teams after adding
            setHasAdded(true);
            socket.emit('teams'); // Notify clients of updated
            return;
        }

        window.alert('Team name already exists');
        setHasAdded(false);
        setTeamName('');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
            <div className="text-center">
                <Rules showAdminNotes={ false } />
            </div>
            {/* Add team section */ }
            <div className="mb-8 w-full max-w-lg flex flex-col items-center">
                <h2 className="text-2xl font-semibold mb-4">Create Teams:</h2>

                <div className="flex space-y-4 flex-col">
                    <Input
                        fullWidth
                        placeholder="Team Name"
                        value={ teamName }
                        onChange={ (e) => setTeamName(e.target.value) }
                        className={ "mr-4 " }
                    />
                    <Button
                        onClick={ addTeam }
                        disabled={ hasAdded } // Keep the button disabled when `hasAdded` is true
                        color={ hasAdded ? 'success' : 'primary' }
                    >
                        { hasAdded ? 'Team Added!' : 'Add Team' }
                    </Button>
                </div>

                <div className="mt-8">
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
            </div>
            <div className="text-center mb-8">
                <p className="text-2xl font-semibold mb-4">Once your done click the buttont to head to the buzzer page</p>
                <Link href="/buzzerPage">
                    <Button>Go to buzzer</Button>
                </Link>
            </div>
        </div>
    );
};

export default App;
