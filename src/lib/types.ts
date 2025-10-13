export interface Team {
	id: number;
	name: string;
	points: number;
	iconUrl: string;
}

export enum GameState {
	HOME = 'home',
	GAME1 = 'game1',
	GAME2 = 'game2',
	GAME3 = 'game3',
	GAME4 = 'game4',
	GAME5 = 'game5'
}

export enum Game1ActionType {
	START_GAME = 'START_GAME',
	RESET_GAME = 'RESET_GAME',
	INSERT_WORD = 'INSERT_WORD',
	SELECT_WORD = 'SELECT_WORD',
	SELECT_POSITION = 'SELECT_POSITION',
	CHANGE_WORD_SET = 'CHANGE_WORD_SET',
	CLEAR_ERROR = 'CLEAR_ERROR'
}

export interface Game1State {
	gameStarted: boolean;
	orderedWords: string[];
	remainingWords: string[];
	currentTeamIndex: number;
	selectedWord: string;
	selectedPosition: number;
	currentWordSet: string;
	currentWordSetName: string;
	topLabel: string;
	botLabel: string;
	correctOrder: string[];
	lastErrorMessage?: string;
}

export interface Game1Action {
	type: Game1ActionType;
	word?: string;
	position?: number;
	teamCount?: number;
	wordSetId?: string;
}
