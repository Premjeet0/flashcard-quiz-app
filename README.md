# Flashcard Quiz App

A simple, clean flashcard app for studying. Built with plain HTML, CSS and JavaScript (no build step).

## Features
- Question on the front, answer on the back with a **Show Answer** button (card flips)
- **Next** / **Previous** navigation (plus ← → arrow keys and Space to flip)
- **Add, edit and delete** flashcards
- **Categories**: group cards and filter by category
- **Shuffle** cards in study mode
- **Quiz mode**: score, progress, and "Retry missed" at the end
- **Export / Import** cards as JSON (backup or share decks)
- Cards are saved in your browser (localStorage)
- Responsive, dark-mode friendly, keyboard accessible

## Run locally
Open `index.html` in a browser.

## Deploy live (GitHub Pages)
1. Create a new repository on GitHub, e.g. `flashcard-quiz-app`.
2. Upload these files (or use the git commands below).
3. Go to **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`** → Save.
4. Live at `https://<your-username>.github.io/flashcard-quiz-app/`

```bash
git init
git add .
git commit -m "Add flashcard quiz app"
git branch -M main
git remote add origin https://github.com/<your-username>/flashcard-quiz-app.git
git push -u origin main
```
