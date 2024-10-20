"use client";

import Link from 'next/link';
import { Button } from '@nextui-org/react';

// Define the types for the question and category
interface Question {
  points: number;
  question: string;
  answer: string;
}

interface Category {
  name: string;
  questions: Question[];
}

export default function Home() {
  // The type for selectedQuestion can be Question or null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      {/* Make 2 buttons one that points to /control and one that points to /display */ }
      <h1 className="text-4xl font-bold mb-8 text-blue-600">Jeopardy Game</h1>
      <Link href="/display">
        <Button color="primary" className="mb-4">
          Display Page
        </Button>
      </Link>
      <Link href="/control">
        <Button color="secondary">
          Control Page
        </Button>
      </Link>
    </div>
  );
}
