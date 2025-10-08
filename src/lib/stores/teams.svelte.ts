import type { Team } from '../types.js';

class TeamsStore {
    private _teams = $state<Team[]>([]);

    get teams() {
        return this._teams;
    }

    addTeam(team: Team) {
        this._teams.push(team);
    }

    updateTeamPoints(teamName: string, points: number) {
        const team = this._teams.find(t => t.name === teamName);
        if (team) {
            team.points = points;
        }
    }

    removeTeam(teamName: string) {
        this._teams = this._teams.filter(t => t.name !== teamName);
    }

    setTeams(teams: Team[]) {
        this._teams = teams;
    }

    initializeSampleTeams() {
        console.log('Initializing sample teams, current length:', this._teams.length);
        if (this._teams.length === 0) {
            const sampleTeams: Team[] = [
                {
                    name: 'Die Schneehelden',
                    points: 150,
                    iconUrl: 'https://api.iconify.design/emojione:snowflake.svg'
                },
                {
                    name: 'Pistenraketen',
                    points: 120,
                    iconUrl: 'https://api.iconify.design/emojione:rocket.svg'
                },
                {
                    name: 'Alpen-Asse',
                    points: 180,
                    iconUrl: 'https://api.iconify.design/emojione:mountain.svg'
                },
                {
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
// Initialize sample teams immediately
teamsStore.initializeSampleTeams();
