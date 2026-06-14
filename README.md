# Season Ranker 📺

**Season Ranker** is a modern, responsive web application designed for television enthusiasts who want granular control over their viewing priorities. Instead of simply tracking shows, this app allows users to rank specific *Seasons* of a show against each other (e.g., ranking *Lost* Season 3 ahead of *Friends* Season 2, but behind *Friends* Season 1).

Additionally, it provides live streaming provider information so you know exactly where to watch, and features an intelligent **Partner Matchmaker** to mathematically calculate the best viewing compromise for couples and friends.

🌐 **Live Demo:** [https://tv-show-watchlist-e35de.web.app](https://tv-show-watchlist-e35de.web.app)

---

## ✨ Key Features

- **Granular Season Tracking:** Search for any TV show and select specific seasons to add to your personalized watchlist.
- **Drag-and-Drop Ranking:** Effortlessly prioritize what you want to watch next using a smooth, intuitive drag-and-drop interface powered by `@dnd-kit`.
- **Live Streaming Data:** Integrates with the TMDB API to automatically display which streaming platforms (Netflix, Hulu, Max, etc.) currently offer each season in your list.
- **Cross-Device Cloud Sync:** Securely log in with Google. Your watchlist is instantly synchronized in real-time across your phone, tablet, and desktop via Firebase Cloud Firestore.
- **Partner Matchmaker:** Share your unique "Partner Code" to link accounts with a friend or partner. The app cross-references your watchlists and scores overlapping seasons to suggest the ultimate "Compromise Picks" for movie night.
- **Premium Glassmorphism UI:** Features a sleek, modern, frosted-glass design with vibrant neon gradients and smooth micro-interactions.

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Vanilla CSS (CSS Variables, Flexbox, Glassmorphism)
- **Database & Auth:** Firebase (Google Sign-In, Cloud Firestore)
- **APIs:** The Movie Database (TMDB) REST API
- **Icons & Interactions:** `lucide-react`, `@dnd-kit/core`, `@dnd-kit/sortable`
- **Hosting:** Firebase Hosting

---

## 🚀 Local Development Setup

To run this project locally on your machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/holabendez/tv-show-watchlist.git
cd tv-show-watchlist
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
You will need API keys for both Firebase and TMDB. 
1. Create a `.env` file in the root of your project directory (you can use `.env.example` as a template).
2. Add your keys:

```env
VITE_FIREBASE_API_KEY="your_firebase_api_key_here"
VITE_TMDB_API_KEY="your_tmdb_api_key_here"
```

### 4. Start the Development Server
```bash
npm run dev
```

The app will compile and be available at `http://localhost:5173/`.

---

## 🤝 Partner Matchmaker Logic

The **Partner Matchmaker** algorithm works by looking for the intersection of two linked users' watchlists. 
If both User A and User B have added *The Last of Us Season 1* to their watchlists, the algorithm adds their respective rankings together (e.g., User A ranks it #1, User B ranks it #3 = Score: 4). The matches are then sorted from the lowest combined score to the highest, surfacing the shows that *both* users prioritize the highest.

## 📝 License
This project is open source and available under the [MIT License](LICENSE).
