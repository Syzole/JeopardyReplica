// app/api/teams/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "teams.json");

interface Team {
	name: string;
	points: number;
}

// Helper function to read teams from the JSON file
const readTeamsFromFile = () => {
	const data = fs.readFileSync(filePath, "utf-8");
	return JSON.parse(data);
};

// Helper function to write teams to the JSON file
const writeTeamsToFile = (teams: Team[]) => {
	fs.writeFileSync(filePath, JSON.stringify(teams, null, 2));
};

// GET handler to retrieve teams
export async function GET() {
	const teams = readTeamsFromFile();
	return NextResponse.json(teams);
}

// POST handler to add a new team
export async function POST(request: Request) {
	const { name } = await request.json();
	const teams = readTeamsFromFile();

	if (!name || teams.some((team: Team) => team.name === name)) {
		return NextResponse.json({ message: "Invalid team name" }, { status: 400 });
	}

	teams.push({ name, points: 0 });
	writeTeamsToFile(teams);
	return NextResponse.json({ message: "Team added", data: teams });
}

// DELETE handler to remove a team
export async function DELETE(request: Request) {
	const { name } = await request.json();
	const teams = readTeamsFromFile().filter((team: Team) => team.name !== name);
	writeTeamsToFile(teams);
	return NextResponse.json({ message: "Team removed", data: teams });
}
