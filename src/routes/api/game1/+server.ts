import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Game1State, Game1Action } from '$lib/types';
import { Game1ActionType } from '$lib/types';
import { getInitialGame1State, validateWordPlacement } from '$lib/data/game1-loader';
import { addError } from '$lib/stores/errorStore';

// In-memory storage for Game 1 state
// In a production app, this would be stored in a database
let game1State: Game1State | null = null;
let isInitializing = false;

async function ensureGameStateInitialized(): Promise<Game1State> {
	if (game1State) {
		return game1State;
	}

	if (isInitializing) {
		// Wait for initialization to complete
		while (isInitializing) {
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
		if (game1State) {
			return game1State;
		}
	}

	isInitializing = true;
	try {
		// Try to initialize with 'general' word set, fall back to any available set
		game1State = await getInitialGame1State('general');

		// If that fails, try 'default' (our fallback)
		if (!game1State) {
			game1State = await getInitialGame1State('default');
		}

		if (!game1State) {
			const errorMsg = 'Failed to initialize game state - no word sets available';
			addError('error', 'game1-api', errorMsg);
			throw new Error(errorMsg);
		}
		return game1State;
	} finally {
		isInitializing = false;
	}
}

export const GET: RequestHandler = async () => {
	try {
		const state = await ensureGameStateInitialized();
		return json({
			success: true,
			data: state
		});
	} catch (error) {
		addError('error', 'game1-api', 'Failed to get game state', error);
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
		const state = await ensureGameStateInitialized();
		const updates: Partial<Game1State> = await request.json();

		// Update the game state with provided fields
		if (typeof updates.gameStarted !== 'undefined') {
			state.gameStarted = updates.gameStarted;
		}

		if (Array.isArray(updates.orderedWords)) {
			state.orderedWords = updates.orderedWords;
		}

		if (Array.isArray(updates.remainingWords)) {
			state.remainingWords = updates.remainingWords;
		}

		if (typeof updates.currentTeamIndex !== 'undefined') {
			state.currentTeamIndex = updates.currentTeamIndex;
		}

		if (typeof updates.selectedWord !== 'undefined') {
			state.selectedWord = updates.selectedWord;
		}

		if (typeof updates.selectedPosition !== 'undefined') {
			state.selectedPosition = updates.selectedPosition;
		}

		return json({
			success: true,
			data: state
		});
	} catch (error) {
		addError('error', 'game1-api', 'Failed to update game state', error);
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
		let state = await ensureGameStateInitialized();
		const action: Game1Action = await request.json();

		switch (action.type) {
			case Game1ActionType.CHANGE_TEAM:
				if (typeof action.teamIndex === 'number') {
					state.currentTeamIndex = action.teamIndex;
				}
				break;
			case Game1ActionType.START_GAME:
				state.gameStarted = true;
				break;

			case Game1ActionType.RESET_GAME:
				{
					const resetState = await getInitialGame1State(state.currentWordSet);
					if (resetState) {
						game1State = resetState;
						state = resetState;
					}
				}
				break;
			case Game1ActionType.INSERT_WORD:
				if (action.word && typeof action.position === 'number') {
					// Validate word placement
					const validation = validateWordPlacement(
						action.word,
						action.position,
						state.orderedWords,
						state.correctOrder
					);

					if (!validation.isValid) {
						// Set error message and don't place the word
						state.lastErrorMessage = validation.errorMessage;
						break;
					}

					// Clear any previous error
					state.lastErrorMessage = undefined;

					// Insert word at position
					const newSequence = [...state.orderedWords];
					newSequence.splice(action.position, 0, action.word);
					state.orderedWords = newSequence;

					// Remove word from available words
					state.remainingWords = state.remainingWords.filter((w) => w !== action.word);

					// Reset selection
					state.selectedWord = '';
					state.selectedPosition = -1;

					// Next team's turn (if teams count provided)
					if (typeof action.teamCount === 'number' && action.teamCount > 0) {
						state.currentTeamIndex = (state.currentTeamIndex + 1) % action.teamCount;
					}
				}
				break;

			case Game1ActionType.SELECT_WORD:
				state.selectedWord = action.word || '';
				break;

			case Game1ActionType.SELECT_POSITION:
				state.selectedPosition = typeof action.position === 'number' ? action.position : -1;
				break;

			case Game1ActionType.CHANGE_WORD_SET:
				if (action.wordSetId) {
					const newState = await getInitialGame1State(action.wordSetId);
					if (newState) {
						game1State = newState;
						state = newState;
					}
				}
				break;

			case Game1ActionType.CLEAR_ERROR:
				state.lastErrorMessage = undefined;
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
			data: state
		});
	} catch (error) {
		addError('error', 'game1-api', 'Failed to process action', error);
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
		const newState = await getInitialGame1State('general');
		if (newState) {
			game1State = newState;
		}

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
