import type { Game1State } from '../types';

// Default fallback word set when no JSON files are available
const defaultWordSet: WordSet = {
	id: 'default',
	name: 'Standard Wörter',
	startingWord: 'Sonne',
	availableWords: [
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
};

// Dynamic import function to automatically load all wordsets
async function importWordSets() {
	const wordSetModules = import.meta.glob('./wordsets/*.json');
	const wordSets: Record<string, WordSet> = {};

	// Check if any JSON files are available
	const moduleKeys = Object.keys(wordSetModules);

	if (moduleKeys.length === 0) {
		console.warn('No word set JSON files found, using default word set');
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
			if (wordSet.name && wordSet.startingWord && Array.isArray(wordSet.availableWords)) {
				wordSets[wordSet.id] = wordSet;
			} else {
				console.warn(`Invalid word set structure in file: ${path}`);
			}
		} catch (error) {
			console.warn(`Failed to load word set from ${path}:`, error);
		}
	}

	// If no valid word sets were loaded, fall back to default
	if (Object.keys(wordSets).length === 0) {
		console.warn('No valid word sets loaded, using default word set');
		wordSets[defaultWordSet.id] = defaultWordSet;
	}

	return wordSets;
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

export async function getAvailableWordSets(): Promise<WordSet[]> {
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
			wordSetId = wordSet.id;
			console.warn(`Word set '${wordSetId}' not found, falling back to '${wordSet.id}'`);
		}
	}

	// If still no word set available, return null
	if (!wordSet) {
		console.error('No word sets available');
		return null;
	}

	return {
		gameStarted: false,
		orderedWords: [wordSet.startingWord],
		remainingWords: [...wordSet.availableWords], // Create a copy
		currentTeamIndex: 0,
		selectedWord: '',
		selectedPosition: -1,
		currentWordSet: wordSetId
	};
}
