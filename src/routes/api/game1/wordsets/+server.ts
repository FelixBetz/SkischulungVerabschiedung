import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAvailableWordSets } from '$lib/data/game1-loader';
import { addError } from '$lib/stores/errorStore';

export const GET: RequestHandler = async () => {
	try {
		const wordSets = await getAvailableWordSets();
		return json({
			success: true,
			data: wordSets
		});
	} catch (error) {
		addError('error', 'wordsets-api', 'Failed to get word sets', error);
		return json(
			{
				success: false,
				error: 'Failed to get word sets'
			},
			{ status: 500 }
		);
	}
};
