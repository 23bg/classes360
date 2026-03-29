import { jwtAuthService } from "@/modules/auth/infrastructure/jwtAuthService";
import { AccessTokenClaims, RefreshTokenClaims } from "@/modules/auth/domain/types";

export type IssueSessionInput = {
    userId: string;
};

export const issueSessionUseCase = async (input: IssueSessionInput) => {
    const { authUserRepository } = await import("@/modules/auth/infrastructure/authUserRepository");
    const snapshot = await authUserRepository.getSessionSnapshot(input.userId);
    if (!snapshot) {
        return null;
    }

    const accessClaims: AccessTokenClaims = {
        userId: snapshot.userId,
        email: snapshot.email,
        role: snapshot.role,
        instituteId: snapshot.instituteId,
        isOnboarded: snapshot.isOnboarded,
        subscriptionStatus: snapshot.subscriptionStatus,
    };

    const refreshClaims: RefreshTokenClaims = {
        userId: snapshot.userId,
        tokenVersion: snapshot.tokenVersion,
    };

    const accessToken = jwtAuthService.signAccessToken(accessClaims);
    const refreshToken = jwtAuthService.signRefreshToken(refreshClaims);

    await jwtAuthService.setAuthCookies({ accessToken, refreshToken });

    return {
        access: accessClaims,
        refresh: refreshClaims,
    };
};
