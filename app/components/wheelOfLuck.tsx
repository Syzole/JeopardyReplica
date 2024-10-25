import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import wheelEffects from '@/data/wheelEffects.json';
import io from 'socket.io-client';

const socket = io('http://10.0.0.194:3000'); // Adjust to your server's URL

interface effects {
    effect: string;
    type: string;
}

function ListOfFortune({ type }: { type: string }) {
    const items: string[] = [];

    if (type === 'good') {
        wheelEffects.goodLuck.forEach((effect: effects) => {
            items.push(effect.effect);
        });
    }
    if (type === 'bad') {
        wheelEffects.badLuck.forEach((effect: effects) => {
            items.push(effect.effect);
        });
    }


    const [ selectedIndex, setSelectedIndex ] = useState<number>(0);
    const [ isRolling, setIsRolling ] = useState<boolean>(false);
    let timeoutId: NodeJS.Timeout;

    useEffect(() => {

        socket.on('spinWheel', () => {
            startSpinning();
        });

        return () => {
            clearTimeout(timeoutId); // Clear timeout on unmount

        }
    }, []);

    // At the top, add a utility to generate a random number within a range
    const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const startSpinning = () => {
        setIsRolling(true);

        // Set a random starting index for each spin
        setSelectedIndex(getRandomInt(0, items.length - 1));

        const accelerationIntervals = [ 300, 250, 200, 150, 120, 100, 90, 80 ];
        const decelerationIntervals = [ 100, 120, 150, 200, 250, 300, 350, 400, 450, 500, 600 ];

        let currentPhase = 'ACCELERATION';
        let step = 0;

        const rollingSteps = getRandomInt(20, 50); // Randomize the number of steps in the rolling phase
        const performRoll = () => {
            let interval;

            if (currentPhase === 'ACCELERATION') {
                interval = accelerationIntervals[ step ] || 80;
                if (step >= accelerationIntervals.length - 1) {
                    currentPhase = 'ROLLING';
                    step = 0;
                }
            } else if (currentPhase === 'ROLLING') {
                interval = getRandomInt(50, 120);
                if (step >= rollingSteps) {
                    currentPhase = 'DECELERATION';
                    step = 0;
                }
            } else if (currentPhase === 'DECELERATION') {
                interval = decelerationIntervals[ step ] || decelerationIntervals[ decelerationIntervals.length - 1 ];
                if (step >= decelerationIntervals.length - 1) {
                    setIsRolling(false);
                    return;
                }
            }

            timeoutId = setTimeout(() => {
                setSelectedIndex((prevIndex) => (prevIndex + 1) % items.length);
                step++;
                performRoll();
            }, interval);
        };

        performRoll();
    };

    return (
        <div style={ { textAlign: 'center' } }>
            <div style={ { position: 'relative', width: '250px', overflow: 'hidden', margin: 'auto' } }>
                <ItemList items={ items } selectedIndex={ selectedIndex } isRolling={ isRolling } />
                <Arrow selectedIndex={ selectedIndex } isRolling={ isRolling } />
            </div>
            <div style={ { marginTop: '20px' } }>
                <button onClick={ startSpinning } disabled={ isRolling }>
                    Spin
                </button>
            </div>
            <h2 style={ { marginTop: '20px' } }>Selected Item: { items[ selectedIndex ] }</h2>
            { isRolling && <h3 style={ { marginTop: '10px', color: 'blue' } }>Spinning...</h3> }
        </div>
    );
};

interface ItemListProps {
    items: string[];
    selectedIndex: number;
    isRolling: boolean;
}

const ItemList: React.FC<ItemListProps> = ({ items, selectedIndex, isRolling }) => {
    return (
        <ul style={ { listStyleType: 'none', padding: 0, margin: 0 } }>
            { items.map((item, index) => (
                <motion.li
                    key={ index }
                    style={ {
                        padding: '10px',
                        backgroundColor: index === selectedIndex ? '#007bff' : 'transparent', // Blue for selected
                        color: '#ffffff'

                    } }
                    initial={ { opacity: 0.5 } }
                    animate={ { opacity: index === selectedIndex ? 1 : 0.5 } }
                    transition={ { duration: 0.3 } }
                >
                    { item }
                </motion.li>
            )) }
        </ul>
    );
};

interface ArrowProps {
    selectedIndex: number;
    isRolling: boolean;
}

const Arrow: React.FC<ArrowProps> = ({ selectedIndex, isRolling }) => {
    return (
        <motion.div
            style={ {
                position: 'absolute',
                right: '-40px',
                top: `${selectedIndex * 40}px`,
                fontSize: '36px',
                color: 'black',
            } }
            animate={ {
                top: `${selectedIndex * 40}px`,
                transition: {
                    type: 'spring',
                    stiffness: isRolling ? 500 : 50,
                    damping: isRolling ? 20 : 10,
                },
            } }
        >
            ➔
        </motion.div>
    );
};

export default ListOfFortune;
