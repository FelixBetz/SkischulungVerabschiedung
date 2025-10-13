import generalWords from './wordsets/general.json';
import sportsWords from './wordsets/sports.json';
import natureWords from './wordsets/nature.json';
import foodWords from './wordsets/food.json';

export interface WordSet {
	id: string;
	name: string;
	startingWord: string;
	availableWords: string[];
}

const wordSets: Record<string, WordSet> = {
	general: generalWords as WordSet,
	sports: sportsWords as WordSet,
	nature: natureWords as WordSet,
	food: foodWords as WordSet
};

export function getAvailableWordSets(): WordSet[] {
	return Object.values(wordSets);
}

export function loadWordSet(wordSetId: string): WordSet {
	const wordSet = wordSets[wordSetId];
	if (!wordSet) {
		throw new Error(`Word set '${wordSetId}' not found`);
	}
	return wordSet;
}

export function getInitialGame1State(wordSetId: string = 'general') {
	const wordSet = loadWordSet(wordSetId);
	return {
		gameStarted: false,
		currentRound: 1,
		maxRounds: 5,
		orderedWords: [wordSet.startingWord],
		remainingWords: [...wordSet.availableWords], // Create a copy
		currentTeamIndex: 0,
		selectedWord: '',
		selectedPosition: -1,
		currentWordSet: wordSetId
	};
}
