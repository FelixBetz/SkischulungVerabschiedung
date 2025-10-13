import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Game1State, Game1Action } from '$lib/types';
import { Game1ActionType } from '$lib/types';
import { getInitialGame1State } from '$lib/data/game1-loader';

// In-memory storage for Game 1 state
// In a production app, this would be stored in a database
let game1State: Game1State = getInitialGame1State();

export const GET: RequestHandler = async () => {
	try {
		return json({
			success: true,
			data: game1State
		});
	} catch (error) {
		console.error('Error getting Game 1 state:', error);
		return json(
			{
				success: false,
				error: 'Failed to get game state'
			},
			{ status: 500 }
		);
	}
};

export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const updates: Partial<Game1State> = await request.json();

		// Update the game state with provided fields
		if (typeof updates.gameStarted !== 'undefined') {
			game1State.gameStarted = updates.gameStarted;
		}

		if (Array.isArray(updates.orderedWords)) {
			game1State.orderedWords = updates.orderedWords;
		}

		if (Array.isArray(updates.remainingWords)) {
			game1State.remainingWords = updates.remainingWords;
		}

		if (typeof updates.currentTeamIndex !== 'undefined') {
			game1State.currentTeamIndex = updates.currentTeamIndex;
		}

		if (typeof updates.selectedWord !== 'undefined') {
			game1State.selectedWord = updates.selectedWord;
		}

		if (typeof updates.selectedPosition !== 'undefined') {
			game1State.selectedPosition = updates.selectedPosition;
		}

		return json({
			success: true,
			data: game1State
		});
	} catch (error) {
		console.error('Error updating Game 1 state:', error);
		return json(
			{
				success: false,
				error: 'Failed to update game state'
			},
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const action: Game1Action = await request.json();

		switch (action.type) {
			case Game1ActionType.START_GAME:
				game1State.gameStarted = true;
				break;

			case Game1ActionType.RESET_GAME:
				game1State = getInitialGame1State(game1State.currentWordSet);
				break;
			case Game1ActionType.INSERT_WORD:
				if (action.word && typeof action.position === 'number') {
					// Insert word at position
					const newSequence = [...game1State.orderedWords];
					newSequence.splice(action.position, 0, action.word);
					game1State.orderedWords = newSequence;

					// Remove word from available words
					game1State.remainingWords = game1State.remainingWords.filter((w) => w !== action.word);

					// Reset selection
					game1State.selectedWord = '';
					game1State.selectedPosition = -1;

					// Next team's turn (if teams count provided)
					if (typeof action.teamCount === 'number' && action.teamCount > 0) {
						game1State.currentTeamIndex = (game1State.currentTeamIndex + 1) % action.teamCount;
					}
				}
				break;

			case Game1ActionType.SELECT_WORD:
				game1State.selectedWord = action.word || '';
				break;

			case Game1ActionType.SELECT_POSITION:
				game1State.selectedPosition = typeof action.position === 'number' ? action.position : -1;
				break;

			case Game1ActionType.CHANGE_WORD_SET:
				if (action.wordSetId) {
					game1State = getInitialGame1State(action.wordSetId);
				}
				break;

			default:
				return json(
					{
						success: false,
						error: 'Unknown action type'
					},
					{ status: 400 }
				);
		}

		return json({
			success: true,
			data: game1State
		});
	} catch (error) {
		console.error('Error processing Game 1 action:', error);
		return json(
			{
				success: false,
				error: 'Failed to process action'
			},
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async () => {
	try {
		// Reset to initial state
		game1State = getInitialGame1State();

		return json({
			success: true,
			data: game1State
		});
	} catch (error) {
		console.error('Error resetting Game 1 state:', error);
		return json(
			{
				success: false,
				error: 'Failed to reset game state'
			},
			{ status: 500 }
		);
	}
};
