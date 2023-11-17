import { CDNRoutes, ImageFormat, RouteBases } from 'discord-api-types/v10';
import type { APIUser, DefaultUserAvatarAssets } from 'discord-api-types/v10';

export default function getUserAvatar(user: APIUser): string {
	if (user.avatar) {
		let imageFormat: ImageFormat = ImageFormat.PNG;
		if (user.avatar.startsWith('a_')) return (imageFormat = ImageFormat.GIF);
		return `${RouteBases.cdn}${CDNRoutes.userAvatar(user.id, user.avatar, imageFormat)}`;
	}
	return `${RouteBases.cdn}${CDNRoutes.defaultUserAvatar(Number((BigInt(user.id) >> 22n) % 6n) as DefaultUserAvatarAssets)}`;
}
