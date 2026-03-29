# Notification Implementation Review (Code Audit)

Date: 2026-03-15
Method: static code-path audit of API routes, services, and notification dispatch calls.

## Post-Implementation Delta (2026-03-15)

The sections below represent the pre-integration baseline. Since that audit, the following have been implemented:

- Unified event dispatcher with channel fan-out.
- Persistent AdminNotification and StudentNotification feeds.
- Integration status model and integrations API.
- Reminder producers for FOLLOW_UP_REMINDER, FEE_DUE_REMINDER/FEE_DUE_SOON, TRIAL_ENDING_SOON.
- Service-layer event dispatch in lead, student, course, batch, fee, team, institute, subscription, and student-portal flows.
- New notification APIs:
	- `GET/PATCH /api/v1/notifications/admin`
	- `GET/PATCH /api/v1/student-portal/notifications`
	- `POST /api/v1/notifications/reminders`
	- `GET /api/v1/integrations`

See architecture details in `docs/release/NOTIFICATION_INTEGRATION_ARCHITECTURE.md`.

Status values:
- IMPLEMENTED
- PARTIAL
- NOT_IMPLEMENTED
- NOT_REQUIRED

## Public Enquiry Events

| Event | Event Trigger | In-App Admin | Student Portal | WhatsApp | Email | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| PUBLIC_ENQUIRY_SUBMITTED | PARTIAL | PARTIAL | NOT_REQUIRED | PARTIAL | NOT_IMPLEMENTED | Public lead route calls lead creation flow, but does not emit this named event directly. |
| PUBLIC_ENQUIRY_CONFIRMATION | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | No student confirmation dispatch found. |

## Lead Pipeline Events

| Event | Event Trigger | In-App Admin | Student Portal | WhatsApp | Email | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| LEAD_CREATED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | IMPLEMENTED | NOT_REQUIRED | Triggered from lead create and public lead create path. |
| LEAD_ASSIGNED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_REQUIRED | No assignment workflow emitting LEAD_ASSIGNED found. |
| LEAD_STATUS_CHANGED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_REQUIRED | NOT_REQUIRED | Lead activity log exists, no dedicated notification feed yet. |
| LEAD_NOTE_ADDED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_REQUIRED | NOT_REQUIRED | Activity log only. |
| FOLLOW_UP_SCHEDULED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_REQUIRED | Logged as activity; no reminder job/trigger for WA. |
| FOLLOW_UP_COMPLETED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_REQUIRED | NOT_REQUIRED | Activity log only. |
| FOLLOW_UP_REMINDER | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_REQUIRED | No event emitter for due follow-up reminders found. |
| LEAD_CONVERTED_TO_STUDENT | IMPLEMENTED | PARTIAL | NOT_REQUIRED | IMPLEMENTED | NOT_REQUIRED | Triggered when lead status becomes ADMITTED. |

## Student Lifecycle Events

| Event | Event Trigger | In-App Admin | Student Portal | WhatsApp | Email | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| STUDENT_CREATED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_REQUIRED | Service calls WA dispatch, but catalog excludes WA channel for this event, so send is skipped. |
| STUDENT_UPDATED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_REQUIRED | NOT_REQUIRED | CRUD update only; no dispatch. |
| STUDENT_BATCH_CHANGED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | No batch-change specific trigger detection in student update flow. |
| STUDENT_COURSE_CHANGED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | No course-change specific trigger detection in student update flow. |
| STUDENT_PORTAL_CREDENTIALS_CREATED | IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | IMPLEMENTED | NOT_IMPLEMENTED | Route uses PATCH and emits WA event; no in-app/email dispatch path. |

## Course and Batch Events

| Event | Event Trigger | In-App Admin | Student Portal | WhatsApp | Email | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| COURSE_CREATED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_REQUIRED | NOT_REQUIRED | CRUD exists; no notification dispatcher integration. |
| COURSE_UPDATED | IMPLEMENTED | PARTIAL | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_REQUIRED | CRUD exists; no student portal notification feed event emission. |
| BATCH_CREATED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_REQUIRED | NOT_REQUIRED | CRUD exists; no notification dispatcher integration. |
| BATCH_UPDATED | IMPLEMENTED | PARTIAL | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | CRUD exists; no event emission path. |
| TEACHER_ASSIGNED_TO_BATCH | PARTIAL | PARTIAL | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_REQUIRED | Teacher module exists; no explicit notification event emission found. |

## Fee and Payment Events

| Event | Event Trigger | In-App Admin | Student Portal | WhatsApp | Email | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| FEE_PLAN_CREATED | IMPLEMENTED | PARTIAL | PARTIAL | NOT_REQUIRED | NOT_REQUIRED | Fee plan creation exists; no notification dispatcher integration. |
| INSTALLMENT_ADDED | IMPLEMENTED | PARTIAL | PARTIAL | NOT_REQUIRED | NOT_REQUIRED | Installment creation exists; no notification dispatcher integration. |
| PAYMENT_RECEIVED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | NOT_IMPLEMENTED | WA dispatch integrated in fee service. |
| PAYMENT_FAILED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | No failed-payment event emission found. |
| FEE_DUE_REMINDER | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | No due-reminder emitter found. |

## Announcement Events

| Event | Event Trigger | In-App Admin | Student Portal | WhatsApp | Email | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| ANNOUNCEMENT_CREATED | IMPLEMENTED | PARTIAL | IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | Student announcements stored and shown in portal; no WA/email dispatch. |

## Team Management Events

| Event | Event Trigger | In-App Admin | Student Portal | WhatsApp | Email | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TEAM_MEMBER_ADDED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_REQUIRED | Service calls WA dispatch, but catalog excludes WA channel so send is skipped. |
| TEAM_MEMBER_ROLE_UPDATED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_REQUIRED | NOT_REQUIRED | Role update exists; no notification dispatch. |
| TEAM_MEMBER_REMOVED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_REQUIRED | NOT_REQUIRED | Removal exists; no notification dispatch. |

## Institute Events

| Event | Event Trigger | In-App Admin | Student Portal | WhatsApp | Email | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| INSTITUTE_PROFILE_UPDATED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | NOT_REQUIRED | NOT_REQUIRED | WA call exists but event channel excludes WA so dispatch is skipped. |
| INSTITUTE_ONBOARDING_COMPLETED | IMPLEMENTED | PARTIAL | NOT_REQUIRED | IMPLEMENTED | NOT_REQUIRED | WA dispatch integrated and enabled by catalog. |

## Subscription and Billing Events

| Event | Event Trigger | In-App Admin | Student Portal | WhatsApp | Email | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TRIAL_STARTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_REQUIRED | NOT_IMPLEMENTED | Defined in catalog only. |
| TRIAL_ENDING_SOON | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | Defined in catalog only. |
| SUBSCRIPTION_CREATED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | Defined in catalog only. |
| SUBSCRIPTION_PAYMENT_SUCCESS | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | Defined in catalog only. |
| SUBSCRIPTION_PAYMENT_FAILED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | Defined in catalog only. |
| SUBSCRIPTION_CANCELLED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_REQUIRED | NOT_IMPLEMENTED | Defined in catalog only. |

## Student Portal Activity Events

| Event | Event Trigger | In-App Admin | Student Portal | WhatsApp | Email | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| PORTAL_LOGIN | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_REQUIRED | Login exists but event not emitted. |
| PORTAL_PASSWORD_CHANGED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_REQUIRED | No password-change event flow found. |
| NEW_ANNOUNCEMENT_AVAILABLE | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | No event emission on announcement create. |
| NEW_PAYMENT_RECORDED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | No event emission on payment create. |
| FEE_DUE_SOON | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | No due-reminder emitter found. |
| BATCH_UPDATED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_REQUIRED | Event exists in catalog only; no emitter. |
| COURSE_UPDATED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_IMPLEMENTED | NOT_REQUIRED | NOT_REQUIRED | Event exists in catalog only; no emitter. |

## Coverage Snapshot

- Event catalog coverage: IMPLEMENTED (all events and channel rules are defined)
- Runtime event emission coverage: PARTIAL
- WhatsApp runtime delivery: PARTIAL (implemented for selected events)
- Email runtime delivery: PARTIAL (service exists for OTP only; no notification-email dispatcher)
- In-app admin notification feed: NOT_IMPLEMENTED (activity lists exist, but no unified notification model/feed)
- Student portal notification feed: NOT_IMPLEMENTED (announcements exist, but no generalized notification feed)

## Highest Priority Gaps

1. Implement explicit emitters for all catalog events in service-layer mutation paths.
2. Build a unified in-app notification store for admin and student portal channels.
3. Add email notification dispatcher for non-OTP events.
4. Implement follow-up reminder and fee due reminder event producers.
5. Add automated event-to-channel integration tests for each event in catalog.
