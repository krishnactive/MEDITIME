# MediTime – Full-Stack Medical Appointment Platform
MediTime is a full-stack clinic management and patient engagement platform built with a Node.js/Express backend and two React.js front-ends: one for patients and one for the clinic administrators/doctors. It aims to simplify the process of finding the right doctor, scheduling appointments, managing clinic operations and generating AI-driven health insights.
## Live deployments
| Panel  | URL |
|--------|-----|
| Public | https://meditime-sigma.vercel.app/ (patient portal) |
| Admin  | https://meditime-admin-dr.vercel.app/ (admin panel) |

## Features

### **Patient portal**
- **Google login** – Patients sign in with Google; the backend verifies Google's ID token, links an existing account by verified email, and issues a JWT.
  Handled via:
  - `POST /api/user/google-login`

- **Profile management** – Authenticated users can fetch their profile and update it, including uploading a profile picture.  
  Endpoints:
  - `GET /api/user/get-profile`
  - `POST /api/user/update-profile`

- **Search & browse doctors** – Homepage lists top doctors by speciality; patients can view doctor profiles and check availability.

- **Book, pay, and cancel appointments** –  
  - Book appointment: `POST /api/user/book-appointment`  
  - Pay via Razorpay: `POST /api/user/payment-razorpay`  
  - Verify payment: `POST /api/user/verifyRazorpay`  
  - List appointments: `GET /api/user/appointments`  
  - Cancel appointment: `POST /api/user/cancel-appointment`

- **Video consultations** – Patients can join their appointment's video room, talk with their doctor, toggle camera/microphone, use in-call chat, and share their screen. Calls use PeerJS/WebRTC for media and Socket.IO for room signaling; appointment call duration is recorded.
  - Join a call from **My Appointments** when the appointment has a call room.
  - Upcoming appointment reminders are checked once per minute and shown in-app; browser notifications are used when permission is granted.

- **Appointment documents** – Patients can upload up to 10 image or PDF files (10 MB per file) to an appointment and download those files and available prescription PDFs.

- **AI-generated health reports** – Users can chat with Dr.AI or upload up to five medical report images for OCR and AI summaries.
  - Chat: `POST /api/ai/ask` (rate-limited)  
  - Upload reports: `POST /api/reports/upload` (returns extracted tests + AI commentary)

- **Responsive UI** – Built with React, Vite, Tailwind CSS; includes a floating chat widget for Dr.AI.

---

### **Doctor portal**
- **Login & profile** – Doctors log in and can fetch/update profiles.  
  - `POST /api/doctor/login`  
  - `GET /api/doctor/profile`  
  - `POST /api/doctor/update-profile`

- **Appointment management** – View, cancel, or mark appointments as completed.  
  - `GET /api/doctor/appointments`  
  - `POST /api/doctor/cancel-appointment`  
  - `POST /api/doctor/complete-appointment`

- **Video consultations** – Doctors can join a patient's appointment call, exchange in-call messages, control audio/video, share a screen, and end the call. Upcoming appointment reminders are also shown in the doctor portal.

- **Prescriptions** – Doctors can attach prescription text and/or a prescription file to an appointment.

- **Dashboard** – Metrics: earnings, total appointments, patient count.  
  - `GET /api/doctor/dashboard`

- **Availability toggling** –  
  - `POST /api/doctor/change-availability`

---

### **Admin panel**
- **Secure admin login** –  
  - `POST /api/admin/login`

- **Doctor management** – Add new doctors, retrieve list, toggle availability.  
  - `POST /api/admin/add-doctor`  
  - `GET /api/admin/all-doctors`  
  - `POST /api/admin/change-availability`

- **Appointment oversight** – View and cancel any appointment.  
  - `GET /api/admin/all-appointments`  
  - `POST /api/admin/cancel-appointment`

- **Dashboard statistics** – Fetch overall metrics: doctor count, patient count, total appointments, latest bookings/cancellations.  
  - `GET /api/admin/dashboard`

---

### **AI & report analysis**
- **Chat-based prescription generation** – Dr.AI asks a set of health-related questions and generates a structured prescription using Google’s Gemini API.  
  - `POST /api/ai/ask`

- **Medical report OCR & summarisation** – Extracts data from up to 5 lab report images using Tesseract and provides a patient-friendly explanation via Gemini.  
  - `POST /api/reports/upload`

---

### **Payment integration**
- **Razorpay checkout** – When booking an appointment, creates a payment order and verifies it.  
  - Create order: `POST /api/user/payment-razorpay`  
  - Verify payment: `POST /api/user/verifyRazorpay`  
  - Uses `VITE_RAZORPAY_KEY_ID` for the frontend checkout script.


---
## Tech stack

| Layer     | Technologies |
|-----------|--------------|
| Frontend  | React with Vite & Tailwind CSS; React Router; Axios; Google OAuth; PeerJS/WebRTC and Socket.IO for video consultations; jsPDF for PDF export |
| Admin UI  | React with Vite & Tailwind CSS; separate context for admin state; PeerJS/WebRTC and Socket.IO for video consultations |
| Backend   | Node.js (ES modules), Express.js, Mongoose (MongoDB), JWT and Google ID-token verification for authentication, Socket.IO for call signaling, Razorpay SDK for payments, Cloudinary for image uploads, Google Gemini API, Tesseract.js and PDF libraries for OCR and report parsing |
| Deployment|  Vercel for the frontend/admin; Node host Render for API|

---
## Project structure
```
MEDITIME/
 ├─ admin/      # Admin panel (React + Vite)
 │  ├─ public/
 │  ├─ src/
 │  └─ vite.config.js
 ├─ frontend/   # Patient portal (React + Vite)
 │  ├─ public/
 │  ├─ src/
 │  └─ vite.config.js
 └─ backend/    # REST API (Node/Express/Mongoose)
   ├─ config/          # DB & cloudinary configuration
   ├─ controllers/     # Route handlers (user, doctor, admin, AI, report)
   ├─ models/          # Mongoose schemas for users, doctors, appointments
   ├─ routes/          # Express routers (userRoutes, doctorRoutes, adminRoutes, 
aiRoutes, reportRoutes)
   ├─ middlewares/     # Auth middlewares and file upload
   ├─ server.js        # Entry point for API
   └─ package.json     # Backend dependencies
```

## Installation

**Prerequisites:** Node.js v18+, npm or pnpm, and a MongoDB instance (local or Atlas). Configure Google OAuth for patient sign-in. A Razorpay account is required to test payments.

**Clone the repository:**
```bash
git clone https://github.com/krishnactive/MEDITIME.git
 cd MEDITIME
```

**Backend setup:**
```bash
cd backend
npm install
npm run server # starts the API and Socket.IO server on http://localhost:4000 by default
```
Create `backend/.env` and set the variables listed below.

**Frontend (patient portal):**
```bash
cd frontend
npm install
npm run dev # Vite defaults to http://localhost:5173
```
Create `frontend/.env` and set the variables listed below.

**Admin panel:**
```bash
cd admin
npm install
npm run dev # Vite defaults to http://localhost:5173; use another port if patient frontend is running
```
Create `admin/.env` and set `VITE_BACKEND_URL`. The backend allows the local patient/admin Vite origins on ports 5173 and 5174 for Socket.IO.

## Environment variables
### Set these variables in your .env file for the backend
**Backend:**
```ini
PORT=4000
MONGODB_URL=mongodb://localhost:27017/meditime
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=adminpassword
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CURRENCY=INR
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_api_secret
GEMINI_API_KEY=your_google_generative_ai_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
# Optional comma-separated browser origins for Socket.IO beyond the built-in local/live origins
CLIENT_ORIGINS=https://your-patient-app.example,https://your-admin-app.example
```
### Patient frontend (`frontend/.env`)
```ini
VITE_BACKEND_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```
### Admin app (`admin/.env`)
```ini
VITE_BACKEND_URL=http://localhost:4000
```
Use `VITE_BACKEND_URL=http://localhost:4000` in both frontend apps for local development. Use the same Google OAuth web client ID for `GOOGLE_CLIENT_ID` in the backend and `VITE_GOOGLE_CLIENT_ID` in the patient frontend. Configure local and deployed patient origins as authorized JavaScript origins in Google Cloud Console.

The call clients use the backend URL for Socket.IO by default, the public PeerJS broker, and Google's public STUN servers. Optional Vite overrides are `VITE_SOCKET_URL`, `VITE_PEER_SERVER_HOST`, `VITE_PEER_SERVER_PORT`, `VITE_PEER_SERVER_PATH`, `VITE_PEER_SERVER_SECURE`, and `VITE_ICE_SERVERS` (a JSON array of WebRTC ICE server objects). Screen sharing requires a secure browser context (HTTPS or localhost) and user permission.

## API overview

| Module | Method | Endpoint | Description | Auth |
|--------|--------|----------|-------------|------|
| User   | POST   | /api/user/google-login | Sign in or register with Google | ✖ |
|        | GET    | /api/user/get-profile | Get profile | ✔ |
|        | POST   | /api/user/update-profile | Update profile | ✔ |
|        | POST   | /api/user/book-appointment | Book appointment | ✔ |
|        | GET    | /api/user/appointments | List appointments | ✔ |
|        | GET    | /api/user/call-reminders | Get upcoming appointment reminders | ✔ |
|        | POST   | /api/user/start-call | Record call start for an appointment | ✔ |
|        | POST   | /api/user/end-call | End call and record its duration | ✔ |
|        | POST   | /api/user/cancel-appointment | Cancel appointment | ✔ |
|        | POST   | /api/user/payment-razorpay | Create Razorpay order | ✔ |
|        | POST   | /api/user/verifyRazorpay | Verify payment | ✔ |
| Doctor | POST   | /api/doctor/login | Login | ✖ |
|        | GET    | /api/doctor/profile | Get profile | ✔ |
|        | POST   | /api/doctor/update-profile | Update profile | ✔ |
|        | GET    | /api/doctor/list | List doctors (public) | ✖ |
|        | GET    | /api/doctor/appointments | List appointments | ✔ |
|        | GET    | /api/doctor/call-reminders | Get upcoming appointment reminders | ✔ |
|        | POST   | /api/doctor/start-call | Record call start for an appointment | ✔ |
|        | POST   | /api/doctor/end-call | End call and record its duration | ✔ |
|        | POST   | /api/doctor/cancel-appointment | Cancel booking | ✔ |
|        | POST   | /api/doctor/complete-appointment | Mark completed | ✔ |
|        | POST   | /api/doctor/appointment/:appointmentId/prescription | Add prescription text/file | ✔ |
|        | GET    | /api/doctor/dashboard | Dashboard metrics | ✔ |
|        | POST   | /api/doctor/change-availability | Toggle availability | ✔ |
| Admin  | POST   | /api/admin/login | Login | ✖ |
|        | POST   | /api/admin/add-doctor | Add doctor | ✔ |
|        | GET    | /api/admin/all-doctors | List doctors | ✔ |
|        | POST   | /api/admin/change-availability | Toggle doctor availability | ✔ |
|        | GET    | /api/admin/all-appointments | View all appointments | ✔ |
|        | POST   | /api/admin/cancel-appointment | Cancel appointment | ✔ |
|        | GET    | /api/admin/dashboard | Dashboard metrics | ✔ |
| AI     | POST   | /api/ai/ask | Chat with Dr.AI | ✔ |
| Report | POST   | /api/reports/upload | Upload report images for OCR and analysis | ✔ |
|        | POST   | /api/reports/appointment/:appointmentId/upload-files | Upload appointment files | ✔ |
|        | GET    | /api/reports/appointment/:appointmentId/download/:filename | Download appointment file | ✔ |
|        | GET    | /api/reports/appointment/:appointmentId/download-prescription | Download prescription PDF | ✔ |

✔ indicates JWT authentication is required.

Video call media travels peer-to-peer through WebRTC; Socket.IO on the backend coordinates room membership, chat, peer presence, and screen-share state. The API call start/end endpoints record appointment call timing and are separate from the Socket.IO signaling events.

## Contributing
###  If you’d like to contribute:
1. Fork this repository.
2. Create a feature branch. |git checkout -b feature/your-feature .|
3. Commit changes.
4. Push and open a pull request.

## Author

**Name:** Krishna Kant Sharma  
**Email:** krishnactive@gmail.com  
**GitHub:** [krishnactive](https://github.com/krishnactive)  
**LinkedIn:** [Krishna Kant Sharma](https://www.linkedin.com/in/krishna-kant-sharma-a64955230/)
