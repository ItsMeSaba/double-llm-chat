# Project Overview

This project is a modern web application built using a monorepo structure, featuring both a frontend and a backend application.

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Express.js with SQLite and Drizzle ORM
- **Authentication**: JWT and refresh tokens
- **Real-time Communication**: Socket.io for live chat messages

## Key Features

1. **Authentication**:
   - Secure user login and registration using JWT.
   - Refresh token mechanism for session management.

2. **Chat Functionality**:
   - Real-time messaging with live updates using Socket.io.
   - Integration with AI models for generating responses.

3. **Feedback System**:
   - Users can provide feedback on AI model responses.
   - Feedback statistics are available for analysis.

4. **Statistics Dashboard**:
   - Visual representation of feedback data.
   - Summary of user interactions with AI models.

5. **Responsive Design**:
   - Optimized for both desktop and mobile devices.

## Installation and Setup

1. **Clone the Repository**:

   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   yarn install
   ```

2. **Running the Applications**:
   - **Frontend**: `yarn dev:web`
   - **Backend**: `yarn dev:server`

3. **Environment Variables**:
   - Configure `.env` files for both frontend and backend applications.

## Additional Information

- **Node.js**: Ensure Node.js (>=18) is installed.
- **Yarn**: Uses Yarn workspaces for dependency management.
- **Database**: SQLite is used for simplicity and ease of setup.
