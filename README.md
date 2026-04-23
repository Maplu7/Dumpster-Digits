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

Dumpster Digits is an interactive, raccoon-themed educational math game designed for 1st and 2nd grade students.  
It combines engaging gameplay with real-time data tracking for teachers using Firebase.

---

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

---

### Coin System
- Students earn coins after completing a game
- Rewards decrease with repeated plays:
  - 1st play: 60 coins
  - 2nd: 35
  - 3rd: 20
  - etc.
- Coins are stored in Firebase and update live
- Used in the Shop to unlock cosmetics

---

### Shop System
- Live-updating coin balance
- Unlockable:
  - Profile pictures
  - Custom outfits
- Equipped items sync instantly across the app

---

### Teacher Dashboard
- Real-time student data from Firebase
- Tracks:
  - Completed assignments
  - Wrong attempts per problem
  - Percent correctness (based on wrong tries)
  - Perfect runs
- Per-attempt history (not just latest score)
- Class-wide performance insights

---

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