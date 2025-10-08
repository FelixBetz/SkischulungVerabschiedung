import { json } from '@sveltejs/kit';
import { teamsRepository } from '$lib/server/db/teams.js';
import type { RequestHandler } from './$types.js';

// GET /api/teams - Get all teams
export const GET: RequestHandler = async () => {
	try {
		const teams = await teamsRepository.getAllTeams();
		return json({
			success: true,
			data: teams
		});
	} catch (error) {
		console.error('Error fetching teams:', error);
		return json(
			{
				success: false,
				error: 'Failed to fetch teams'
			},
			{ status: 500 }
		);
	}
};

// POST /api/teams - Add a new team
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { name, points = 0, iconUrl } = body;

		if (!name || !iconUrl) {
			return json(
				{
					success: false,
					error: 'Name and iconUrl are required'
				},
				{ status: 400 }
			);
		}

		const newTeam = {
			name,
			points,
			iconUrl
		};

		const createdTeam = await teamsRepository.createTeam(newTeam);

		return json({
			success: true,
			data: createdTeam
		});
	} catch (error) {
		console.error('Error creating team:', error);
		return json(
			{
				success: false,
				error: 'Failed to create team'
			},
			{ status: 500 }
		);
	}
};

// PUT /api/teams - Replace all teams data (bulk update)
export const PUT: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { teams } = body;

		if (!Array.isArray(teams)) {
			return json(
				{
					success: false,
					error: 'Teams must be an array'
				},
				{ status: 400 }
			);
		}

		// Delete all existing teams and insert new ones
		// This is a bulk replace operation
		const existingTeams = await teamsRepository.getAllTeams();
		for (const team of existingTeams) {
			await teamsRepository.deleteTeam(team.id);
		}

		for (const team of teams) {
			const { id, ...teamData } = team;
			await teamsRepository.createTeam(teamData);
		}

		const updatedTeams = await teamsRepository.getAllTeams();

		return json({
			success: true,
			data: updatedTeams
		});
	} catch (error) {
		console.error('Error updating teams:', error);
		return json(
			{
				success: false,
				error: 'Failed to update teams'
			},
			{ status: 500 }
		);
	}
};
