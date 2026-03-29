import { jwtAuthService } from "@/modules/auth/infrastructure/jwtAuthService";
import { AccessTokenClaims, RefreshTokenClaims } from "@/modules/auth/domain/types";

export const refreshSessionUseCase = async () => {
    const { authUserRepository } = await import("@/modules/auth/infrastructure/authUserRepository");
    const refreshToken = await jwtAuthService.readRefreshTokenFromCookie();
    if (!refreshToken) {
        return null;
    }

    const refreshClaims = jwtAuthService.verifyRefreshToken(refreshToken);
    if (!refreshClaims) {
        return null;
    }

    const snapshot = await authUserRepository.getSessionSnapshot(refreshClaims.userId);
    if (!snapshot) {
        return null;
    }

    if (snapshot.tokenVersion !== refreshClaims.tokenVersion) {
        return null;
    }

    const access: AccessTokenClaims = {
        userId: snapshot.userId,
        email: snapshot.email,
        role: snapshot.role,
        instituteId: snapshot.instituteId,
        isOnboarded: snapshot.isOnboarded,
        subscriptionStatus: snapshot.subscriptionStatus,
    };

    const refresh: RefreshTokenClaims = {
        userId: snapshot.userId,
        tokenVersion: snapshot.tokenVersion,
    };

    const nextAccess = jwtAuthService.signAccessToken(access);
    const nextRefresh = jwtAuthService.signRefreshToken(refresh);

    await jwtAuthService.setAuthCookies({ accessToken: nextAccess, refreshToken: nextRefresh });

    return {
        ...access,
        tokenVersion: refresh.tokenVersion,
    };
};
