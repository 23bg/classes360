import { jwtAuthService } from "@/modules/auth/infrastructure/jwtAuthService";

export const getSessionUseCase = async () => {
    const accessToken = await jwtAuthService.readAccessTokenFromCookie();
    if (!accessToken) {
        return null;
    }

    return jwtAuthService.verifyAccessToken(accessToken);
};
