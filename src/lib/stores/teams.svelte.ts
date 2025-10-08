import type { Team } from '../types.js';

// Utility function to generate unique IDs using UUID
function generateTeamId(): string {
    return crypto.randomUUID();
}

class TeamsStore {
    private _teams = $state<Team[]>([]);

    get teams() {
        return this._teams;
    }

    addTeam(team: Omit<Team, 'id'>) {
        const newTeam: Team = {
            id: generateTeamId(),
            ...team
        };
        this._teams.push(newTeam);
        return newTeam;
    }

    findTeamById(id: string): Team | undefined {
        return this._teams.find((t) => t.id === id);
    }

    findTeamByName(name: string): Team | undefined {
        return this._teams.find((t) => t.name === name);
    }

    updateTeamPoints(teamId: string, points: number) {
        const team = this.findTeamById(teamId);
        if (team) {
            team.points = points;
        }
    }

    updateTeamPointsByName(teamName: string, points: number) {
        const team = this.findTeamByName(teamName);
        if (team) {
            team.points = points;
        }
    }

    removeTeam(teamId: string) {
        this._teams = this._teams.filter((t) => t.id !== teamId);
    }

    removeTeamByName(teamName: string) {
        this._teams = this._teams.filter((t) => t.name !== teamName);
    }

    setTeams(teams: Team[]) {
        this._teams = teams;
    }

    updateTeamName(teamId: string, newName: string) {
        const team = this.findTeamById(teamId);
        if (team) {
            team.name = newName;
        }
    }

    updateTeamNameByOldName(oldName: string, newName: string) {
        const team = this.findTeamByName(oldName);
        if (team) {
            team.name = newName;
        }
    }

    initializeSampleTeams() {
        console.log('Initializing sample teams, current length:', this._teams.length);
        if (this._teams.length === 0) {
            const sampleTeams: Team[] = [
                {
                    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    name: 'Die Schneehelden',
                    points: 150,
                    iconUrl: 'https://api.iconify.design/emojione:snowflake.svg'
                },
                {
                    id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
                    name: 'Pistenraketen',
                    points: 120,
                    iconUrl: 'https://api.iconify.design/emojione:rocket.svg'
                },
                {
                    id: 'c3d4e5f6-g7h8-9012-cdef-123456789012',
                    name: 'Alpen-Asse',
                    points: 180,
                    iconUrl: 'https://api.iconify.design/emojione:mountain.svg'
                },
                {
                    id: 'd4e5f6g7-h8i9-0123-def0-234567890123',
                    name: 'Skihaserl',
                    points: 95,
                    iconUrl: 'https://api.iconify.design/emojione:rabbit-face.svg'
                }
            ];
            this.setTeams(sampleTeams);
            console.log('Sample teams set, new length:', this._teams.length);
        }
    }
}

export const teamsStore = new TeamsStore();

// Initialize sample teams immediately
teamsStore.initializeSampleTeams();
