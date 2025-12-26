# 🚀 CodeElevate — EdTech Backend  
Node.js + Express + MongoDB based backend for a full-featured EdTech learning platform.  
This backend handles authentication, courses, sections/subsections, lectures, progress tracking, payments, and more.

---

## 📌 Tech Stack
Node.js • Express.js • MongoDB • Mongoose • JWT • Cloudinary • Bcrypt  
Express-fileupload • Razorpay • Nodemailer

---

## 📂 Project Structure
/backend  
 ├── config/  
 ├── controllers/  
 ├── models/  
 ├── routes/  
 ├── middlewares/  
 ├── utils/  
 ├── .env  
 ├── index.js  
 └── package.json  

---

## 🔑 Environment Variables (.env)
PORT=4000  
MONGODB_URL=your_mongo_url  
JWT_SECRET=your_jwt_secret  

CLOUD_NAME=your_cloudinary_name  
CLOUDINARY_API_KEY=your_cloudinary_key  
CLOUDINARY_SECRET_KEY=your_cloudinary_secret  

RAZORPAY_KEY=your_key  
RAZORPAY_SECRET=your_secret  

MAIL_HOST=smtp.gmail.com  
MAIL_USER=your_email  
MAIL_PASS=your_password  

---

## 📦 Installation & Setup

### 1️⃣ Clone repository
git clone <repo-url>  
cd backend  

### 2️⃣ Install dependencies
npm install  

### 3️⃣ Start server
npm run dev  

Server runs on: http://localhost:4000  

---

## 🔐 Authentication Features
- Signup / Login  
- Forgot & Reset Password  
- JWT-based protected routes  
- Cookie-based authentication  

---

## 🎓 Course Management

### Instructor/Admin:
- Create Course  
- Add Course Sections  
- Add Subsections (Lectures)  
- Upload Videos to Cloudinary  
- Publish / Unpublish Course  

### Student:
- Get All Courses  
- View Course Details  
- Track Lecture Progress  
- Mark Lectures Completed  

---

## 💳 Payment (Razorpay)
- Create Order  
- Verify Payment Signature  
- Enroll Student After Successful Payment  
- Optional Webhook Support  

---

## ☁ Media Uploads (Cloudinary)
- Upload Lecture Videos  
- Upload Thumbnails  
- Update Profile Pictures  
- Automatically return secure Cloudinary URLs  

---

## ✉ Email System (Nodemailer)
- OTP / Verification Emails  
- Password Reset Link  
- Enrollment Confirmation Mail  

---

## 📘 Core API Endpoints

### Auth  
POST /auth/signup  
POST /auth/login  
POST /auth/reset-password  

### Course  
POST /course/create  
POST /course/add-section  
POST /course/add-subsection  
GET /course/all  
GET /course/:id  

### Profile  
POST /profile/update-dp  
GET /profile/dashboard  

### Payment  
POST /payment/capture  
POST /payment/verify  

---

## 🛡 Middlewares
- Auth (JWT)  
- isInstructor  
- isStudent  
- Rate Limiter (optional)  

---

## 🧪 API Testing Tools
- Postman  
- Thunder Client  

---

## 📌 Pending Features (Planned for Future Updates)
These features are currently under development and will be added soon:

- 🔒 **Account Deletion Confirmation**  
  - Before deleting an account, ask the user (Instructor/Student) for confirmation.

- 🗑 **Instructor Account Deletion Cleanup**  
  - When an instructor deletes their account, automatically delete all courses created by them.

---

## 🧑‍💻 Author
**Akash Singh**  
Backend Developer — Node.js | Express | MongoDB  

---

## ⭐ Support
Give a ⭐ on GitHub if you like this project!
