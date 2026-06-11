### **QA & Testing Strategy**

To ensure HabitFlow AI is bulletproof across different devices, network conditions, and timezones, we need a rigorous Quality Assurance protocol. Because this is a mobile-first application dealing with time (timers, habits, streaks) and non-deterministic AI outputs, our testing strategy focuses heavily on edge cases.

**Testing Frameworks:**

* **Frontend/Unit:** Jest + React Testing Library
* **Backend/API:** Jest + Supertest
* **End-to-End (E2E) Web:** Cypress
* **Mobile Automation:** Detox (for React Native / Ionic iOS & Android builds)

---

### **1. The Testing Pyramid**

We will implement a standard automated testing pyramid, executing automatically on every pull request.

* **Layer 1: Unit Testing (Logic & Math)**
* *Focus:* Testing isolated functions without database calls.
* *Examples:* Validating the mathematical accuracy of the Habit Strength formula, ensuring the Productivity Score calculates correctly, and verifying that date parsers handle leap years and DST (Daylight Saving Time) shifts.


* **Layer 2: Integration Testing (API Contracts)**
* *Focus:* Ensuring the frontend and backend communicate correctly.
* *Examples:* Testing the `POST /habits` endpoint creates a database entry, and verifying Firebase JWT tokens are validated correctly by the NestJS middleware.


* **Layer 3: End-to-End (E2E) User Journeys**
* *Focus:* Simulating real user taps and swipes.
* *Examples:* An automated script that logs in as a "Student Persona," creates a study habit, starts a 25-minute Pomodoro timer, completes it, and verifies the XP bar increases on the profile screen.



---

### **2. Critical Edge Cases & "Gotchas"**

Standard apps fail when they don't account for the real world. Our QA team will explicitly test these scenarios:

* **Timezone Travel (The Streak Killer):** A user in Lokoja (WAT) completes a habit at 11:30 PM, then boards a flight and lands in London (BST). The system must use UTC timestamps under the hood to ensure they do not lose their streak or get double-credited due to timezone shifts.
* **Offline Mode & Sync Conflicts:** A user finishes a deep work session while offline. The Ionic app must store this in local state (via SQLite or local storage) and silently sync to the PostgreSQL database the moment a network connection is re-established, without throwing an error.
* **Background Timer Execution:** Both iOS and Android aggressively kill background apps to save battery. If a user starts a 60-minute focus timer and minimizes the app, we must test that the OS background tasks (or push notifications) wake the app up to trigger the alarm precisely at the 60-minute mark.

---

### **3. Testing the Non-Deterministic AI Coach**

Testing an LLM (OpenAI/Gemini) is fundamentally different from testing a standard function because the output changes. We will use **Prompt Evaluations (Evals)**:

* **JSON Schema Enforcement:** Every E2E test suite will assert that the AI Coach returns strictly formatted JSON. If the LLM hallucinates conversational text instead of the required API payload, the build fails.
* **Tone & Safety Assertions:** We will run automated "red-teaming" test cases. We will pass simulated, highly negative user mood data to the AI Coach in the staging environment to verify that it triggers the safety guardrails rather than giving generic productivity advice.