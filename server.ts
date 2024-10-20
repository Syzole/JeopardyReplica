// server.ts
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

interface Question {
	question: string;
	correctAnswer: string;
	value: number;
}

let currentQuestion: Question | null = null;

app.prepare().then(() => {
	const server = createServer((req, res) => {
		handle(req, res);
	});

	// Create a Socket.io server instance
	const io = new Server(server, {
		cors: {
			origin: "*", // Allow all origins for testing (update in production)
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket) => {
		console.log("New client connected:", socket.id);

		// Listen for the host to set a new question
		socket.on("newQuestion", (question: Question) => {
			currentQuestion = question;
			console.log("New question set:", currentQuestion);
			io.emit("currentQuestion", currentQuestion); // Send the question to all clients
		});

		// Handle disconnection
		socket.on("disconnect", () => {
			console.log("Client disconnected:", socket.id);
		});
	});

	const PORT = 3000;
	const HOST = "0.0.0.0";

	server.listen(PORT, HOST, (err?: Error) => {
		if (err) throw err;
		console.log(`> Ready on http://${HOST}:${PORT}`);
	});
});
