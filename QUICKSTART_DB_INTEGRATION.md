# Quick Start - Database Integration

**Time needed:** 30-60 minutes

This guide shows you exactly where to add database integration to make the refactor fully functional.

---

## 1. Prisma Schema Update (5 min)

**File:** `src/prisma/schema.prisma`

Add `tokenVersion` to both `User` and `Student` models:

```diff
model User {
    id              String    @id @default(cuid())
    email           String    @unique
    // ... existing fields ...
+   tokenVersion    Int       @default(0)
    createdAt       DateTime  @default(now())
}

model Student {
    id              String    @id @default(cuid())
    email           String
    instituteId     String
    // ... existing fields ...
+   tokenVersion    Int       @default(0)
    createdAt       DateTime  @default(now())
}
```

Run migration:
```bash
npx prisma migrate dev --name add_token_version
```

---

## 2. Update Login Endpoint (10 min)

**File:** `src/app/api/v1/auth/verify-otp/route.ts` (or your login endpoint)

Replace:
```typescript
// OLD
const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    instituteId: user.instituteId,
    isOnboarded: user.institute.isOnboarded,
    subscriptionStatus: user.institute.subscriptionStatus,
});

await setSessionCookie(token);
```

With:
```typescript
// NEW - Import at top
import {
    createAccessToken,
    createRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from "@/lib/auth/tokens";

// In the endpoint
const accessToken = createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    instituteId: user.instituteId,
    isOnboarded: user.institute.isOnboarded,
    subscriptionStatus: user.institute.subscriptionStatus,
});

const refreshToken = createRefreshToken({
    userId: user.id,
    tokenVersion: user.tokenVersion,
});

await setAccessTokenCookie(accessToken);
await setRefreshTokenCookie(refreshToken);
```

---

## 3. Enable Token Refresh (10 min)

**File:** `src/app/api/v1/auth/refresh/route.ts`

Replace the TODO section with:

```typescript
import { NextRequest, NextResponse } from "next/server";
import {
    readRefreshTokenFromCookie,
    createAccessToken,
    setAccessTokenCookie,
    verifyRefreshToken,
} from "@/lib/auth/tokens";
// TODO: Import your database/ORM
// import { db } from "@/lib/db"; // or prisma client
import { createRouteLogger } from "@/lib/api/route-logger";

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/auth/refresh#POST");
    try {
        // 1. Read refresh token from cookie
        const refreshTokenCookie = req.cookies.get("refresh_token")?.value;
        if (!refreshTokenCookie) {
            return NextResponse.json({ error: "No refresh token" }, { status: 401 });
        }

        // 2. Verify it's valid
        const refreshPayload = verifyRefreshToken(refreshTokenCookie);
        if (!refreshPayload) {
            routeLog.warn("invalid_refresh_token");
            return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
        }

        // 3. Check tokenVersion hasn't changed (revocation check)
        const user = await db.user.findUnique({
            where: { id: refreshPayload.userId },
            include: { institute: true },
        });

        if (!user) {
            routeLog.warn("user_not_found", { userId: refreshPayload.userId });
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        if (user.tokenVersion !== refreshPayload.tokenVersion) {
            routeLog.warn("token_revoked", { userId: user.id });
            return NextResponse.json({ error: "Token revoked" }, { status: 401 });
        }

        // 4. Create new access token
        const newAccessToken = createAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            instituteId: user.instituteId,
            isOnboarded: user.institute.isOnboarded,
            subscriptionStatus: user.institute.subscriptionStatus,
        });

        // 5. Set new access token cookie
        await setAccessTokenCookie(newAccessToken);

        routeLog.info("token_refreshed", { userId: user.id });
        return NextResponse.json({ success: true });
    } catch (error) {
        routeLog.error("refresh_error", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
```

**Replace `db` with your database client:** Prisma, Drizzle, etc.

---

## 4. Enable Logout Revocation (5 min)

**File:** `src/app/api/v1/auth/logout/route.ts`

Uncomment and implement the tokenVersion increment:

```typescript
if (session) {
    await db.user.update({
        where: { id: session.userId },
        data: { tokenVersion: { increment: 1 } },
    });
}
```

---

## 5. Student Login Integration (15 min)

**File:** `src/app/api/v1/student/login/route.ts`

Replace the TODO section with:

```typescript
import { NextResponse } from "next/server";
import {
    setStudentAccessTokenCookie,
    setStudentRefreshTokenCookie,
    createStudentAccessToken,
    createStudentRefreshToken,
} from "@/lib/auth/student-tokens";
// TODO: Import your database
// import { db } from "@/lib/db";
import { createRouteLogger } from "@/lib/api/route-logger";

export async function POST(req: Request) {
    const routeLog = createRouteLogger("/api/v1/student/login#POST");
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
        }

        routeLog.info("student_login_attempt", { email });

        // 1. Find student by email
        const student = await db.student.findUnique({
            where: { email },
        });

        // 2. Verify OTP
        if (!student || student.otpCode !== code || new Date() > student.otpExpiry) {
            routeLog.warn("invalid_otp", { email });
            return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
        }

        // 3. Create tokens
        const accessToken = createStudentAccessToken({
            studentId: student.id,
            instituteId: student.instituteId,
            name: student.name,
        });

        const refreshToken = createStudentRefreshToken({
            studentId: student.id,
            tokenVersion: student.tokenVersion,
        });

        // 4. Set cookies
        await setStudentAccessTokenCookie(accessToken);
        await setStudentRefreshTokenCookie(refreshToken);

        // 5. Clear OTP
        await db.student.update({
            where: { id: student.id },
            data: {
                otpCode: null,
                otpExpiry: null,
            },
        });

        routeLog.info("student_login_succeeded", { studentId: student.id });
        return NextResponse.json({ success: true });
    } catch (error) {
        routeLog.error("student_login_error", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
```

---

## 6. Student Logout Revocation (5 min)

**File:** `src/app/api/v1/student/logout/route.ts`

Uncomment the revocation:

```typescript
if (session) {
    await db.student.update({
        where: { id: session.studentId },
        data: { tokenVersion: { increment: 1 } },
    });
}
```

---

## 7. Test It All (10 min)

### Test 1: Login creates both tokens
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456"}' \
  -v 2>&1 | grep "Set-Cookie"
```

You should see:
```
Set-Cookie: access_token=...
Set-Cookie: refresh_token=...
```

### Test 2: Protected route with token works
```bash
curl -i -H "Cookie: access_token=<your_token>" \
  http://localhost:3000/overview
```

Should return 200 (not redirect to login)

### Test 3: Refresh endpoint works
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Cookie: refresh_token=<your_token>" \
  -v 2>&1 | grep "Set-Cookie"
```

Should see new `access_token` being set

### Test 4: Logout clears tokens
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Cookie: access_token=<your_token>" \
  -v 2>&1 | grep "Set-Cookie"
```

Should see cookies deleted (empty value)

---

## 🎯 Done!

You've successfully completed the refactor. Your system now has:

✅ Instant root page rendering  
✅ Minimal middleware (50 lines)  
✅ Secure token system with refresh  
✅ Student/admin auth separation  
✅ Token revocation support  
✅ SEO-safe routing  

**Next:** Run the full test suite and load tests to verify performance gains.

---

## 🚨 If Something Breaks

### "Token not being set"
Check that your login endpoint is calling the new functions, not old `setSessionCookie()`

### "Middleware returning 401 on valid token"
Check that the token is actually being sent in the cookie header. Use DevTools Network tab to verify.

### "Old code still using session_token"
Search for `readSessionFromCookie()` calls - they still work! But update login endpoints to use new tokens.

### "Student and admin getting mixed auth"
Verify you're using the right token functions:
- Admin: `createAccessToken`, `setAccessTokenCookie`
- Student: `createStudentAccessToken`, `setStudentAccessTokenCookie`
