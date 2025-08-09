# MediTime – Full-Stack Medical Appointment Platform
MediTime is a full-stack clinic management and patient engagement platform built with a Node.js/Express backend and two React.js front-ends: one for patients and one for the clinic administrators/doctors. It aims to simplify the process of finding the right doctor, scheduling appointments, managing clinic operations and generating AI-driven health insights.
## Live deployments
| Panel  | URL |
|--------|-----|
| Public | https://meditime-sigma.vercel.app/ (patient portal) |
| Admin  | https://meditime-admin-dr.vercel.app/ (admin panel) |

## Features

### **Patient portal**
- **Registration & login** – Users can create accounts, log in securely, and persist sessions via JWT tokens.  
  Handled via:
  - `POST /api/user/register`
  - `POST /api/user/login`

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

- **AI-generated health reports** – Users can chat with Dr.AI or upload medical reports for OCR and AI summaries.  
  - Chat: `POST /api/ai/ask` (rate-limited)  
  - Upload reports: `POST /api/report/upload` (max 5 images; returns extracted tests + AI commentary)

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
  - `POST /api/report/upload`

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
| Frontend  |React with Vite & Tailwind CSS; React Router; Axios; jsPDF for PDF export |
| Admin UI  |  React with Vite & Tailwind CSS; separate context for admin state |
| Backend   | Node.js (ES modules), Express.js, Mongoose (MongoDB), JWT for auth, Razorpay SDK for payments; Cloudinary for image uploads; Google Gemini API,  Tesseract.js & PDF libraries for OCR and report parsing |
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

**Prerequisites:** Node.js v18+, npm or pnpm. MongoDB instance (local or Atlas). A Razorpay
 account if you plan to test payments..

**Clone the repository:**
```bash
git clone https://github.com/krishnactive/MEDITIME.git
 cd MEDITIME
```

**Backend setup:**
```bash
cd backend
npm install
cp .env.example .env # create your environment file (see variables below)
npm run server # starts on http://localhost:3000
```

**Frontend (patient portal):**
```bash
cd ../frontend
npm install
cp .env.example .env  # define VITE_BACKEND_URL
npm run dev    # starts on http://localhost:3001
```

**Admin panel:**
```bash
cd ../admin
npm install
cp .env.example .env   # define VITE_BACKEND_URL
npm run dev     # starts on http://localhost:3001
```

## Environment variables
### Set these variables in your .env file for the backend
**Backend:**
```ini
PORT=5000
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
```
### For the frontend (patient) and admin Vite apps, create .env files with:
**Frontend/Admin:**
```ini
VITE_BACKEND_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```
## API overview

| Module | Method | Endpoint | Description | Auth |
|--------|--------|----------|-------------|------|
| User   | POST   | /api/user/register | Register new user | ✖ |
|        | POST   | /api/user/login | Login | ✖ |
|        | GET    | /api/user/get-profile | Get profile | ✔ |
|        | POST   | /api/user/update-profile | Update profile | ✔ |
|        | POST   | /api/user/book-appointment | Book appointment | ✔ |
|        | GET    | /api/user/appointments | List appointments | ✔ |
|        | POST   | /api/user/cancel-appointment | Cancel appointment | ✔ |
|        | POST   | /api/user/payment-razorpay | Create Razorpay order | ✔ |
|        | POST   | /api/user/verifyRazorpay | Verify payment | ✔ |
| Doctor | POST   | /api/doctor/login | Login | ✖ |
|        | GET    | /api/doctor/profile | Get profile | ✔ |
|        | POST   | /api/doctor/update-profile | Update profile | ✔ |
|        | GET    | /api/doctor/appointments | List appointments | ✔ |
|        | POST   | /api/doctor/cancel-appointment | Cancel booking | ✔ |
|        | POST   | /api/doctor/complete-appointment | Mark completed | ✔ |
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
| Report | POST   | /api/report/upload | Upload report images | ✔ |

✔ indicates JWT authentication is required.

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
