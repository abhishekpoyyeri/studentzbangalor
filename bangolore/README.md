# Studentz Bangalore 🎓

> **Speak up. Get help. Make change.**

Studentz Bangalore is a student-driven community platform dedicated to helping learners in Bangalore by providing a safe space to share academic, campus, and wellbeing concerns. Students can submit issues, track them via reference IDs, and connect with the community.

## ✨ Features

- **Submit Problems:** easy-to-use form to report issues regarding Academics, Administration, Campus Facilities, Finance/Fees, and Wellbeing.
- **Track Status:** Unique reference ID generated for every submission for easy tracking.
- **Community:** A space to connect and view community initiatives (Coming Soon).
- **Responsive Design:** Mobile-friendly interface built with modern web standards.

## 🛠️ Tech Stack

**Frontend:**
- [React](https://reactjs.org/) (v19)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- CSS (Vanilla)

**Backend:**
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) (with Mongoose)

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (Ensure MongoDB is running locally or have a connection string ready)

### 📥 1. Clone the Repository

```bash
git clone https://github.com/yourusername/studentz-bangalore.git
cd studentz-bangalore
```

### 🔙 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

**Configuration:**
Create a `.env` file in the `backend` directory (optional if using defaults):

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/studentz-bangalore
```

Start the backend server:

```bash
# For development (requires nodemon)
npm run dev

# OR for production
npm start
```

The server will run on `http://localhost:4000`.

### 🎨 3. Frontend Setup

Open a new terminal, navigate to the root directory (where `vite.config.js` is located), and install dependencies:

```bash
# context: root directory
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

```
bangolore/
├── backend/               # Express backend
│   ├── models/            # Mongoose models
│   ├── server.js          # Server entry point
│   └── package.json       # Backend dependencies
├── src/                   # React source code
│   ├── assets/            # Static assets
│   ├── App.jsx            # Main application component
│   ├── App.css            # Global styles
│   ├── community.jsx      # Community page component
│   └── main.jsx           # React entry point
├── public/                # Static public files
├── index.html             # HTML entry point
├── package.json           # Frontend dependencies
└── vite.config.js         # Vite configuration
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## 📄 License

This project is licensed under the MIT License.
