import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import fs from "fs";
import path from "path"; // Use path to work with file paths properly

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

interface Question {
	question: string;
	answer: string;
	points: number;
}

let currentQuestion: Question | null = null;

// Track which questions have been selected
let selectedQuestions: Record<string, boolean> = {};

// Path to the teams.json file
const teamsFilePath = path.join(__dirname, "data", "teams.json");

app.prepare().then(() => {
	const server = createServer((req, res) => {
		handle(req, res);
	});

	// Create a Socket.io server instance
	const io = new Server(server, {
		cors: {
			origin: "*", // Allow all origins for testing (update this in production)
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket) => {
		console.log("New client connected:", socket.id);

		// Listen for the host to set a new question
		socket.on("newQuestion", (question: Question) => {
			currentQuestion = question;

			console.log("New question set:", currentQuestion);

			// Send the question and updated selected questions to all clients
			io.emit("currentQuestion", currentQuestion);
			io.emit("selectedQuestions", selectedQuestions);
		});

		socket.on("refreshSelectedQuestions", () => {
			io.emit("selectedQuestions", selectedQuestions); // Send the current selectedQuestions back to the client
		});

		// Reveal the correct answer for the current question
		socket.on("revealAnswer", () => {
			console.log("Revealing answer...");
			if (currentQuestion) {
				console.log("Answer:", currentQuestion.answer);
				selectedQuestions[`${currentQuestion.question}-${currentQuestion.points}`] = true; // Mark the question as selected
				io.emit("selectedQuestions", selectedQuestions); // Notify clients that questions have been reset
				io.emit("revealAnswer", currentQuestion.answer, selectedQuestions); // Send the answer to all clients
			}
		});

		// Reset the game (clear the current question and state)
		socket.on("resetGame", () => {
			console.log("Resetting game...");
			currentQuestion = null;

			io.emit("currentQuestion", null); // Clear the question on all clients
			io.emit("selectedQuestions", selectedQuestions); // Notify clients that questions have been reset
			io.emit("resetGame"); // Optionally notify clients of game reset
		});

		socket.on("TrueRefresh", () => {
			console.log("TrueRefresh");
			selectedQuestions = {};
			io.emit("selectedQuestions", selectedQuestions);
		});

		socket.on("addPoints", (teamName: string, points: number) => {
			console.log(`Adding ${points} points to ${teamName}`);
			const teams = JSON.parse(fs.readFileSync(teamsFilePath, "utf-8"));

			const teamIndex = teams.findIndex((team: any) => team.name === teamName);
			if (teamIndex === -1) {
				console.log("Team not found");
				return;
			}

			teams[teamIndex].points += points;

			fs.writeFileSync(teamsFilePath, JSON.stringify(teams, null, 2), "utf-8");

			io.emit("teams"); // Send the updated teams to all clients
		});

		socket.on("teams", () => {
			io.emit("teams"); // Send the updated teams to all clients
		});

		// Handle disconnection
		socket.on("disconnect", () => {
			console.log("Client disconnected:", socket.id);
		});
	});

	// Gracefully reset the teams file and shutdown the server on termination signal
	const resetTeamsFile = () => {
		console.log("Resetting teams file...");
		fs.writeFileSync(teamsFilePath, JSON.stringify([]), "utf-8"); // Reset the teams file to an empty array
	};

	// Listen for SIGINT (Ctrl+C) or SIGTERM (kill command)
	process.on("SIGINT", () => {
		console.log("SIGINT received. Shutting down...");
		resetTeamsFile();
		process.exit(0); // Exit the process
	});

	process.on("SIGTERM", () => {
		console.log("SIGTERM received. Shutting down...");
		resetTeamsFile();
		process.exit(0); // Exit the process
	});

	const PORT = 3000;
	const HOST = "0.0.0.0"; // Listen on all interfaces

	server.listen(PORT, HOST, (err?: Error) => {
		if (err) throw err;
		console.log(`> Ready on http://${HOST}:${PORT}`);
	});
});
