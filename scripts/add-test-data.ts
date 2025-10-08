import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';
import path from 'path';
import { teams } from '../src/lib/server/db/schema';

// Load environment variables from .env file
function loadEnv() {
	try {
		const envPath = path.resolve('.env');
		if (fs.existsSync(envPath)) {
			const envContent = fs.readFileSync(envPath, 'utf8');
			const lines = envContent.split('\n');

			for (const line of lines) {
				const trimmed = line.trim();
				if (trimmed && !trimmed.startsWith('#')) {
					const [key, ...valueParts] = trimmed.split('=');
					if (key && valueParts.length > 0) {
						const value = valueParts.join('=');
						process.env[key] = value;
					}
				}
			}
		}
	} catch (error) {
		console.warn('Could not load .env file:', error.message);
	}
}

// Load environment variables BEFORE using them
loadEnv();
// Get DATABASE_URL from environment or use default
const DATABASE_URL = process.env.DATABASE_URL || 'sqlite:database.db';
console.log('📁 Using database:', DATABASE_URL);
const dbPath = DATABASE_URL.replace('sqlite:', '');

// Initialize database
const client = new Database(dbPath);
const db = drizzle(client);

// Test teams data
const testTeams = [
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

async function addTestData() {
	try {
		console.log('🗑️  Clearing existing teams...');

		// Clear all existing teams
		const deleteResult = db.delete(teams).run();
		console.log(`✅ Removed ${deleteResult.changes} existing teams`);

		console.log('🌱 Adding test teams...');

		// Add test teams
		for (const team of testTeams) {
			try {
				const result = db.insert(teams).values(team).returning().get();
				console.log(`✅ Added: ${result.name} (ID: ${result.id}, ${result.points} points)`);
			} catch (error) {
				console.error(`❌ Failed to add ${team.name}:`, error.message);
			}
		}

		// Show final result
		const finalTeams = db.select().from(teams).all();

		console.log('\n🎉 Test data added successfully!');
		console.log(`📊 Total teams in database: ${finalTeams.length}`);

		if (finalTeams.length > 0) {
			console.log('\n📋 Teams in database:');
			finalTeams.forEach((team) => {
				console.log(`   ${team.id}. ${team.name} - ${team.points} points`);
			});
		}
	} catch (error) {
		console.error('❌ Failed to add test data:', error);
		process.exit(1);
	} finally {
		client.close();
	}
}

// Run the script
addTestData()
	.then(() => {
		console.log('\n🏁 Test data script completed successfully!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n💥 Test data script failed:', error);
		process.exit(1);
	});
