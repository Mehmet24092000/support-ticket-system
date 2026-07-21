# IT Support Ticket System

A fullstack web application for managing internal IT support tickets, workflows and support processes.

## Overview

The IT Support Ticket System is a fullstack project built with React, Node.js and Express.  
It allows users to create support tickets, manage ticket statuses, assign tickets to support members, add comments and view ticket statistics in a dashboard.

The project focuses on enterprise software workflows, internal support processes and simple role-based functionality.

## Features

- Create new IT support tickets
- View all tickets in a dashboard
- Search tickets by title, description, creator or assignee
- Filter tickets by status and priority
- Change ticket status
- Assign tickets to support members
- Add comments to tickets
- Simple role logic:
  - Employee
  - Support
  - Admin
- Delete tickets as Admin
- Dashboard statistics for open, in progress, completed and high-priority tickets

## Tech Stack

### Frontend

- React
- JavaScript
- CSS
- Vite

### Backend

- Node.js
- Express
- CORS
- REST API

## Project Focus

This project demonstrates:

- Fullstack development
- REST API design
- Enterprise software workflows
- Dashboard design
- Ticket and status management
- Basic role-based UI logic
- Frontend and backend communication

## Roles

### Employee

Employees can create tickets and view existing support requests.

### Support

Support users can update ticket statuses, assign tickets and add comments.

### Admin

Admins can manage tickets and delete tickets.

## API Endpoints

### Get all tickets

```bash
GET /api/tickets
```

### Create ticket

```bash
POST /api/tickets
```

### Update ticket status

```bash
PATCH /api/tickets/:id/status
```

### Assign ticket

```bash
PATCH /api/tickets/:id/assign
```

### Add comment

```bash
POST /api/tickets/:id/comments
```

### Delete ticket

```bash
DELETE /api/tickets/:id
```

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/MEHMET24092000/support-ticket-system.git
cd support-ticket-system
```

### 2. Start the backend

```bash
cd server
npm install
npm run dev
```

The backend runs on:

```txt
http://localhost:5002
```

### 3. Start the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs on:

```txt
http://localhost:5173
```

## Folder Structure

```txt
support-ticket-system/
├── client/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── index.js
│   └── package.json
├── README.md
└── .gitignore
```

## Future Improvements

- Add MongoDB database integration
- Add real user authentication
- Add persistent ticket history
- Add role-based backend authorization
- Add due dates and SLA tracking
- Add email notifications
- Add charts for ticket statistics

## About

This project was created as a portfolio project to demonstrate practical fullstack development skills in the context of enterprise software and IT support workflows.