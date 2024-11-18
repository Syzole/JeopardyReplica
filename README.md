# Jeopardy Game

This is a Jeopardy game application built with Next.js, React, TypeScript, and Socket.io. The application allows users to control and display a Jeopardy game with real-time updates.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-username/jeopardy.git
   cd jeopardy
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Adjust the constants file to control the ip adress of the host and the password for the admin page.

## Usage

1. Start the development server:

   ```sh
   npm run dev
   ```

   or

   ```sh
    npm run bulid && npm run start
   ```

2. Open your browser and navigate to `http://localhost:3000` or `http:{yourIP}:3000`.

## Project Structure

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for linting errors.

## Dependencies

- `next`: ^15.0.3
- `react`: ^18
- `react-dom`: ^18
- `socket.io`: ^4.8.0
- `socket.io-client`: ^4.8.0
- `framer-motion`: ^11.11.9
- `js-cookie`: ^3.0.5
- `@nextui-org/react`: ^2.4.8
- `@nextui-org/button`: ^2.0.38
- `@nextui-org/system`: ^2.2.6
- `@nextui-org/theme`: ^2.2.11
- `qrcode`: ^1.5.4

## License

This project is licensed under the MIT License.

credit to credit magic the noah for the original questions, me and my friends had alot of fun playing these type.

## Flow

1. The host needs to use 2 devices, one to display the game and the other to control the game.
2. Each team needs 1 device to buzz in and answer the question.
3. The host can select questions then read the question, then hit reval question to show the question to the teams.
4. The teams can buzz in by pressing the buzzer button.
5. The host can then see the teams and what team buzzed in first, give them the chance to answer, and proceed accordingly.
6. The host can also use the admin page to control the game, such as changing the score, revealing the answer, and more.

If you have any questions, please put them in the issues tab and I will respond as soon as I can.
