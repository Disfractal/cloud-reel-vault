# Autospotr VMS

This project is the Firebase/React/Typescript video management service for Autospotr.


## Installation

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Clone Project

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Deploy

Project is deployed to Firebase using Cloud Build auto triggering on branch repository

## Firebase 

### Login 

`firebase login:ci` and use the token to replace the `FIREBASE_TOKEN` env variable where ever it maybe in the project.
