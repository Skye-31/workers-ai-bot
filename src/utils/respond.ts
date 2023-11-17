import type { APIInteractionResponse, APIInteractionResponseCallbackData } from 'discord-api-types/v10';

export const respond = (response: APIInteractionResponse) =>
	new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } });

export const respondWithMessage = (data: APIInteractionResponseCallbackData) => respond({ type: 4, data });
