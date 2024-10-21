// app/page.tsx

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@nextui-org/react';

interface Team {
  name: string;
  points: number;
}

export default function Home() {
  const [ teams, setTeams ] = useState<Team[]>([]);
  const [ teamName, setTeamName ] = useState('');

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">Jeopardy Game Control</h1>

      {/* Add team section */ }
      <div className="mb-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Create Teams:</h2>

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

        { teams.length > 0 ? (
          <div>
            <h3 className="text-xl font-semibold mb-2">Teams:</h3>
            <ul className="space-y-2">
              { teams.map((team, index) => (
                <li key={ index } className="bg-gray-800 p-4 rounded-lg flex justify-between">
                  <div>
                    <span className="font-bold">{ team.name }</span>: { team.points } points
                  </div>
                  <Button color="danger" size="sm" onClick={ () => removeTeam(team.name) }>
                    Remove
                  </Button>
                </li>
              )) }
            </ul>
          </div>
        ) : (
          <p className="text-gray-400">No teams created yet.</p>
        ) }
      </div>

      {/* Navigation buttons */ }
      <div className="flex space-x-4">
        <Link href="/display">
          <Button color="primary">Display Page</Button>
        </Link>
        <Link href="/control">
          <Button color="secondary">Control Page</Button>
        </Link>
      </div>
    </div>
  );
}
