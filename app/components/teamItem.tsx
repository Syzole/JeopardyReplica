import React, { memo } from 'react';
import { Button, Input } from '@nextui-org/react';

// Individual team item component
interface TeamItemProps {
    team: { name: string; points: number };
    pointsInput: string;
    onPointsInputChange: (value: string) => void;
    onUpdatePoints: () => void;
}

export const TeamItem = memo(({ team, pointsInput, onPointsInputChange, onUpdatePoints }: TeamItemProps) => {
    console.log(`Rendering TeamItem: ${team.name}`); // Debug to confirm memoization
    return (
        <li className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
            <div>
                <span className="font-bold">{ team.name }</span>: { team.points } points
            </div>
            <div className="flex items-center space-x-2">
                {/* Input for manually entering points */ }
                <Input
                    value={ pointsInput || '' }
                    onChange={ (e) => onPointsInputChange(e.target.value) }
                    className="w-20"
                    placeholder="Points"
                    type="number"
                />
                <Button onClick={ onUpdatePoints } className="bg-blue-600 text-white">
                    Set Points
                </Button>
            </div>
        </li>
    );
});

// Assign a display name for the memoized component
TeamItem.displayName = "TeamItem";

