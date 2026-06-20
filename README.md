# SplitMate — Smart Expense Splitter

> **Add. Split. Settle. Done.**

A multi-page web app for splitting expenses among hostel roommates, travel groups, and friend circles.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES Modules) |
| Auth | Firebase Authentication (Google + Email) |
| Database | Firebase Firestore |
| Icons | Font Awesome 6.7.2 |
| Fonts | Google Fonts (Syne + DM Sans) |

## Features

- Google & email authentication
- Create/join groups with 6-digit invite codes
- Equal & custom expense splitting
- Smart settlement — minimum transactions algorithm
- Expense history with filters (category, payer, date, search)
- Admin dashboard with user management & charts
- Dark glassmorphic UI, fully responsive

## Folder Structure

```
splitmate/
├── index.html              # Landing page
├── login.html              # Login
├── register.html           # Register
├── groups.html             # My groups dashboard
├── group.html              # Group detail (tabs)
├── add-expense.html        # Add expense form
├── settlement.html         # Settlement summary
├── history.html            # Expense history + filters
├── 404.html                # Not found page
├── admin/
│   ├── index.html          # Admin dashboard
│   └── users.html          # User management
├── css/
│   ├── style.css           # Global design system
│   ├── components.css      # Reusable components
│   └── admin.css           # Admin styles
├── js/
│   ├── firebase-config.js  # Firebase init (ADD YOUR KEYS)
│   ├── auth.js             # Auth logic
│   ├── utils.js            # Shared utilities
│   ├── groups.js           # Group CRUD
│   ├── expenses.js         # Expense logic
│   ├── settlement.js       # Balance & debt algorithm
│   └── history.js          # History filters
└── assets/
    └── logo.svg
```

## Local Setup

### Prerequisites
- VS Code + Live Server extension (or any HTTP server)
- Firebase project (free tier)

### 1. Clone
```bash
git clone https://github.com/yourusername/splitmate.git
cd splitmate
```

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project → `splitmate`
3. Enable **Authentication** → Google + Email/Password
4. Enable **Firestore** → Start in test mode
5. Register a **Web App** → copy config

### 3. Add Firebase Config
Edit `js/firebase-config.js` and replace placeholder values:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Set Admin Role
In Firestore, set `role: "admin"` on your user document: `users/{your-uid}`

### 5. Run
Open `index.html` with Live Server, or:
```bash
npx -y serve .
```

## AWS S3 + CloudFront Deployment

### S3 Setup
1. Create S3 bucket → enable **Static website hosting**
2. Set index document: `index.html`, error document: `404.html`
3. Upload all project files (preserve folder structure)
4. Set bucket policy for public read:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
  }]
}
```

### CloudFront Setup
1. Create distribution → origin = S3 website endpoint
2. Default root object: `index.html`
3. Custom error response: 404 → `/404.html` (200 status)
4. Enable HTTPS, set cache behaviors
5. Point your domain via Route 53 (optional)

## License

MIT — Made with ❤️ in Bengaluru
