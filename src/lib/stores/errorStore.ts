// Central error collection system for the application
export interface ErrorEntry {
	id: string;
	type: 'error' | 'warning';
	source: string; // Which module/component generated this error
	message: string;
	details?: unknown; // Additional context or error object
	timestamp: Date;
}

// In-memory store for errors and warnings
// In production, you might want to persist these to a database or send to a logging service
let errorStore: ErrorEntry[] = [];
let errorId = 0;

/**
 * Add an error to the central error store
 */
export function addError(
	type: 'error' | 'warning',
	source: string,
	message: string,
	details?: unknown
): string {
	const id = `${type}-${++errorId}-${Date.now()}`;
	const entry: ErrorEntry = {
		id,
		type,
		source,
		message,
		details,
		timestamp: new Date()
	};

	errorStore.push(entry);

	// Keep only the last 100 errors to prevent memory issues
	if (errorStore.length > 100) {
		errorStore = errorStore.slice(-100);
	}

	// Still log to console for development
	if (type === 'error') {
		console.error(`[${source}] ${message}`, details || '');
	} else {
		console.warn(`[${source}] ${message}`, details || '');
	}

	return id;
}

/**
 * Get all errors and warnings
 */
export function getAllErrors(): ErrorEntry[] {
	return [...errorStore]; // Return a copy to prevent external modification
}

/**
 * Get errors filtered by type
 */
export function getErrorsByType(type: 'error' | 'warning'): ErrorEntry[] {
	return errorStore.filter((entry) => entry.type === type);
}

/**
 * Get errors filtered by source
 */
export function getErrorsBySource(source: string): ErrorEntry[] {
	return errorStore.filter((entry) => entry.source === source);
}

/**
 * Clear all errors
 */
export function clearAllErrors(): void {
	errorStore = [];
}

/**
 * Clear errors by type
 */
export function clearErrorsByType(type: 'error' | 'warning'): void {
	errorStore = errorStore.filter((entry) => entry.type !== type);
}

/**
 * Clear errors by source
 */
export function clearErrorsBySource(source: string): void {
	errorStore = errorStore.filter((entry) => entry.source !== source);
}

/**
 * Remove a specific error by ID
 */
export function removeError(id: string): boolean {
	const initialLength = errorStore.length;
	errorStore = errorStore.filter((entry) => entry.id !== id);
	return errorStore.length < initialLength;
}
