# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Dumpster Digits

Dumpster Digits is deployed as a web application that runs in the browser using React and Phaser.
The app is hosted online and connects to Firebase, which handles authentication and stores all game and student data in real time.

---

## Deployment Diagram

<img width="360" height="688" alt="Blank diagram (1)" src="https://github.com/user-attachments/assets/6387e77d-438f-4ad4-87fb-1fdf000a3f09" />

## How to Redeploy It

To redeploy Dumpster Digits, a developer first clones the project repository and installs all required dependencies using npm. The developer must then configure Firebase by adding the project’s API keys and connecting to the correct Firebase project for authentication and Firestore database access.
The application can be tested locally using the Vite development server to ensure that the React interface and Phaser game run correctly. Once verified, the project is built into a production-ready version using Vite’s build process.
The built files are then deployed to a hosting platform such as Firebase Hosting, Netlify, or Vercel. After deployment, the application becomes accessible via a public URL and continues to interact with Firebase for real-time data synchronization, including student progress, assignments, and game results.

### Redeployment Steps:

Clone the repository from GitHub
Install dependencies (npm install)
Configure Firebase (API keys + project setup)
Run locally (npm run dev) to test
Build the project (npm run build)
Deploy to hosting (Firebase Hosting / Netlify / Vercel)
Access the live application via URL

## Features

### Student Gameplay
- Drag-and-drop math game using Phaser
- Covers:
  - 1st Grade Addition & Subtraction
  - 2nd Grade Addition, Subtraction, Multiplication, Place Value, Fill-in-the-Blank
- Instant feedback (correct / wrong with visual effects)
- Finish screen with:
  - coins earned
  - wrong attempts per question
  - perfect run detection

### Coin System
- Students earn coins after completing a game
- Rewards decrease with repeated plays:
  - 1st play: 60 coins
  - 2nd: 35
  - 3rd: 20
  - etc.
- Coins are stored in Firebase and update live
- Used in the Shop to unlock cosmetics

### Shop System
- Live-updating coin balance
- Unlockable:
  - Profile pictures
  - Custom outfits
- Equipped items sync instantly across the app

### Teacher Dashboard
- Real-time student data from Firebase
- Tracks:
  - Completed assignments
  - Wrong attempts per problem
  - Percent correctness (based on wrong tries)
  - Perfect runs
- Per-attempt history (not just latest score)
- Class-wide performance insights

### Assignment System
- Assignments tied to game types
- Supports:
  - Locking/unlocking assignments
  - Student-specific assignment tracking
  - Live syncing from Firestore
- Automatically marks assignments as complete after play

---

## Tech Stack

- **Frontend:** React + Vite
- **Game Engine:** Phaser 3
- **Backend:** Firebase Firestore
- **Auth:** Firebase (anonymous / student ID-based)
- **State Sync:** Firestore real-time listeners (`onSnapshot`)

---

## Architecture Overview

### Game Flow

1. Student logs in
2. Selects or is assigned a game
3. React boots Phaser via `createGame()`
4. Game runs using shared `BaseMathGameScene`
5. On finish:
   - `saveAssignmentResult()` runs
   - Data is written to Firestore:
     - `students/{id}/assignmentResults`
     - `students/{id}/assignmentGameSummary`
     - `students/{id}.coins`
6. UI updates instantly via listeners

---

## Firestore Rules

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /teachers/{teacherId} {
      allow read, write: if true;
    }

    match /classrooms/{classId} {
      allow read, write: if true;

      match /{subPath=**} {
        allow read, write: if true;
      }
    }

    match /students/{studentId} {
      allow read, write: if true;

      match /{subPath=**} {
        allow read, write: if true;
      }
    }

    match /assignments/{assignmentId} {
      allow read, write: if true;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Firestore Structure

```plaintext
students/
  {studentId}/
    coins: number
    equippedItemImage: string

    assignmentResults/
      {attemptId}/
        gameKey
        totalWrongGuesses
        answers[]
        percentCorrect
        perfectRun
        completedAt

    assignmentGameSummary/
      {gameKey}/
        playCount
        lastCoinReward
        totalCoinsEarnedFromGame
        percentCorrect
        perfectRun
