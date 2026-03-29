# Migration Checklist

Use this checklist to track your progress through the refactor. Print it or copy it to your project management tool.

---

## Phase 0: Pre-Implementation ✅

- [x] Read architecture review
- [x] Reviewed refactor plan
- [x] Understood token system
- [x] Identified database model changes needed

---

## Phase 1: Root UX Fix ✅

- [x] Updated `src/app/page.tsx` with surface-aware routing
- [x] Verified no middleware rewrites on root
- [x] Tested root page behavior:
  - [ ] Guest user → landing page
  - [ ] Logged-in user → dashboard
  - [ ] Not-onboarded user → onboarding
  - [ ] Student surface → student portal
- [x] Removed middleware `rewrite()` calls for root paths

---

## Phase 2: Middleware Simplification ✅

- [x] Replaced `src/proxy.ts` with new simplified version
- [x] Created explicit `matcher` config (only protected routes)
- [x] Removed tenancy routing from middleware
- [x] Removed database calls from middleware
- [x] Middleware now only does JWT validation
- [ ] Deployed and tested:
  - [ ] Middleware latency < 10ms
  - [ ] Static assets bypass middleware
  - [ ] Protected routes still guarded
  - [ ] Unauth users redirected to login
  - [ ] Auth users can access dashboard

---

## Phase 3: Secure Token System ✅

- [x] Created `src/lib/auth/tokens.ts`
  - [x] Access token (15 min)
  - [x] Refresh token (7 days)
  - [x] Cookie setters
  - [x] Token verification functions
- [x] Created `src/lib/auth/student-tokens.ts`
  - [x] Student access token
  - [x] Student refresh token
  - [x] Separate cookie handlers
- [x] Updated `src/lib/auth/auth.ts` for backward compatibility
- [ ] Database integration:
  - [ ] Added `tokenVersion` field to `User` model
  - [ ] Added `tokenVersion` field to `Student` model
  - [ ] Ran Prisma migration
- [ ] Updated login endpoints:
  - [ ] `src/app/api/v1/auth/verify-otp/route.ts` (or equiv)
  - [ ] Now issues both `access_token` and `refresh_token`
  - [ ] Verifies test: new tokens are set

---

## Phase 4: Refresh Token Flow ✅

- [x] Created `src/app/api/v1/auth/refresh/route.ts`
- [ ] Database integration:
  - [ ] Fetch user on token refresh
  - [ ] Check `tokenVersion` for revocation
  - [ ] Create new access token
  - [ ] Test: refresh endpoint returns new token
- [ ] Client-side setup (optional):
  - [ ] Added `src/hooks/useAuthRefresh.ts`
  - [ ] Integrated into root layout/app component
  - [ ] Test: tokens auto-refresh every 10 min

---

## Phase 5: Student Auth Separation ✅

- [x] Created student token system
- [x] Created `src/app/api/v1/student/login/route.ts`
- [x] Created `src/app/api/v1/student/logout/route.ts`
- [x] Created `src/components/student/ProtectedStudentRoute.tsx`
- [ ] Database integration:
  - [ ] Implement student OTP verification
  - [ ] Student login creates separate tokens
  - [ ] Test: student tokens are isolated from admin
- [ ] Test isolation:
  - [ ] Admin logged in, student not logged in
  - [ ] Admin can access `/overview`
  - [ ] Student cannot access admin routes
  - [ ] Student logged in, admin not logged in
  - [ ] Student can access `/student/*`
  - [ ] Admin cannot access student routes

---

## Phase 6: SEO-Safe Routing ✅

- [x] Verified `/institutes/[slug]` is used (not `/[slug]`)
- [x] No middleware rewrites on institute routes
- [ ] Setup ISR for institute pages:
  - [ ] Added `revalidate = 3600` to `src/app/institutes/[slug]/page.tsx`
  - [ ] Added `generateStaticParams()` for top 100 institutes
  - [ ] Test: institute pages cache correctly

---

## Phase 7: Performance Fixes ✅

- [x] Middleware only does JWT verification
- [x] Root page uses ISR caching
- [x] No database calls in middleware
- [ ] Performance validation:
  - [ ] Middleware latency < 10ms
  - [ ] Root page TTFB < 100ms
  - [ ] Run load test: `npm run loadtest:*`
  - [ ] Measure request throughput increase

---

## Critical: Token Revocation ⚠️

**Status:** Needs implementation

- [ ] Logout endpoint increments `user.tokenVersion`
- [ ] Student logout increments `student.tokenVersion`
- [ ] Refresh endpoint checks `tokenVersion` before issuing new token
- [ ] Test revocation:
  - [ ] Login user → get tokens
  - [ ] Logout → tokenVersion increments
  - [ ] Try to refresh → 401 Unauthorized
  - [ ] Force re-login succeeds

---

## Testing & Validation

### Unit Tests

- [ ] `tokens.ts` tests
  - [ ] `createAccessToken()` creates valid JWT
  - [ ] `verifyAccessToken()` validates token
  - [ ] Expired token returns null
  - [ ] `createRefreshToken()` works
  - [ ] `verifyRefreshToken()` works
- [ ] `student-tokens.ts` tests (same as above)
- [ ] `proxy.ts` tests
  - [ ] Unauthenticated → redirect to login
  - [ ] Valid token → allow
  - [ ] Expired token → redirect to login
  - [ ] Not-onboarded → redirect to onboarding

### Integration Tests

- [ ] Login flow
  - [ ] Request OTP
  - [ ] Verify OTP
  - [ ] Both cookies set
  - [ ] Redirected to onboarding or dashboard
- [ ] Token refresh flow
  - [ ] Valid refresh token → new access token
  - [ ] Invalid refresh token → 401
  - [ ] Revoked token → 401
- [ ] Student login flow
  - [ ] Same as admin but separate tokens
  - [ ] Test auth isolation
- [ ] Logout flow
  - [ ] Tokens cleared
  - [ ] `tokenVersion` incremented
  - [ ] Subsequent requests → 401

### E2E Tests

- [ ] Guest → landing page
- [ ] Guest → click login
- [ ] Enter email → receive OTP
- [ ] Enter OTP → redirect to onboarding
- [ ] Complete onboarding → redirect to dashboard
- [ ] Dashboard works (can see data)
- [ ] Logout → redirected to landing
- [ ] Cannot access dashboard after logout
- [ ] Student login → student portal
- [ ] Student cannot access admin routes

### Manual Testing

```bash
# 1. Start dev server
npm run dev

# 2. Test root page (guest)
open http://localhost:3000
# Should show landing page

# 3. Test login flow
# Fill form, submit, verify tokens are set
# DevTools → Application → Cookies
# Should see: access_token, refresh_token (both httpOnly)

# 4. Test protected route
open http://localhost:3000/overview
# Should show dashboard (not redirect)

# 5. Test token refresh (if implemented)
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Cookie: refresh_token=<token>"
# Should return success

# 6. Test logout
# Click logout button
# Cookies should be cleared
# open http://localhost:3000/overview
# Should redirect to login

# 7. Test student login (if implemented)
curl -X POST http://localhost:3000/api/v1/student/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","code":"123456"}'
# Should set student_access_token and student_refresh_token
```

### Load Testing

- [ ] Run baseline load test with old system
- [ ] Deploy new system
- [ ] Run load test again
- [ ] Compare metrics:
  - [ ] Middleware latency down 80%
  - [ ] Root page latency down 66%
  - [ ] Throughput increased

```bash
# Run load tests (if configured)
npm run loadtest:light
npm run loadtest:medium
npm run loadtest:heavy

# Check results in load-tests/results/
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration, e2E)
- [ ] Load tests show improvements
- [ ] Code reviewed
- [ ] Monitoring configured
- [ ] Rollback plan ready

### Deployment Steps

1. **Update Prisma Schema**
   - [ ] Add `tokenVersion` fields
   - [ ] Run migration on staging
   - [ ] Verify schema updated
   - [ ] Update production database

2. **Deploy Phase 1-2 (Root + Middleware)**
   - [ ] Merge `src/app/page.tsx` and `src/proxy.ts`
   - [ ] Deploy to staging
   - [ ] Test root page rendering
   - [ ] Test protected routes
   - [ ] Deploy to production
   - [ ] Monitor error rates

3. **Deploy Phase 3-4 (Token System)**
   - [ ] Create new API endpoints
   - [ ] Update login endpoints
   - [ ] Deploy to staging
   - [ ] Test login creates both tokens
   - [ ] Test protected routes work
   - [ ] Deploy to production
   - [ ] Keep old `session_token` as fallback

4. **Deploy Phase 5 (Student Auth)**
   - [ ] Deploy student endpoints
   - [ ] Test student login isolation
   - [ ] Deploy to production

5. **Finalize**
   - [ ] Remove old `session_token` support (optional, can wait)
   - [ ] Update documentation
   - [ ] Monitor system metrics

### Post-Deployment Monitoring

- [ ] Error rates: target < 0.1%
- [ ] Middleware latency: target < 10ms
- [ ] Root page TTFB: target < 100ms
- [ ] Token refresh success rate: target > 99%
- [ ] Login duration: target < 2s
- [ ] No auth-related support tickets

---

## Documentation Checklist

- [ ] Update README with new auth system
- [ ] Document token lifecycle
- [ ] Document how to refresh tokens
- [ ] Document how to handle token expiry
- [ ] Document security best practices
- [ ] Update API documentation
- [ ] Add examples for client implementations
- [ ] Document environment variables

---

## Rollback Plan

If issues occur:

### Critical Issues (Rollback Immediately)

- [ ] Auth system broken (users cannot log in)
- [ ] Middleware blocking all requests
- [ ] Database errors from tokenVersion field

**Rollback Steps:**
1. Revert `src/proxy.ts` to previous version
2. Revert `src/app/page.tsx` to middleware redirect version
3. Re-enable global middleware matcher
4. Monitor error rates drop

### Non-Critical Issues (Fix Forward)

- [ ] Refresh endpoint not working
- [ ] Student auth issues
- [ ] Performance not as expected

**Fix Steps:**
1. Fix code
2. Deploy fix
3. Monitor

---

## Success Criteria

The refactor is successful when:

✅ All users can log in  
✅ Middleware latency < 10ms  
✅ Root page loads < 100ms  
✅ Protected routes enforce auth  
✅ Token refresh works  
✅ Student auth is isolated  
✅ No performance regression  
✅ Error rate < 0.1%  
✅ All tests passing  

---

## Sign-Off

- [ ] Dev team: Refactor implementation complete
- [ ] QA team: All tests passing
- [ ] DevOps: Monitoring configured
- [ ] Product: Performance goals met
- [ ] Security: No vulnerabilities

---

**Last Updated:** March 23, 2026  
**Status:** In Progress  
**Owner:** [Your Name]
