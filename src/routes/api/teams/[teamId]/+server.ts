import { json } from '@sveltejs/kit';
import { teamsRepository } from '$lib/server/db/teams.js';
import type { RequestHandler } from './$types.js';

// GET /api/teams/[teamId] - Get specific team by ID
export const GET: RequestHandler = async ({ params }) => {
	try {
		const teamId = parseInt(params.teamId);
		if (isNaN(teamId)) {
			return json(
				{
					success: false,
					error: 'Invalid team ID'
				},
				{ status: 400 }
			);
		}

		const team = await teamsRepository.getTeamById(teamId);

		if (!team) {
			return json(
				{
					success: false,
					error: 'Team not found'
				},
				{ status: 404 }
			);
		}

		return json({
			success: true,
			data: team
		});
	} catch (error) {
		console.error('Error fetching team:', error);
		return json(
			{
				success: false,
				error: 'Failed to fetch team'
			},
			{ status: 500 }
		);
	}
};

// PATCH /api/teams/[teamId] - Update team points or name by ID
export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const { points, name, addPoints } = body;
		const teamId = parseInt(params.teamId);

		if (isNaN(teamId)) {
			return json(
				{
					success: false,
					error: 'Invalid team ID'
				},
				{ status: 400 }
			);
		}

		// Check if team exists
		const existingTeam = await teamsRepository.getTeamById(teamId);
		if (!existingTeam) {
			return json(
				{
					success: false,
					error: 'Team not found'
				},
				{ status: 404 }
			);
		}

		let updatedTeam = existingTeam;

		// Update points (set absolute value)
		if (typeof points === 'number') {
			const result = await teamsRepository.updateTeamPoints(teamId, points);
			if (result) updatedTeam = result;
		}

		// Add points to existing total
		if (typeof addPoints === 'number') {
			const result = await teamsRepository.addPointsToTeam(teamId, addPoints);
			if (result) updatedTeam = result;
		}

		// Update name
		if (name && name !== existingTeam.name) {
			const result = await teamsRepository.updateTeamName(teamId, name);
			if (result) updatedTeam = result;
		}

		return json({
			success: true,
			data: updatedTeam
		});
	} catch (error) {
		console.error('Error updating team:', error);
		return json(
			{
				success: false,
				error: 'Failed to update team'
			},
			{ status: 500 }
		);
	}
};

// DELETE /api/teams/[teamId] - Remove team by ID
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const teamId = parseInt(params.teamId);

		if (isNaN(teamId)) {
			return json(
				{
					success: false,
					error: 'Invalid team ID'
				},
				{ status: 400 }
			);
		}

		// Check if team exists
		const existingTeam = await teamsRepository.getTeamById(teamId);
		if (!existingTeam) {
			return json(
				{
					success: false,
					error: 'Team not found'
				},
				{ status: 404 }
			);
		}

		// Delete the team
		const deleted = await teamsRepository.deleteTeam(teamId);

		if (!deleted) {
			return json(
				{
					success: false,
					error: 'Failed to delete team'
				},
				{ status: 500 }
			);
		}

		return json({
			success: true,
			message: 'Team deleted successfully'
		});
	} catch (error) {
		console.error('Error deleting team:', error);
		return json(
			{
				success: false,
				error: 'Failed to delete team'
			},
			{ status: 500 }
		);
	}
};
