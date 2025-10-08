import { json } from '@sveltejs/kit';
import { teamsStore } from '$lib/stores/teams.svelte.js';
import type { RequestHandler } from './$types.js';

// GET /api/teams/[teamId] - Get specific team by ID
export const GET: RequestHandler = async ({ params }) => {
    const team = teamsStore.findTeamById(params.teamId);

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
};

// PATCH /api/teams/[teamId] - Update team points or name by ID
export const PATCH: RequestHandler = async ({ params, request }) => {
    try {
        const body = await request.json();
        const { points, name } = body;
        const teamId = params.teamId;

        const team = teamsStore.findTeamById(teamId);
        if (!team) {
            return json(
                {
                    success: false,
                    error: 'Team not found'
                },
                { status: 404 }
            );
        }

        // Update points
        if (typeof points === 'number') {
            teamsStore.updateTeamPoints(teamId, points);
        }

        // Update name
        if (name && name !== team.name) {
            teamsStore.updateTeamName(teamId, name);
        }

        const updatedTeam = teamsStore.findTeamById(teamId);

        return json({
            success: true,
            data: updatedTeam
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

// DELETE /api/teams/[teamId] - Remove team by ID
export const DELETE: RequestHandler = async ({ params }) => {
    const teamId = params.teamId;
    const team = teamsStore.findTeamById(teamId);

    if (!team) {
        return json(
            {
                success: false,
                error: 'Team not found'
            },
            { status: 404 }
        );
    }

    teamsStore.removeTeam(teamId);

    return json({
        success: true,
        message: 'Team deleted successfully'
    });
};