// app/page.tsx

"use client";

import Link from 'next/link';
import { Button } from '@nextui-org/react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Jeopardy</h1>
      <div className="flex space-x-4">
        <Link href="/adminRules">
          <Button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Admin rules and controls
          </Button>
        </Link>
        <Link href="/rules">
          <Button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Rules
          </Button>
        </Link>
        <Link href="/display">
          <Button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
            Display Page
          </Button>
        </Link>
        <Link href="/qrPage">
          <Button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            QR Code
          </Button>
        </Link>
      </div>
    </div>
  );
}
