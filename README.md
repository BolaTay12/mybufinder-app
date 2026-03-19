# MY BU FINDER - Web Application

An advanced web application built for the university community to seamlessly report, manage, and find lost and found items. Powered by React, Mapbox for geographical tagging, and Groq's API for AI-driven matching.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Admin Features](#admin-features)
- [License](#license)

## Overview

MY BU FINDER is a dynamic and intuitive application aimed at tracking lost and found property on a university campus. Users can report lost items, report discovered items, and use an intelligent AI-based recommendation engine to find potential matches for their missing belongings.

## Features

- **User Authentication**: Secure Login and Registration system.
- **Lost & Found Reporting**: Specialized forms to report lost or found items.
- **AI Match Analysis**: Utilizes Groq SDK to intelligently analyze and match newly found items to user's lost reports.
- **Interactive Mapping**: Mapbox GL integration lets users plot exactly where an item was found or lost.
- **Dashboard & Search**: A rich dashboard to view user activity, active reports, and robust search capabilities.
- **Claims System**: Easily claim items with verification workflows.
- **Notifications**: Stay updated with push or in-app notifications on matching items and claim statuses.
- **Admin Panel**: Specialized interfaces for admins to review all reports, coordinate item returns, and manage user claims.

## Technology Stack

### Frontend
- **React.js (v19)**: Component-based robust UI.
- **React Router DOM (v7)**: Handling complex multi-nested routing structure.
- **Tailwind CSS (v3)**: Utility-first styling for beautiful and responsive UI components.
- **React Hook Form**: For clean and performant form validation.

### Integrations
- **Mapbox GL**: Advanced interactive maps for item location pinpointing.
- **Groq SDK**: Large Language Model integration for item "Match Analysis."

### Tooling
- **Create React App**: Initial boilerplate builder.
- **Jest & React Testing Library**: Unit and snapshot testing tools.

## Project Structure

```
mybufinder-app/
├── public/                # Static assets and index.html
├── src/
│   ├── admin/             # Administrator routes and dashboards
│   ├── assets/            # Global images, icons, and graphical assets
│   ├── components/        # Reusable UI components (ErrorBoundary, LoadingSpinner, etc)
│   ├── context/           # React Context providers (AuthContext, ThemeContext, UIContext)
│   ├── utils/             # Helper / Utility functions
│   ├── App.js             # Main Router configuration and App entrypoint
│   └── *.jsx              # Main page views (Dashboard, MatchAnalysis, Settings, etc)
├── .env                   # Environment variable configuration
├── package.json           # Dependencies and Scripts
├── tailwind.config.js     # Tailwind CSS theme and styling configuration
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd mybufinder-app
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

### Environment Variables

Before running the application, you need to configure your environment variables.
Create a `.env` file in the root directory (where `package.json` is located) and specify the following keys:

```ini
# Base URL for the bufinder backend APIs
REACT_APP_BASE_URL=https://bufinderbackend-production.up.railway.app

# Mapbox token for displaying map features
REACT_APP_MAPBOX_TOKEN=your_mapbox_public_key_here

# Groq API key for AI match engine functionalities
REACT_APP_GROQ_API_KEY=your_groq_api_key_here
```

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the application in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload when you make changes.

### `npm test`
Launches the test runner in the interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder. It minifies the code and optimizes the overall bundle structure.

### `npm run eject`
**Note: This is a one-way operation.** Removes the single build dependency and copies all the configuration files directly into your project.

## Admin Features

The application incorporates a secure `AdminDashboard` meant for university personnel or administrators:
- **All Reports (`/admin/all-reports`)**: Manage the entire ledger of lost and found instances.
- **Item Review (`/admin/review/:itemId`)**: Accept, reject, or mark items as verified.
- **Claims Management (`/admin/claims`)**: Oversee user requests to claim discovered items and schedule pickups.

## License

This project is proprietary and built specifically for the MY BU FINDER application logic. Unauthorized distribution or usage is strictly prohibited.
