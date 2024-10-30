import React from 'react';
import Rules from '@/app/components/rules';
import { Button } from '@nextui-org/button';
import Link from 'next/link';

const App: React.FC = () => {

    return (
        <div className="min-h-screen bg-gray-800 flex items-center justify-center">
            <div className="text-center">
                <Rules showAdminNotes={ true } />
            </div>
            <div className="text-center">
                <p className="text-2xl font-semibold mb-4">Once your done click the button to head to the buzzer page (It does have a password)</p>
                <Link href="/control">
                    <Button>Go to control Page</Button>
                </Link>
            </div>
        </div>
    );
};

export default App;
