import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface effect {
    effect: string;

}

function WheelOfLuck({ type }: { type: string }) {
    const [ effects, setEffects ] = useState([]);
    const [ selectedEffect, setSelectedEffect ] = useState<effect | null>(null);
    const [ isSpinning, setIsSpinning ] = useState(false);
    const [ rotation, setRotation ] = useState(0);

    useEffect(() => {
        fetch('/data/wheelEffects.json')
            .then((response) => response.json())
            .then((data) => {
                if (type === 'good') {
                    setEffects(data.goodLuck);
                } else {
                    setEffects(data.badLuck);
                }
            });
    }, [ type ]);

    // Function to spin the wheel
    const spinWheel = () => {
        if (isSpinning) return;  // Prevent re-spin while already spinning

        setIsSpinning(true);
        const randomIndex = Math.floor(Math.random() * effects.length);

        // Simulate a random wheel spin with random degrees of rotation
        const spinAmount = 360 * 5 + Math.floor(Math.random() * 360);  // 5 full spins + random extra

        setRotation(spinAmount);

        // Set timeout to stop the wheel and select the effect
        setTimeout(() => {
            setSelectedEffect(effects[ randomIndex ]);
            setIsSpinning(false);
        }, 3000);  // Spins for 3 seconds
    };

    return (
        <div style={ { textAlign: 'center' } }>
            <h2>{ type === 'good' ? 'Wheel of Good Luck' : 'Wheel of Bad Luck' }</h2>
            <motion.div
                style={ {
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    border: '5px solid #333',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 'auto',
                    background: type === 'good' ? 'lightgreen' : 'lightcoral',
                } }
                animate={ { rotate: rotation } }
                transition={ { duration: 3, ease: "easeInOut" } }
            >
                <p style={ { fontSize: '20px', fontWeight: 'bold' } }>
                    { isSpinning ? 'Spinning...' : 'Spin the Wheel!' }
                </p>
            </motion.div>

            <button
                onClick={ spinWheel }
                style={ {
                    marginTop: '20px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: isSpinning ? 'not-allowed' : 'pointer',
                    backgroundColor: 'lightblue',
                    border: 'none',
                    borderRadius: '5px',
                } }
                disabled={ isSpinning }
            >
                Spin the Wheel
            </button>

            { selectedEffect && !isSpinning && (
                <div>
                    <h3>Result:</h3>
                    <p>{ selectedEffect.effect }</p>
                </div>
            ) }
        </div>
    );
};

export default WheelOfLuck;
