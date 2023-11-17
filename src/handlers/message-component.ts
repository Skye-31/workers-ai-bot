import { ComponentType, InteractionResponseType, MessageFlags, TextInputStyle } from 'discord-api-types/v10';
import { respond, respondWithMessage } from '../utils/respond';
import type { Env } from '..';
import type { APIMessageComponentInteraction } from 'discord-api-types/v10';

export default async function handleMessageCommand(interaction: APIMessageComponentInteraction, _env: Env, _ctx: ExecutionContext) {
	if (interaction.data.component_type !== ComponentType.Button) {
		return respondWithMessage({
			content: 'Unexpected interaction type',
			flags: MessageFlags.Ephemeral,
		});
	}

	if (interaction.data.custom_id !== 'action:retry') {
		return respondWithMessage({
			content: 'Unknown button.',
			flags: MessageFlags.Ephemeral,
		});
	}

	const option = interaction.message.embeds[0]?.description;
	if (!option) {
		return respondWithMessage({
			content: 'No prompt? This is a bug: please report.',
			flags: MessageFlags.Ephemeral,
		});
	}
	const prompt = option.slice(4, option.length - 3);

	return respond({
		type: InteractionResponseType.Modal,
		data: {
			custom_id: 'action:retry',
			title: 'Imagine',
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.TextInput,
							style: TextInputStyle.Paragraph,
							custom_id: 'prompt',
							label: 'Prompt',
							value: prompt,
							max_length: 256,
							min_length: 6,
							required: true,
							placeholder: 'A cat sitting on a fluffy cloud',
						},
					],
				},
			],
		},
	});
}
