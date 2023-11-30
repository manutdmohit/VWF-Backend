require('dotenv').config();
require('express-async-errors');

const express = require('express');
const passport = require('passport');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const mongoose = require('mongoose');

const { connectMongoose } = require('./db/conn');

const userRouter = require('./routes/userRoutes');

const User = require('./models/User');
const {
  initializingPassport,
  isAuthenticated,
  ensureAuthenticated,
} = require('./passportConfig');

const app = express();

const PORT = process.env.PORT || 8000;

const corsOptions = {
  origin: 'http://localhost:5500', // Replace with the actual origin of your frontend
  credentials: true, // Enable credentials (cookies) in the CORS request
};

app.use(cors(corsOptions));

initializingPassport(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  expressSession({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,

    store: new MongoStore({
      mongoUrl: 'mongodb://127.0.0.1:27017/passport',
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

app.get('/register', (req, res) => res.render('register'));

// Use the middleware for the /check-auth route

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
  passport.authenticate('local', {
    failureRedirect: 'http://localhost:5500/admin.html',
    successRedirect: 'http://localhost:5500/dashboard.html',
  }),
  async (req, res) => {}
);

app.get('/profile', isAuthenticated, (req, res) => {
  const { name, username, id } = req.user;
  res.send({ name, email: username, id });
});

app.get('/logout', function (req, res, next) {
  req.logout(function (err) {
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
