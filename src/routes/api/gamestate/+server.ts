import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GameState } from '$lib/types.js';

// In-memory storage for game state (could be moved to database later)
let currentGameState: GameState = GameState.HOME;

export const GET: RequestHandler = async () => {
	try {
		return json({
			success: true,
			data: {
				currentState: currentGameState
			}
		});
	} catch (error) {
		console.error('Error getting game state:', error);
		return json(
			{
				success: false,
				error: 'Failed to get game state'
			},
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { state } = body;

		// Validate the state
		const validStates = Object.values(GameState);
		if (!validStates.includes(state)) {
			return json(
				{
					success: false,
					error: `Invalid game state. Must be one of: ${validStates.join(', ')}`
				},
				{ status: 400 }
			);
		}

		currentGameState = state;

		return json({
			success: true,
			data: {
				currentState: currentGameState
			}
		});
	} catch (error) {
		console.error('Error updating game state:', error);
		return json(
			{
				success: false,
				error: 'Failed to update game state'
			},
			{ status: 500 }
		);
	}
};
