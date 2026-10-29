# SortLab – DSA Sorting Game

Learn, practice and get quizzed on sorting algorithms by sorting 7 people by height.
Built with React, Vite and Tailwind CSS (dark, liquid-glass UI).

**Algorithms:** Bubble, Insertion, Selection, Merge, Quick, plus optimized Bubble (swap flag), Insertion (one-step insert) and Quick (two-pointer partition). Quick sort always uses the rightmost person as pivot.
Each one works ascending or descending, starting from the left or the right, on random, best or worst case data.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Modes

- **Learn**: animated step-by-step walkthrough.
- **Practice**: you do the moves (compare, swap, pivot, pass variable, insert/merge) with task hints.
- **Quiz**: random method, order and start side. 100 marks, -5 per mistake, -10 per revealed task. Scores are saved in localStorage and can be downloaded as `scores.txt`.

## Structure

- `src/engine.js`: generates the list of moves for every algorithm
- `src/App.jsx`: Learn, Practice, Quiz and Home screens
- `src/index.css`: Tailwind + glass styles and animations

## Credits

Created by **Chathusha Pehemina**.

Sound effects are generated in the browser with the Web Audio API (`src/sound.js`). Use the Sound button (top right) to mute.

In the splitting sorts (merge, quick, optimized quick) the left part is handled first, then the right part, then they merge.
