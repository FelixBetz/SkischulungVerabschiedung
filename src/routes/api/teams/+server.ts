import { json } from '@sveltejs/kit';
import { teamsStore } from '$lib/stores/teams.svelte.js';
import type { RequestHandler } from './$types.js';

// GET /api/teams - Get all teams
export const GET: RequestHandler = async () => {
	return json({
		success: true,
		data: teamsStore.teams
	});
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

		const newTeam = { name, points, iconUrl };
		teamsStore.addTeam(newTeam);

		return json({
			success: true,
			data: newTeam
		});
	} catch (error) {
		console.log(error);
		return json(
			{
				success: false,
				error: 'Invalid JSON'
			},
			{ status: 400 }
		);
	}
};

// PUT /api/teams - Update teams data
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

		teamsStore.setTeams(teams);

		return json({
			success: true,
			data: teams
		});
	} catch (error) {
		console.log(error);
		return json(
			{
				success: false,
				error: 'Invalid JSON'
			},
			{ status: 400 }
		);
	}
};
