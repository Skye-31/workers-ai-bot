function hex2bin(hex: string) {
	const buf = new Uint8Array(Math.ceil(hex.length / 2));
	for (let i = 0; i < buf.length; i++) {
		buf[i] = parseInt(hex.substr(i * 2, 2), 16);
	}
	return buf;
}

const PUBLIC_KEY = (key: string) =>
	crypto.subtle.importKey(
		'raw',
		hex2bin(key),
		// @ts-expect-error 'public' key not typed
		{ name: 'NODE-ED25519', namedCurve: 'NODE-ED25519', public: true },
		true,
		['verify'],
	);

const encoder = new TextEncoder();

export async function verify(request: Request, key: string) {
	const signature = hex2bin(request.headers.get('X-Signature-Ed25519')!);
	const timestamp = request.headers.get('X-Signature-Timestamp');
	const unknown = await request.clone().text();

	return await crypto.subtle.verify('NODE-ED25519', await PUBLIC_KEY(key), signature, encoder.encode(timestamp + unknown));
}
