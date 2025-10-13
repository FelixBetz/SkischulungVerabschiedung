import type { Game1State } from '../types';
import { addError } from '../stores/errorStore';

// Default fallback word set when no JSON files are available
const defaultWordSet: WordSet = {
	id: 'default',
	name: 'Standard Wörter',
	startingWord: 'Sonne',
	availableWords: [
		'Sonne',
		'Apfel',
		'Baum',
		'Computer',
		'Freude',
		'Garten',
		'Haus',
		'Katze',
		'Musik',
		'Träume'
	]
}; // Dynamic import function to automatically load all wordsets
async function importWordSets() {
	const wordSetModules = import.meta.glob('./wordsets/*.json');
	const wordSets: Record<string, WordSet> = {};

	// Check if any JSON files are available
	const moduleKeys = Object.keys(wordSetModules);

	if (moduleKeys.length === 0) {
		addError('warning', 'game1-loader', 'No word set JSON files found, using default word set');
		wordSets[defaultWordSet.id] = defaultWordSet;
		return wordSets;
	}

	for (const path in wordSetModules) {
		try {
			const module = (await wordSetModules[path]()) as { default: Omit<WordSet, 'id'> };
			const rawWordSet = module.default;

			// Generate ID from filename (remove path and .json extension)
			const filename = path.split('/').pop()?.replace('.json', '') || 'unknown';

			// Create complete WordSet with generated ID
			const wordSet: WordSet = {
				id: filename,
				...rawWordSet
			};

			// Validate the word set structure
			if (
				wordSet.name &&
				wordSet.startingWord &&
				Array.isArray(wordSet.availableWords) &&
				wordSet.availableWords.includes(wordSet.startingWord)
			) {
				wordSets[wordSet.id] = wordSet;
			} else {
				if (!wordSet.name) {
					addError(
						'warning',
						'game1-loader',
						`Invalid word set in file ${path}: Missing 'name' field`
					);
				} else if (!wordSet.startingWord) {
					addError(
						'warning',
						'game1-loader',
						`Invalid word set in file ${path}: Missing 'startingWord' field`
					);
				} else if (!Array.isArray(wordSet.availableWords)) {
					addError(
						'warning',
						'game1-loader',
						`Invalid word set in file ${path}: 'availableWords' must be an array`
					);
				} else if (!wordSet.availableWords.includes(wordSet.startingWord)) {
					addError(
						'warning',
						'game1-loader',
						`Invalid word set in file ${path}: Starting word '${wordSet.startingWord}' is not included in availableWords array`
					);
				} else {
					addError('warning', 'game1-loader', `Invalid word set structure in file: ${path}`);
				}
			}
		} catch (error) {
			addError('warning', 'game1-loader', `Failed to load word set from ${path}`, error);
		}
	}

	// If no valid word sets were loaded, fall back to default
	if (Object.keys(wordSets).length === 0) {
		addError('warning', 'game1-loader', 'No valid word sets loaded, using default word set');
		wordSets[defaultWordSet.id] = defaultWordSet;
	}

	return wordSets;
}

// Function to validate word placement
export function validateWordPlacement(
	word: string,
	position: number,
	currentSequence: string[],
	correctOrder: string[]
): { isValid: boolean; errorMessage?: string } {
	// Check if the word exists in the correct order
	const correctPositionOfWord = correctOrder.indexOf(word);

	if (correctPositionOfWord === -1) {
		return {
			isValid: false,
			errorMessage: `"${word}" ist nicht in der Liste der verfügbaren Wörter.`
		};
	}

	// Create the sequence that would result from placing the word
	const newSequence = [...currentSequence];
	newSequence.splice(position, 0, word);

	// Check if any word in the new sequence is out of order relative to others
	for (let i = 0; i < newSequence.length; i++) {
		const currentWord = newSequence[i];
		const currentWordCorrectPos = correctOrder.indexOf(currentWord);

		// Check all words that come after this position
		for (let j = i + 1; j < newSequence.length; j++) {
			const laterWord = newSequence[j];
			const laterWordCorrectPos = correctOrder.indexOf(laterWord);

			// If a word that comes later in our sequence should actually come earlier
			if (laterWordCorrectPos < currentWordCorrectPos) {
				return {
					isValid: false,
					errorMessage: `"${word}" kann nicht an Position ${position + 1} platziert werden, da es nach "${laterWord}" kommen müsste.`
				};
			}
		}
	}

	return { isValid: true };
}

export interface WordSet {
	id: string;
	name: string;
	startingWord: string;
	availableWords: string[];
}

// Cache for loaded word sets
let cachedWordSets: Record<string, WordSet> | null = null;

async function getWordSets(): Promise<Record<string, WordSet>> {
	if (!cachedWordSets) {
		cachedWordSets = await importWordSets();
	}
	return cachedWordSets;
}

/**
 * Clear the word sets cache to force reload on next access
 */
export function clearWordSetsCache(): void {
	cachedWordSets = null;
}

export async function getAvailableWordSets(): Promise<WordSet[]> {
	// Always reload word sets when explicitly requested
	cachedWordSets = null;
	const wordSets = await getWordSets();
	return Object.values(wordSets);
}

export async function loadWordSet(wordSetId: string): Promise<WordSet | null> {
	const wordSets = await getWordSets();
	return wordSets[wordSetId] || null;
}

export async function getInitialGame1State(wordSetId: string): Promise<Game1State | null> {
	let wordSet = await loadWordSet(wordSetId);

	// If requested word set doesn't exist, try to get the first available one
	if (!wordSet) {
		const availableWordSets = await getAvailableWordSets();
		if (availableWordSets.length > 0) {
			wordSet = availableWordSets[0];
			const originalWordSetId = wordSetId;
			wordSetId = wordSet.id;
			addError(
				'warning',
				'game1-loader',
				`Word set '${originalWordSetId}' not found, falling back to '${wordSet.id}'`
			);
		}
	}

	// If still no word set available, return null
	if (!wordSet) {
		addError('error', 'game1-loader', 'No word sets available');
		return null;
	}

	// The correct order is now just the availableWords array (which includes the starting word)
	const correctOrder = [...wordSet.availableWords];

	// Remove the starting word from remaining words since it's already placed
	const remainingWords = wordSet.availableWords.filter((word) => word !== wordSet.startingWord);

	return {
		gameStarted: false,
		orderedWords: [wordSet.startingWord],
		remainingWords,
		currentTeamIndex: 0,
		selectedWord: '',
		selectedPosition: -1,
		currentWordSet: wordSetId,
		correctOrder
	};
}
