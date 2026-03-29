import { jwtAuthService } from "@/modules/auth/infrastructure/jwtAuthService";

export const logoutUseCase = async () => {
    const accessToken = await jwtAuthService.readAccessTokenFromCookie();
    const access = accessToken ? jwtAuthService.verifyAccessToken(accessToken) : null;
    const refreshToken = await jwtAuthService.readRefreshTokenFromCookie();
    const refresh = refreshToken ? jwtAuthService.verifyRefreshToken(refreshToken) : null;

    await jwtAuthService.clearAuthCookies();

    const userId = access?.userId ?? refresh?.userId ?? null;

    if (userId) {
        const { authUserRepository } = await import("@/modules/auth/infrastructure/authUserRepository");
        await authUserRepository.incrementTokenVersion(userId);
    }

    return { userId };
};
