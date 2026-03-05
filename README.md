# Guna's Lathe Works & Machining - Full Stack Application

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Gmail account for email functionality

### Backend Setup

1. Navigate to the Backend folder:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with:
   - MongoDB connection string
   - JWT secret key
   - Email credentials
   - Port configuration (5000)

4. Start the backend server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start at `http://localhost:5000`

### Frontend Setup

1. Navigate to the Frontend folder:
```bash
cd Frontend
```

2. Open `index.html` in your browser, or use a local server:

Using Python:
```bash
python -m http.server 3000
```

Using Node.js (http-server):
```bash
npx http-server -p 3000
```

The frontend will be available at `http://localhost:3000`

## Features

### Authentication
- ✅ User registration with password hashing (bcrypt)
- ✅ User login with JWT token generation
- ✅ Token verification and session management
- ✅ Secure password storage
- ✅ Email validation

### Frontend Pages
- ✅ Home page with auto-sliding hero section
- ✅ Products & Services showcase
- ✅ About Us section
- ✅ Why Choose Us section
- ✅ Contact form
- ✅ Login page
- ✅ Signup page

### Functionality
- ✅ Product order button (requires login)
- ✅ Contact form with email notification
- ✅ Responsive design for all devices
- ✅ User session management
- ✅ Logout functionality

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Contact
- `POST /api/contact` - Send contact form email

## Environment Variables

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret-key>
PORT=5000
EMAIL_USER=<your-gmail-address>
EMAIL_PASS=<your-gmail-app-password>
EMAIL_TO=<recipient-email-address>
```

## Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- CORS enabled for secure cross-origin requests
- Input validation on backend
- Token expiration (7 days)

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- bcryptjs
- Nodemailer
- CORS

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API for HTTP requests

## Project Structure

```
Lathe-Website-V2/
├── Backend/
│   ├── server.js
│   ├── package.json
│   └── .env
└── Frontend/
    ├── index.html
    ├── login.html
    ├── signup.html
    ├── styles.css
    ├── script.js
    ├── config.js
    └── Assets/
```

## Usage

1. Start the backend server first (port 5000)
2. Open the frontend in a browser (port 3000 or any other)
3. Register a new account via the Signup page
4. Login with your credentials
5. Explore the website features
6. Click "Order Now" on products (requires login)
7. Use the contact form to send inquiries

## Notes

- Make sure the backend server is running before using login/signup features
- The frontend `config.js` is set to connect to `http://localhost:5000`
- For production, update the API_URL in `config.js` to your deployed backend URL
- Gmail requires an "App Password" for nodemailer (not your regular password)

## Support

For issues or questions, please contact the development team.
