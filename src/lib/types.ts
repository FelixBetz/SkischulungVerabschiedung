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
