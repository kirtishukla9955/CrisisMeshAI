# CrisisMesh AI - Report Module

This is the Report Submission + Offline/SMS Intake module for the CrisisMesh AI disaster-response platform.

## Architecture

*   **Frontend**: React.js + Tailwind CSS, Vite, PWA/Service Worker.
*   **Offline Storage**: IndexedDB via `idb` library.
*   **Backend**: Node.js + Express.js, Firebase Admin SDK, Twilio SMS API.
*   **Database**: Firebase Firestore & Firebase Storage.

## Shared Data Schema

Every report submitted (via App, Offline Sync, or SMS) will be written to the Firestore `reports` collection in the following shape. Teammates can consume this directly from Firestore.

```json
{
  "reportId": "uuid-string",
  "source": "app" | "offline_sync" | "sms",
  "reporterId": "string | null",
  "reporterPhone": "string | null",
  "text": "string | null",
  "mediaUrls": ["string"],
  "location": { "lat": 12.9716, "lng": 77.5946 } | null,
  "locationText": "string | null",
  "tag": "flood" | "injury" | "trapped" | "food_water" | "medical" | "road_blocked" | "other",
  "isEmergency": true | false,
  "status": "new",
  "createdAt": "Firestore server timestamp",
  "syncedAt": "Firestore server timestamp | null"
}
```

## Setup & Running Locally

### 1. Backend

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    Create a `.env` file in the `backend` directory (use `.env.example` as a template):
    ```env
    PORT=5000
    FIREBASE_PROJECT_ID=your_project_id
    FIREBASE_CLIENT_EMAIL=your_client_email
    FIREBASE_PRIVATE_KEY="your_private_key"
    FIREBASE_STORAGE_BUCKET=your_storage_bucket
    TWILIO_ACCOUNT_SID=your_twilio_sid
    TWILIO_AUTH_TOKEN=your_twilio_token
    ```
4.  Start the backend server:
    ```bash
    node server.js
    ```

### 2. Frontend

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser to `http://localhost:5173`.

### 3. SMS Webhook (Twilio)

To test the Twilio SMS webhook locally:
1.  Use `ngrok` or a similar tool to expose your local port 5000:
    ```bash
    ngrok http 5000
    ```
2.  In your Twilio Console (Sandbox or Test Credentials), configure the webhook for incoming messages to point to:
    `https://<your-ngrok-url>.ngrok-free.app/api/sms-webhook` (ensure it's an HTTP POST request).
3.  Send an SMS to your Twilio number formatted like: `HELP flood Near Ganga bridge, water rising fast!`
