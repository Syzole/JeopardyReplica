// app/control/manage-teams.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button, Input } from '@nextui-org/react';
import Link from 'next/link';
import io from 'socket.io-client';
import { hostingIP } from '@/constants';

const socket = io(hostingIP); // Adjust to your server's URL

interface Team {
    name: string;
    points: number;
}

export default function ManageTeams() {
    const [ teams, setTeams ] = useState<Team[]>([]);
    const [ teamName, setTeamName ] = useState('');

    // Load teams from the server on mount
    useEffect(() => {
        const loadTeams = async () => {
            const response = await fetch('/api/teams');
            const data = await response.json();
            setTeams(data);
        };
        loadTeams();
    }, []);

    // Add a new team
    const addTeam = async () => {
        if (teamName.trim() === '') return; // Prevent empty names
        const response = await fetch('/api/teams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: teamName }),
        });

        if (response.ok) {
            setTeamName(''); // Clear input
            const updatedTeams = await response.json(); // Fetch updated teams from server
            setTeams(updatedTeams.data);
            socket.emit('teams'); // Notify clients of updated teams
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
            const updatedTeams = await response.json(); // Fetch updated teams from server
            setTeams(updatedTeams.data);
            socket.emit('teams'); // Notify clients of updated
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
            <h1 className="text-4xl font-bold mb-8 text-blue-600">Manage Teams</h1>

            {/* Team Management Section */ }
            <div className="mb-8 w-full max-w-lg">
                <div className="flex mb-4">
                    <Input
                        fullWidth
                        placeholder="Team Name"
                        value={ teamName }
                        onChange={ (e) => setTeamName(e.target.value) }
                        className="mr-4"
                    />
                    <Button onClick={ addTeam }>Add Team</Button>
                </div>

                {/*Add button Link to go back to /control page*/ }
                <Link href="/control">
                    <Button className="mb-4 bg-green-600">Back to Control</Button>
                </Link>

                { teams.length > 0 ? (
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Teams:</h3>
                        <ul className="space-y-2">
                            { teams.map((team, index) => (
                                <li key={ index } className="bg-gray-800 p-4 rounded-lg flex justify-between">
                                    <span className="font-bold">{ team.name }</span>
                                    <Button onClick={ () => removeTeam(team.name) } color="danger">Remove</Button>
                                </li>
                            )) }
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-400">No teams created yet.</p>
                ) }
            </div>
        </div>
    );
}
