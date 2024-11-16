import React from 'react';

// Define a type for the props to control visibility of admin notes
interface RulesProps {
    showAdminNotes?: boolean;
}

const Rules: React.FC<RulesProps> = ({ showAdminNotes = false }) => {
    return (
        <div className="p-8 max-w-3xl mx-auto  rounded-lg shadow-md flex flex-col">
            <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">Jeopardy Party Game Rules</h1>

            {/* Player Rules Section */ }
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">Welcome to Jeopardy!</h2>
                <p className="mb-4">
                    <strong>Objective:</strong> Score the most points by answering trivia questions and navigating exciting luck-based effects!
                </p>

                <h3 className="text-xl font-semibold mb-2">How to Play</h3>
                <ol className="list-decimal list-inside mb-4">
                    <li className="mb-2">
                        <strong>Game Setup:</strong> Choose from a set of categories, each containing questions of different point values. Answer questions to earn points, but beware of random luck effects!
                    </li>
                    <li className="mb-2">
                        <strong>Your Turn:</strong> When a question is selected, any player can buzz in to answer. If they are incorrect, the next player who buzzed can answer, the buzzer is open until the answer is revealed.
                    </li>
                    <li className="mb-2">
                        <strong>Buzzer System:</strong> Players can use buzzers to signal their intent to answer.
                        The first player to buzz gets the first opportunity to respond in turn order.
                    </li>
                    <li className="mb-2">
                        <strong>Luck Effects:</strong> After answering, a random luck effect may occur, either helping or hindering your score.
                    </li>
                </ol>
            </section>

            {/* Admin Notes Section */ }
            { showAdminNotes && (
                <section className="mt-8 p-4 border border-blue-500 rounded">
                    <h2 className="text-2xl font-semibold mb-2 text-blue-600">Host/Administrator Notes</h2>
                    <ol className="list-decimal list-inside mb-4">
                        <li className="mb-2">
                            <strong>Game Flow:</strong> Players take turns selecting categories and answering questions. Use the buzzer system to determine who answers in open situations, maintaining the turn order.
                        </li>
                        <li className="mb-2">
                            <strong>Effect Management:</strong> Keep track of which effects are activated and ensure that players follow through with the effects immediately.
                        </li>
                        <li className="mb-2">
                            <strong>Final Jeopardy:</strong> Consider having a final round where players can wager points on a single question, without triggering luck effects.
                        </li>
                    </ol>
                </section>
            ) }
        </div>
    );
};

export default Rules;
