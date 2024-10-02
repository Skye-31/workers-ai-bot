import { ButtonStyle, ComponentType, InteractionResponseType, MessageFlags, RouteBases, Routes } from 'discord-api-types/v10';
import getUserAvatar from '../utils/get-user-avatar';
import { respond, respondWithMessage } from '../utils/respond';
import runAI from '../utils/run-ai';
import type { Env } from '..';
import type { APIModalSubmitInteraction, APIUser, RESTPostAPIWebhookWithTokenJSONBody } from 'discord-api-types/v10';

export default async function handleModalSubmit(interaction: APIModalSubmitInteraction, env: Env, ctx: ExecutionContext) {
	if (interaction.data.custom_id !== 'action:retry') {
		return respondWithMessage({
			content: 'Unknown modal interaction.',
			flags: MessageFlags.Ephemeral,
		});
	}

	const prompt: string = interaction.data.components[0].components[0].value;
	if (!prompt) {
		return respondWithMessage({
			content: 'No prompt?',
			flags: MessageFlags.Ephemeral,
		});
	}

	ctx.waitUntil(
		(async () => {
			const start = Date.now();
			const response = await runAI(env.AI, prompt);
			const time = Date.now() - start;

			const formData = new FormData();
			const blob = new File([response], 'result.png', {
				type: 'image/png',
			});
			formData.append('files[0]', blob);
			const user = (interaction.member ?? interaction).user as APIUser;
			formData.append(
				'payload_json',
				JSON.stringify({
					embeds: [
						{
							title: `Result for your prompt`,
							author: {
								name: user.global_name,
								icon_url: getUserAvatar(user),
							},
							description: `\`\`\`\n${prompt}\`\`\``,
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
							description: prompt,
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
