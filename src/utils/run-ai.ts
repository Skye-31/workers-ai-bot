import { Ai } from '@cloudflare/ai';

export default async function runAI(binding: unknown, input: string) {
	const ai = new Ai(binding);

	const inputs = {
		prompt: input.slice(0, 256),
	};

	console.log('RUNNING AI');
	const response = await ai.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', inputs);
	console.log('RAN AI');

	return response;
}
