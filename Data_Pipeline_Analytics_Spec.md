### **Data Pipeline & Analytics Spec**

To deliver hyper-personalized coaching while maintaining strict privacy standards globally, our data pipeline must separate raw telemetry from the context window we feed to the AI. This specification defines how we track user behavior, calculate scores, and route data securely.

**Primary Tools:**

* **Event Tracking:** Mixpanel
* **Data Warehouse:** Snowflake (for long-term behavioral trend analysis)
* **ETL Pipeline:** Fivetran
* **Real-time Processing:** Apache Kafka (for immediate UI updates upon habit completion)

---

### **1. Core Event Schema (Mixpanel Tracking)**

We track granular behavioral events to train our predictive models. Every payload sent to analytics must strictly omit PII (Personally Identifiable Information).

**Event: `habit_completed**`
Triggered when a user checks off a habit.

* `habit_category`: (e.g., "wellness", "productivity")
* `time_of_day`: "morning" | "afternoon" | "evening"
* `streak_count`: Integer
* `on_time`: Boolean (Did they do it at the planned time?)

**Event: `focus_session_ended**`
Triggered when a timer hits zero or is manually stopped.

* `session_type`: "pomodoro" | "deep_work"
* `planned_duration_m`: Integer
* `actual_duration_m`: Integer
* `completion_rate`: Percentage (actual / planned)
* `interruptions`: Integer

**Event: `ai_insight_interacted**`
Triggered when a user accepts or dismisses an AI Coach suggestion.

* `insight_type`: "burnout_warning" | "schedule_optimization"
* `action_taken`: "accepted" | "dismissed" | "read"

---

### **2. The LLM Context Pipeline (How the AI "Knows" You)**

We do not send the entire database to OpenAI/Gemini. We use a **Retrieval-Augmented Generation (RAG) Lite** approach to feed the LLM a highly structured, anonymized snapshot.

**The 7-Day Rolling Context Object:**
Every night at 00:00 UTC, a chron job compiles a JSON snapshot of the user's past 7 days. This snapshot is stored in Redis for instant retrieval.

```json
{
  "user_id_hash": "a1b2c3d4",
  "timezone": "Africa/Lagos",
  "averages_7d": {
    "sleep_hours": 6.2,
    "focus_completion_rate": 88,
    "hydration_hit_rate": 50
  },
  "trend": "sleep_declining_focus_stable",
  "recent_failures": ["morning_run", "meditation"]
}

```

*Pipeline Rule:* When the user opens the app, the backend injects this exact JSON block into the LLM system prompt, allowing the AI Coach to generate a hyper-relevant greeting (e.g., "Good morning! Your hydration has been slipping while your focus remains high. Let's prioritize water today to keep that energy up.") without knowing the user's name or exact location.

---

### **3. North Star Metrics (Business & Growth)**

These are the core metrics the product team will monitor daily on our internal dashboards to measure the health of the operating system.

* **W1 Retention Rate:** The percentage of users who complete at least one habit in their second week. (Target: > 40%).
* **Coach Engagement Rate (CER):** The percentage of AI-suggested actions that users actually implement (e.g., accepting a suggested habit recovery plan). This measures the effectiveness of our AI moat.
* **Habit Conversion Velocity:** The average time it takes a user to upgrade from the Free Tier to Pro ($7.99/mo) after hitting the 5-habit limit.
* **Platform Ecosystem Score:** The percentage of daily active users (DAUs) utilizing *at least three* engines simultaneously (e.g., tracking a habit + using the timer + logging sleep).

---

### **4. Data Deletion & Global Compliance**

Because this app operates globally, users have the "Right to be Forgotten."

* **Hard Delete Protocol:** If a user requests account deletion, a webhook fires across all services (PostgreSQL, Mixpanel, Firebase).
* **AI Forgetting:** Any data passed to third-party LLM providers is sent via enterprise API endpoints with a strict zero-day retention policy (the provider cannot use our users' data to train their base models).
