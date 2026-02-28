# Manual Test Checklist

## Scope
- Authentication flow
- Dashboard tasks/projects workflow
- Teams integration behavior (licensed and unlicensed account cases)
- Error handling and user guidance

## Test Data
- Account A: Personal Microsoft account (expected limited Graph access)
- Account B: Work/School account with Teams license (if available)
- Browser: Edge and Chrome latest stable

## Entry Criteria
- Application builds successfully (`npm run build`)
- Environment variables/config are set for app registration
- Test user can sign in with Microsoft

## Exit Criteria
- All P0 and P1 scenarios pass
- P2 failures documented with known limitations

## Priority Legend
- P0: Critical business path
- P1: High impact, frequent usage
- P2: Nice-to-have / edge behavior

## Authentication

### TC-AUTH-001 (P0) - Initial load and silent login
- Steps: Open app with existing authenticated session
- Expected: App bypasses login screen and loads dashboard

### TC-AUTH-002 (P0) - Interactive login
- Steps: Open app in fresh session, click Sign In with Microsoft
- Expected: Microsoft login redirect, then dashboard renders

### TC-AUTH-003 (P1) - Logout
- Steps: From authenticated state, click logout icon
- Expected: Redirect/logout and app returns to sign-in screen

## Profile and Header

### TC-PROF-001 (P1) - Header user info
- Steps: Login and observe header
- Expected: User display name and status badge are visible

### TC-PROF-002 (P1) - Fallback profile handling
- Steps: Simulate Graph profile failure (network dev tools or mock)
- Expected: UI still shows fallback user data from auth context

## Dashboard Tasks/Projects

### TC-DASH-001 (P0) - Create task
- Steps: Click New Task, enter title, click Create
- Expected: Task appears in task lists and counts update

### TC-DASH-002 (P1) - Move task status
- Steps: Go to Tasks tab, move To Do -> In Progress -> Done
- Expected: Task appears under correct column after each action

### TC-DASH-003 (P1) - Create project
- Steps: Go to Projects tab, click New Project, fill details, create
- Expected: New project card appears with 0% progress

## Teams Integration

### TC-TEAM-001 (P0) - Unlicensed account behavior
- Steps: Login with personal/unlicensed account and open Teams Integration tab
- Expected: Profile loads, Teams section shows actionable license guidance

### TC-TEAM-002 (P0) - Teams and channels listing
- Steps: Login with licensed account and open Teams Integration tab
- Expected: Teams are listed and channels load for selected team

### TC-TEAM-003 (P1) - Send channel message
- Steps: Select team/channel, enter text, click Send
- Expected: Success message shown and input clears

### TC-TEAM-004 (P1) - Meeting creation
- Steps: Enter meeting title, click Create Meeting
- Expected: Meeting link is generated and success feedback is shown

### TC-TEAM-005 (P1) - Validation errors
- Steps: Click Send with empty message / Create meeting with empty title
- Expected: Inline validation message appears

## Negative and Resilience

### TC-NEG-001 (P1) - Graph 403 handling
- Steps: Trigger Graph permission-denied response
- Expected: UI shows permission/admin consent guidance

### TC-NEG-002 (P1) - Network interruption
- Steps: Disable network and refresh app
- Expected: User-friendly error behavior; no app crash

### TC-NEG-003 (P2) - Rapid repeated clicks
- Steps: Click Send/Create quickly multiple times
- Expected: Buttons show disabled/loading state, no duplicate actions

## Reporting Template
- Test Case ID:
- Build/Commit:
- Environment:
- Result (Pass/Fail):
- Evidence (screenshot/video/log):
- Notes/Defect Link:
