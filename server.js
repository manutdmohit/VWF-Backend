require('dotenv').config();
require('express-async-errors');

const express = require('express');
const passport = require('passport');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

const { connectMongoose } = require('./db/conn');

const {
  jwtSecret,
  jwtOptions,
  ensureAuthenticated,
} = require('./passportConfig');

const userRouter = require('./routes/userRoutes');
const galleryRouter = require('./routes/galleryRoutes');
const contactRouter = require('./routes/contactRoutes');
const postRouter = require('./routes/postRoutes');

const User = require('./models/User');

const app = express();

const PORT = 8000;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const corsOptions = {
  origin: process.env.FRONTEND_URL, // Replace with the actual origin of your frontend
  credentials: true, // Enable credentials (cookies) in the CORS request
};

app.use(cors(corsOptions));
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: new MongoStore({
      mongoUrl: process.env.MONGO_URI,
      mongooseConnection: mongoose.connection,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Use the middleware for the /check-auth route
app.get('/check-auth', ensureAuthenticated, (req, res) => {
  try {
    // User is authenticated, return status 200 and authenticated true
    return res.status(200).json({ authenticated: true });
  } catch (error) {
    console.error('Error checking authentication:', error);
    // User is not authenticated, return status 200 and authenticated false
    return res.status(200).json({ authenticated: false });
  }
});

// Dashboard route
app.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    // Fetch the total number of children from the database
    // const totalChildren = await Children.countDocuments();

    res.json({ totalChildren: 20 });
  } catch (error) {
    console.error('Error fetching total children:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/gallery', galleryRouter);
app.use('/api/v1/contacts', contactRouter);
app.use('/api/v1/posts', postRouter);

app.get('/register', (req, res) => res.render('register'));

app.get('/login', (req, res) => res.render('login'));

app.post('/register', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  if (user) return res.status(400).send('User already exists');

  const newUser = await User.create({ ...req.body });

  const { name, username, id } = newUser;

  res.status(201).send({ name, username, id });
});

app.post(
  '/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    // If this function is called, authentication was successful.
    // `req.user` contains the authenticated user.
    const token = jwt.sign({ sub: req.user._id }, jwtSecret, {
      expiresIn: '1h',
    });
    res.send({ token });
  },
  (err, req, res, next) => {
    // This function will be called on authentication failure
    // Handle the failure and send a JSON response
    res.status(401).json({ message: 'Authentication failed' });
  }
);

app.get('/profile', ensureAuthenticated, (req, res) => {
  const { name, username, id } = req.user;
  res.send({ name, email: username, id });
});

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.destroy();

    res.clearCookie('connect.sid');

    res.json('Logged Out');
  });
});

const start = async () => {
  await connectMongoose(`${process.env.MONGO_URI}`);

  app.listen(PORT, console.log(`The server is listening on the port ${PORT}`));
};

start();
