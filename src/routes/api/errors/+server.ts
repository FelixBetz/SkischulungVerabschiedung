import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAllErrors,
	getErrorsByType,
	getErrorsBySource,
	clearAllErrors,
	clearErrorsByType,
	clearErrorsBySource,
	removeError,
	type ErrorEntry
} from '$lib/stores/errorStore';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const type = url.searchParams.get('type') as 'error' | 'warning' | null;
		const source = url.searchParams.get('source');

		let errors: ErrorEntry[];

		if (type && source) {
			// Filter by both type and source
			errors = getAllErrors().filter((entry) => entry.type === type && entry.source === source);
		} else if (type) {
			// Filter by type only
			errors = getErrorsByType(type);
		} else if (source) {
			// Filter by source only
			errors = getErrorsBySource(source);
		} else {
			// Get all errors
			errors = getAllErrors();
		}

		return json({
			success: true,
			data: {
				errors,
				count: errors.length,
				totalCount: getAllErrors().length
			}
		});
	} catch (error) {
		console.error('Error retrieving errors from error store:', error);
		return json(
			{
				success: false,
				error: 'Failed to retrieve errors'
			},
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const type = url.searchParams.get('type') as 'error' | 'warning' | null;
		const source = url.searchParams.get('source');
		const id = url.searchParams.get('id');

		if (id) {
			// Remove specific error by ID
			const removed = removeError(id);
			return json({
				success: true,
				data: { removed, message: removed ? 'Error removed' : 'Error not found' }
			});
		} else if (type && source) {
			// This would require a more complex filter, for now just clear by type or source
			clearErrorsByType(type);
			clearErrorsBySource(source);
			return json({
				success: true,
				data: { message: `Cleared errors for type '${type}' and source '${source}'` }
			});
		} else if (type) {
			// Clear by type
			clearErrorsByType(type);
			return json({
				success: true,
				data: { message: `Cleared all ${type}s` }
			});
		} else if (source) {
			// Clear by source
			clearErrorsBySource(source);
			return json({
				success: true,
				data: { message: `Cleared all errors from source '${source}'` }
			});
		} else {
			// Clear all errors
			clearAllErrors();
			return json({
				success: true,
				data: { message: 'Cleared all errors and warnings' }
			});
		}
	} catch (error) {
		console.error('Error clearing errors from error store:', error);
		return json(
			{
				success: false,
				error: 'Failed to clear errors'
			},
			{ status: 500 }
		);
	}
};
