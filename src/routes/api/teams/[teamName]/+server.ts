import { json } from '@sveltejs/kit';
import { teamsStore } from '$lib/stores/teams.svelte.js';
import type { RequestHandler } from './$types.js';

// GET /api/teams/[teamName] - Get specific team
export const GET: RequestHandler = async ({ params }) => {
    const team = teamsStore.teams.find((t) => t.name === params.teamName);

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

// PATCH /api/teams/[teamName] - Update team points or name
export const PATCH: RequestHandler = async ({ params, request }) => {
    try {
        const body = await request.json();
        const { points, name } = body;
        const teamName = params.teamName;

        const team = teamsStore.teams.find((t) => t.name === teamName);
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
            teamsStore.updateTeamPoints(teamName, points);
        }

        // Update name
        if (name && name !== teamName) {
            teamsStore.updateTeamName(teamName, name);
        }

        const updatedTeam = teamsStore.teams.find((t) => t.name === (name || teamName));

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

// DELETE /api/teams/[teamName] - Remove team
export const DELETE: RequestHandler = async ({ params }) => {
    const teamName = params.teamName;
    const team = teamsStore.teams.find((t) => t.name === teamName);

    if (!team) {
        return json(
            {
                success: false,
                error: 'Team not found'
            },
            { status: 404 }
        );
    }

    teamsStore.removeTeam(teamName);

    return json({
        success: true,
        message: 'Team deleted successfully'
    });
};
