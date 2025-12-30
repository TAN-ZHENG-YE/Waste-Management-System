# WasteWise – Community Waste Management System

## Overview

WasteWise is a full-stack web application designed to support community-based waste management. The system allows residents to schedule waste pickups, report issues, view pickup history, and receive notifications, while administrators can manage communities, users, pickup requests, reports, and announcements through a dedicated admin dashboard.

This project demonstrates the use of modern web technologies, secure authentication, and structured backend design to solve a real-world community management problem.

## Tech Stack

### Frontend
- Angular
- Angular Material

### Backend
- Node.js
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
- Admin dashboard with community statistics
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

## How to Run the Project

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.1.

### Environment Setup

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in the `.env` file with your MongoDB Atlas connection string, JWT secret, and email credentials.

### Auto Setup

Run the `start.bat` file to automatically install the required packages and start the development servers.

### Manual Installation

Run the following command to install the required packages:

```bash
npm install
```

### Development Server

1. Start the backend server:
   ```bash
   npm run backend
   ```

2. In a separate terminal, start the frontend:
   ```bash
   ng serve
   ```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Run the following command to build the project:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

For detailed instructions on deploying this application to Vercel with MongoDB Atlas, please see the [DEPLOYMENT.md](DEPLOYMENT.md) guide.