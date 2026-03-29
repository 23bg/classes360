# Notification + Integration Architecture (Implemented)

Date: 2026-03-15

## Scope

This implementation extends the existing Classes360 CRM without changing core module behavior.

Implemented goals:
- Central event dispatcher for channel fan-out.
- In-app admin and student notification persistence.
- Event-driven WhatsApp dispatch integrated with event catalog rules.
- Event-driven email dispatcher for notification emails.
- Integration status model + API for WhatsApp/Email/Razorpay.
- Reminder producers for follow-up, fee due, and trial ending soon.

## Core Building Blocks

### 1) Event Catalog (source of truth)
- `src/lib/notifications/event-catalog.ts`
- Defines events, channels, audiences, WhatsApp sender preference.

### 2) Event Dispatcher (new)
- `src/lib/notifications/event-dispatcher.service.ts`
- Input: domain event payload from service-layer mutations.
- Behavior:
  - reads channel mapping from event catalog
  - writes in-app notifications
  - calls WhatsApp event dispatcher
  - calls email notification sender
  - isolates per-channel failures (logs, does not crash mutation)

### 3) Notification Persistence (new)
- `src/lib/notifications/notification-store.service.ts`
- Models:
  - `AdminNotification`
  - `StudentNotification`
- APIs support listing + read toggles.

### 4) Email Notification Dispatch (extended)
- `src/lib/services/mailer.service.ts`
- Added `sendNotificationEmail()` with SMTP fallback behavior.

### 5) Reminder Producers (new)
- `src/lib/notifications/reminder-producer.service.ts`
- Producers:
  - `produceFollowUpReminders()` -> FOLLOW_UP_REMINDER
  - `produceFeeDueReminders()` -> FEE_DUE_REMINDER + FEE_DUE_SOON
  - `produceTrialEndingSoonReminders()` -> TRIAL_ENDING_SOON

### 6) Integration Management (new)
- Prisma `Integration` model with provider/status/config.
- Service: `src/features/integration/services/integration.service.ts`
- API: `GET /api/v1/integrations`

## New API Endpoints

- `GET/PATCH /api/v1/notifications/admin`
  - list admin notifications
  - mark read/unread

- `GET/PATCH /api/v1/student-portal/notifications`
  - list student notifications
  - mark read/unread

- `POST /api/v1/notifications/reminders`
  - owner-triggered reminder producer endpoint

- `GET /api/v1/integrations`
  - integration status/config summary for WhatsApp/Email/Razorpay

## Service-Layer Event Emission Wiring

Event dispatch integrated in:
- `lead.service.ts`
  - LEAD_CREATED
  - LEAD_STATUS_CHANGED
  - LEAD_NOTE_ADDED
  - FOLLOW_UP_SCHEDULED
  - FOLLOW_UP_COMPLETED
  - LEAD_CONVERTED_TO_STUDENT

- `student.service.ts`
  - STUDENT_CREATED
  - STUDENT_UPDATED
  - STUDENT_BATCH_CHANGED
  - STUDENT_COURSE_CHANGED

- `student-portal.service.ts`
  - STUDENT_PORTAL_CREDENTIALS_CREATED
  - PORTAL_LOGIN
  - ANNOUNCEMENT_CREATED
  - NEW_ANNOUNCEMENT_AVAILABLE

- `fee.service.ts`
  - FEE_PLAN_CREATED
  - INSTALLMENT_ADDED
  - PAYMENT_RECEIVED
  - NEW_PAYMENT_RECORDED

- `course.service.ts`
  - COURSE_CREATED
  - COURSE_UPDATED

- `batch.service.ts`
  - BATCH_CREATED
  - BATCH_UPDATED

- `team.service.ts`
  - TEAM_MEMBER_ADDED
  - TEAM_MEMBER_ROLE_UPDATED
  - TEAM_MEMBER_REMOVED

- `institute.service.ts`
  - INSTITUTE_PROFILE_UPDATED
  - INSTITUTE_ONBOARDING_COMPLETED

- `subscription.service.ts`
  - TRIAL_STARTED
  - SUBSCRIPTION_CREATED
  - SUBSCRIPTION_PAYMENT_SUCCESS
  - SUBSCRIPTION_PAYMENT_FAILED
  - SUBSCRIPTION_CANCELLED

## UI Additions

- `src/app/(dashboard)/settings/integrations/page.tsx`
  - Integrations status screen
- `src/app/(dashboard)/settings/page.tsx`
  - Added link to Integrations page

## Data Model Additions

Added to `src/prisma/schema.prisma`:
- enums: `IntegrationProvider`, `IntegrationStatus`
- models: `AdminNotification`, `StudentNotification`, `Integration`

## Notes

- Event catalog is now runtime-connected through a single dispatcher path.
- In-app admin and student feeds are now persisted and queryable via API.
- Reminders are producer-based and currently owner-triggered via endpoint (scheduler can call this endpoint).
- Prisma generation may fail on Windows with file-lock EPERM if query engine DLL is in use; TypeScript build currently succeeds.
