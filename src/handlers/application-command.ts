import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	RouteBases,
	Routes,
} from 'discord-api-types/v10';
import { respond, respondWithMessage } from '../utils/respond';
import runAI from '../utils/run-ai';
import type { Env } from '..';
import type {
	APIApplicationCommandInteraction,
	APIApplicationCommandInteractionDataStringOption,
	RESTPostAPIWebhookWithTokenJSONBody,
} from 'discord-api-types/v10';

export default async function handleApplicationCommand(interaction: APIApplicationCommandInteraction, env: Env, ctx: ExecutionContext) {
	if (interaction.data.type !== ApplicationCommandType.ChatInput) {
		return respondWithMessage({
			content: 'Unexpected interaction type',
		});
	}

	const option = interaction.data.options?.find((x) => x.name === 'prompt' && x.type === ApplicationCommandOptionType.String) as
		| APIApplicationCommandInteractionDataStringOption
		| undefined;

	if (!option) {
		return respondWithMessage({
			content: 'No prompt?',
			flags: MessageFlags.Ephemeral,
		});
	}

	ctx.waitUntil(
		(async () => {
			const start = Date.now();
			const response = await runAI(env.AI, option.value);
			const time = Date.now() - start;

			const formData = new FormData();
			const blob = new File([response], 'result.png', {
				type: 'image/png',
			});
			formData.append('files[0]', blob);
			formData.append(
				'payload_json',
				JSON.stringify({
					embeds: [
						{
							title: 'Result for your prompt',
							description: `\`\`\`\n${option.value.slice(0, 256)}\`\`\``,
							image: {
								url: 'attachment://result.png',
							},
							footer: {
								text: `Took ${Math.round(time / 100) / 10}s`,
							},
						},
					],
					attachments: [
						{
							id: 0,
							description: option.value?.slice(0, 256),
							filename: 'result.png',
						},
					],
					components: [
						{
							type: ComponentType.ActionRow,
							components: [
								{
									custom_id: 'action:retry',
									emoji: {
										name: '🔀',
									},
									label: 'Remix',
									style: ButtonStyle.Secondary,
									type: ComponentType.Button,
								},
							],
						},
					],
				} as RESTPostAPIWebhookWithTokenJSONBody),
			);

			console.log('RETURNING RESPONSE', {
				blobSize: blob.size,
				blobType: blob.type,
				byteLen: response.byteLength,
				// @ts-expect-error not typed
				className: response?.__proto__?.constructor?.toString?.(),
			});
			const res = await fetch(`${RouteBases.api}${Routes.webhookMessage(env.clientID, interaction.token, '@original')}`, {
				method: 'PATCH',
				body: formData,
			});
			console.log(`RESPONSE STATUS: ${res.status}`);

			if (!res.ok) {
				const text = await res.text().catch(() => 'failed to get status text');
				throw new Error(text);
			}
		})(),
	);

	return respond({
		type: InteractionResponseType.DeferredChannelMessageWithSource,
	});
}
