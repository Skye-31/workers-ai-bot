import { InteractionResponseType, InteractionType, MessageFlags } from 'discord-api-types/v10';
import handleApplicationCommand from './handlers/application-command';
import handleMessageCommand from './handlers/message-component';
import handleModalSubmit from './handlers/modal-submit';
import { respond, respondWithMessage } from './utils/respond';
import { verify } from './utils/verify';
import type { APIInteraction } from 'discord-api-types/v10';

export interface Env {
	AI: unknown;
	clientID: string;
	publicKey: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (!URL.canParse(request.url)) {
			return new Response('Bad URL', { status: 400 });
		}
		const url = new URL(request.url);
		if (url.pathname === '/favicon.ico') {
			return new Response(null, { status: 404 });
		}

		if (!request.headers.get('X-Signature-Ed25519') || !request.headers.get('X-Signature-Timestamp'))
			return new Response('Unauthenticated', { status: 401 });
		if (!(await verify(request, env.publicKey))) return new Response('Unauthenticated', { status: 401 });

		const interaction = <APIInteraction>await request.json();

		switch (interaction.type) {
			case InteractionType.Ping:
				return respond({
					type: InteractionResponseType.Pong,
				});

			case InteractionType.ApplicationCommand:
				return await handleApplicationCommand(interaction, env, ctx);

			case InteractionType.MessageComponent: {
				return await handleMessageCommand(interaction, env, ctx);
			}

			case InteractionType.ModalSubmit: {
				return await handleModalSubmit(interaction, env, ctx);
			}

			default:
				return respondWithMessage({
					content: 'Unknown interaction type.',
					flags: MessageFlags.Ephemeral,
				});
		}
	},
};
