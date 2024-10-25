"use client";

import React from 'react';
import ListOfFortune from '../components/wheelOfLuck';

const TestPage: React.FC = () => {
    return (
        <div>
            <h1>Fortune List</h1>
            <ListOfFortune type='bad' />
        </div>
    );
};

export default TestPage;