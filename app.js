require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();


// Database
async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing MONGODB_URI in .env');
    }

    let uri;

    if (process.env.NODE_ENV === 'test') {
      uri = process.env.MONGODB_URI_TEST;
    } else {
      uri = process.env.MONGODB_URI;
    }

    await mongoose.connect(uri);

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

connectDB();

// View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware

// Parse form data (EJS forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON (API)
app.use(express.json());

const methodOverride = require('method-override');

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
  if (req.query && req.query._method) {
    return req.query._method;
  }
}));

// Static files (CSS, images, client JS)
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_later',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
);


app.use((req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  next();
});


// Page routes (EJS)
const authPagesRoutes = require('./routes/pages/auth.routes');
const journeysPagesRoutes = require('./routes/pages/journeys.routes');
const adminPagesRoutes = require('./routes/pages/admin.routes');
const homeRoutes = require('./routes/pages/home.routes');

// API routes (JSON)
const authApiRoutes = require('./routes/api/auth.routes');
const journeysApiRoutes = require('./routes/api/journeys.routes');
const modesApiRoutes = require('./routes/api/modes.routes');
const usersApiRoutes = require('./routes/api/users.routes');

// Root: redirect to login
app.get('/', (req, res) => {
    return res.redirect('/login');
});

// Pages
app.use('/', authPagesRoutes);         
app.use('/home', homeRoutes);           
app.use('/journeys', journeysPagesRoutes);
app.use('/admin', adminPagesRoutes);

// APIs
app.use('/api/auth', authApiRoutes);
app.use('/api/journeys', journeysApiRoutes);
app.use('/api/modes', modesApiRoutes);
app.use('/api/users', usersApiRoutes);

//Errors

app.use((req, res) => {
  return res.status(404).send('404 Not Found');
});

// Error handler (fallback)
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }

  return res.status(500).send('500 Server Error');``
});


// Start server
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;