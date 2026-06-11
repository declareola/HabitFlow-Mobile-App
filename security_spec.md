# security_spec.md - Security Specification for HabitFlow AI

## 1. Data Invariants
- **Identity Invariant (Owner Lock)**: Any write/read of records residing at path `users/{userId}/...` is strictly restricted to authenticated operations where `request.auth.uid == userId`. No user may see, alter, or inject data into another user's subcollections.
- **Verified Email Access**: All write operations require a verified email token (`request.auth.token.email_verified == true`).
- **Temporal Integrity**: All record alterations or creations must align with actual server epochs. No manual spoofing or pre-stamped data is allowed.
- **Strict Keys Matching**: No "Ghost Fields" or shadow values can be wrote in document creation or updates.

## 2. The "Dirty Dozen" Payloads (Aesthetic Rogue Requests)

### Rogue 01: Shadow Field Injection (User Profile)
- **Target**: `users/{userId}` (Create/Update)
- **Attack Vector**: Injecting `isAdmin: true` into own profile document to escalate privileges.
```json
{
  "userName": "Hacker",
  "userXP": 1500,
  "userLevel": 5,
  "isAdmin": true
}
```
- **Expected Outcome**: `PERMISSION_DENIED`

### Rogue 02: PII Privacy Breach
- **Target**: `users/{otherUserId}` (Get)
- **Attack Vector**: Fetching another user's email, bio, name, or settings.
- **Expected Outcome**: `PERMISSION_DENIED`

### Rogue 03: Identity Spoofing (Habit Invalidation)
- **Target**: `users/{johnUid}/habits/{habitId}`
- **Attack Vector**: Authenticated User `aliceUid` attempting to create or write a habit card under John's path.
- **Expected Outcome**: `PERMISSION_DENIED`

### Rogue 04: Deny of Wallet - Infinite Memory ID Poisoning
- **Target**: `users/{userId}/habits/{unboundedIdGreaterThan128Chars}`
- **Attack Vector**: Sending keys of length >128 characters filled with junk Unicode letters to bloat index and memory.
- **Expected Outcome**: `PERMISSION_DENIED`

### Rogue 05: Metric Value Overdose
- **Target**: `users/{userId}/metrics/{metricId}` (Create)
- **Attack Vector**: Injecting extreme values for daily water or sleep to corrupt math models (e.g. `sleepHours: 9e99`).
- **Expected Outcome**: `PERMISSION_DENIED`

### Rogue 06: State Step Escalation (XP Spoofing)
- **Target**: `users/{userId}` (Update)
- **Attack Vector**: Modifying `userXP` to leap over limits via a single settings action.
- **Expected Outcome**: `PERMISSION_DENIED`

### Rogue 07: Unauthenticated Read
- **Target**: `users/{userId}/habits/{habitId}` (Get)
- **Attack Vector**: Accessing data when target `request.auth` is null.
- **Expected Outcome**: `PERMISSION_DENIED`

### Rogue 08: Missing Keys Omissions
- **Target**: `users/{userId}/metrics/{metricId}` (Create)
- **Attack Vector**: Creating a log lacking required biomarkers `sleepScore` and `mindState`.
- **Expected Outcome**: `PERMISSION_DENIED`

### Rogue 09: Circadian Alignment Value Poisoning
- **Target**: `users/{userId}` (Update)
- **Attack Vector**: Injecting an invalid list or non-allowed theme under `appTheme`.
- **Expected Outcome**: `PERMISSION_DENIED`

### Rogue 10: Fake Timestamp Travel (Creation Timestamp)
- **Target**: `users/{userId}/metrics/{metricId}` (Create)
- **Attack Vector**: Setting `createdAt` to a hardcoded historical timestamp to manipulate milestones.
- **Expected Outcome**: `PERMISSION_DENIED`

### Rogue 11: Unverified Email Hijacking
- **Target**: `users/{userId}` (Create)
- **Attack Vector**: Authenticated user with `email_verified == false` trying to create settings profile.
- **Expected Outcome**: `PERMISSION_DENIED`

### Rogue 12: Terminal Milestone Lock Override
- **Target**: `users/{userId}/milestones/{milestoneId}` (Update)
- **Attack Vector**: Modifying the `targetCount` of an existing milestone to make unlocking trivial.
- **Expected Outcome**: `PERMISSION_DENIED`

---

## 3. Test Runner Schema (firestore.rules.test.ts Outline)
```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";

describe("HabitFlow AI - Prefrontal Fortress Test", () => {
  it("should fail to allow writing admin fields globally", async () => {
    // ... test harness asserting Rogue 01 failures
  });
  it("should enforce UID separation", async () => {
    // ... test harness asserting Rogue 03 failures
  });
});
```
