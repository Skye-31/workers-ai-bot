export default async function runAI(binding: Ai, input: string) {
	const inputs = {
		prompt: input.slice(0, 256),
	};

	const stream = await binding.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', inputs) as unknown as ReadableStream<Uint8Array>;

	const arrayBuffer = await new Response(stream).arrayBuffer();
    return new Uint8Array(arrayBuffer);
}
