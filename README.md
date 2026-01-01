# WasteWise – Community Waste Management System

## Overview
![alt text](image.png)
WasteWise is a full-stack web application designed to support community-based waste management. The system allows residents to schedule waste pickups, report issues, view pickup history, and receive notifications, while administrators can manage communities, users, pickup requests, reports, and announcements through a dedicated admin dashboard. 

This project demonstrates the use of modern web technologies, secure authentication, and structured backend design to solve a real-world community management problem.

## Tech Stack
This project was generated with Angular CLI version 18.2.1.

### Frontend
- Angular
- Angular Material

### Backend
- Node. js
- Express.js

### Database
- MongoDB

### Security & Utilities
- JWT (JSON Web Tokens) for authentication and authorization
- Bcrypt for secure password hashing
- Nodemailer for email verification and password reset

## Key Features

### Community User Features
- User registration with email verification
- Secure login and password reset
- Schedule waste pickup requests
- View pickup history and pickup status
- Report community issues with optional image upload
- Receive announcements and pickup status notifications
- View community news and updates

### Admin Features
- Admin dashboard with community statistics (try login as admin with this sample account- email: admin7@gmail.com, pass: 12345678)
- Manage community details and pickup schedules
- User management (view details, send messages, remove users)
- Approve or reject waste pickup requests
- Manage reported issues and mark them as resolved
- Generate reports and view waste collection statistics
- Send announcements and upload posters to community homepage

## Security & Authentication
- Passwords are hashed using bcrypt before being stored in the database
- JWT-based authentication for protected API routes
- Role-based access control for admin and community users
- Email verification for new accounts
- Token-based password reset with expiration for enhanced security

## Database Design

MongoDB is used as a NoSQL database with flexible schema design to support evolving community data. 

Main collections include:
- Users
- Communities
- Pickup Requests
- Issues
- Notifications
- Posters
- Statistics

This structure supports scalable data management for multiple communities.

## Skills Demonstrated
- Full-stack web development
- RESTful API design
- Authentication and authorization
- Secure password handling
- NoSQL database design (MongoDB)
- Frontend UI development with Angular Material
- Real-world system design and problem-solving

---

## How to Run the Project


### Option 1: Local Development

#### Auto Setup
Run the `start.bat` file to automatically install the required packages and start the development servers.

#### Manual Installation

1. **Install the required packages:**
```bash
npm install
```

2. **Set up environment variables:**
   - Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   - OR manually create a `.env` file in the root directory
   
   - Edit the `.env` file with your actual credentials:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE?retryWrites=true&w=majority
   
   # JWT Configuration
   JWT_SECRET=your-secure-jwt-secret-key-here
   
   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   
   # Application URLs
   FRONTEND_URL=http://localhost:4200
   BACKEND_URL=http://localhost:3000
   
   # Server Port
   PORT=3000
   ```

3. **Start the backend server** (Terminal 1):
```bash
node backend/app.js
# OR if you have a dev script
npm run dev
```
   You should see: `Server running on port 3000` or similar message

4. **Start the frontend development server** (Terminal 2 - open a new terminal):
```bash
ng serve
```
   You should see: `Compiled successfully`

5. **Navigate to** `http://localhost:4200/`

The application will automatically reload if you change any of the source files.

> **Note:** You need to keep BOTH terminals running: 
> - Terminal 1: Backend (Express server on port 3000)
> - Terminal 2: Frontend (Angular dev server on port 4200)

---

### Option 2: Deploy to Vercel (Production)

This project is configured for deployment on Vercel with serverless functions.

#### Prerequisites
- A Vercel account
- MongoDB Atlas (or other MongoDB hosting service)
- GitHub repository with your code

#### Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel. com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the Angular project

3. **Configure Environment Variables in Vercel:**
   - Go to your Vercel project settings → Environment Variables
   - Add the following environment variables: 
     - `MONGODB_URI` - Your MongoDB Atlas connection string
     - `JWT_SECRET` - Your JWT secret key
     - `EMAIL_USER` - Your email for notifications
     - `EMAIL_PASS` - Your email app-specific password
     - Any other API keys or secrets your app needs

4. **Deploy:**
   - Vercel will automatically build and deploy your project
   - Your app will be available at `https://your-project.vercel.app`
   - Any future pushes to the `main` branch will trigger automatic redeployments

#### How Vercel Deployment Works
- **Frontend:** Angular app is built and served as static files
- **Backend:** Express API runs as serverless functions via `/api` endpoint
- **Database:** MongoDB Atlas (cloud-hosted, separate from Vercel)
- **Environment:** Production environment uses `environment.prod.ts` configuration

---

## Project Structure

```
Waste-Management-System/
├── api/              # Serverless API endpoint for Vercel
│   └── index.js      # Entry point for Vercel serverless functions
├── backend/          # Express. js backend server (for local dev)
│   ├── app. js        # Main backend application
│   ├── routes/       # API routes
│   └── models/       # Database models
├── src/              # Angular frontend source
│   ├── app/          # Angular components
│   ├── service/      # Frontend services
│   └── environments/ # Environment configurations
│       ├── environment.ts       # Local development config
│       └── environment.prod. ts  # Production config
├── . env.example      # Example environment variables
├── vercel.json       # Vercel deployment configuration
└── angular.json      # Angular CLI configuration
```
