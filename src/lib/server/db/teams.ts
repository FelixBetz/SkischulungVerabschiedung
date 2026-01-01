import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { teams } from './schema.js';
import type { Team } from '$lib/types.js';

export class TeamsRepository {
	// Get all teams
	async getAllTeams(): Promise<Team[]> {
		return await db.select().from(teams);
	}

	// Get team by ID
	async getTeamById(id: number): Promise<Team | null> {
		const result = await db.select().from(teams).where(eq(teams.id, id));
		return result[0] || null;
	}

	// Get team by name
	async getTeamByName(name: string): Promise<Team | null> {
		const result = await db.select().from(teams).where(eq(teams.name, name));
		return result[0] || null;
	}

	// Create new team
	async createTeam(team: Omit<Team, 'id'>): Promise<Team> {
		const result = await db.insert(teams).values(team).returning();
		return result[0];
	}

	// Update team hearts
	async updateTeamHearts(id: number, hearts: number): Promise<Team | null> {
		await db.update(teams).set({ hearts }).where(eq(teams.id, id));
		return await this.getTeamById(id);
	}

	// Update team
	async updateTeam(id: number, updates: Partial<Omit<Team, 'id'>>): Promise<Team | null> {
		await db.update(teams).set(updates).where(eq(teams.id, id));
		return await this.getTeamById(id);
	}

	// Delete team
	async deleteTeam(id: number): Promise<boolean> {
		const result = await db.delete(teams).where(eq(teams.id, id));
		return result.changes > 0;
	}

	// Update team points
	async updateTeamPoints(id: number, points: number): Promise<Team | null> {
		return await this.updateTeam(id, { points });
	}

	// Add points to team
	async addPointsToTeam(id: number, additionalPoints: number): Promise<Team | null> {
		const team = await this.getTeamById(id);
		if (!team) return null;

		const newPoints = team.points + additionalPoints;
		return await this.updateTeam(id, { points: newPoints });
	}

	// Update team name
	async updateTeamName(id: number, name: string): Promise<Team | null> {
		return await this.updateTeam(id, { name });
	}
}

export const teamsRepository = new TeamsRepository();
