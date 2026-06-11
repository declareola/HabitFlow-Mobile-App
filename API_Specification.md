Here is the first foundational document from the Technical & Engineering category.

### **API Specification: Core Engines & AI Integration**

This specification defines the exact data contracts between the React/Ionic frontend and the Node.js/NestJS backend. To ensure accurate streak tracking and habit resets across an international user base, all temporal data relies heavily on strict timezone handling and ISO 8601 UTC timestamps.

**Base URL:** `[https://api.habitflow.io/v1](https://api.habitflow.io/v1)`
**Authentication:** Bearer Token (Firebase JWT)
**Global Headers:**

* `Authorization: Bearer <token>`
* `Accept-Language: <locale>` (e.g., en-US, fr-FR)
* `X-Timezone: <timezone>` (e.g., Africa/Lagos, Asia/Tokyo)

---

### **1. Habit Engine Endpoints**

**Create a New Habit**

* **Endpoint:** `POST /habits`
* **Description:** Provisions a new habit for the authenticated user.
* **Request Body:**

```json
{
  "title": "Morning Meditation",
  "frequency": ["monday", "wednesday", "friday"],
  "target_duration_minutes": 15,
  "category": "wellness"
}

```

* **Response (201 Created):**

```json
{
  "habit_id": "hbt_8f92a1",
  "status": "active",
  "streak": 0,
  "next_due": "2026-06-11T07:00:00Z"
}

```

**Log a Habit Completion**

* **Endpoint:** `POST /habits/{habit_id}/log`
* **Description:** Marks a habit as complete for the current localized calendar day.
* **Request Body:**

```json
{
  "completed_at": "2026-06-11T07:15:30Z",
  "actual_duration_minutes": 16
}

```

* **Response (200 OK):** Returns the updated streak and XP awarded.

---

### **2. Focus Engine Endpoints**

**Log a Focus Session**

* **Endpoint:** `POST /focus/sessions`
* **Description:** Records a completed Pomodoro or Deep Work session.
* **Request Body:**

```json
{
  "session_type": "deep_work",
  "start_time": "2026-06-11T09:00:00Z",
  "end_time": "2026-06-11T10:30:00Z",
  "interruptions": 1,
  "energy_rating_post_session": 8
}

```

* **Response (201 Created):** Returns the calculated session score and updates the daily Productivity Score.

---

### **3. Wellness Engine Endpoints**

**Update Daily Wellness Metrics**

* **Endpoint:** `PUT /wellness/daily`
* **Description:** Upserts the user's wellness data for the current day.
* **Request Body:**

```json
{
  "date": "2026-06-11",
  "sleep_hours": 7.5,
  "water_ml": 1500,
  "mood_score": 85
}

```

* **Response (200 OK):**

```json
{
  "wellness_score": 82.5,
  "status": "updated"
}

```

---

### **4. AI Coach Engine Endpoints**

**Generate Predictive Insight**

* **Endpoint:** `GET /ai/coach/insight`
* **Description:** Triggers the AI to analyze the past 7 days of habits, focus, and wellness data to generate a proactive recommendation.
* **Response (200 OK):**

```json
{
  "insight_id": "ins_4490x",
  "type": "burnout_warning",
  "message": "Your focus performance drops after 3 PM when your sleep is under 6 hours. Consider shifting deep work to the morning today.",
  "actionable_step": {
    "action": "reschedule_session",
    "suggested_time": "09:00"
  }
}
