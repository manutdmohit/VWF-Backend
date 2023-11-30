const passport = require('passport');
const bcrypt = require('bcrypt');

const User = require('./models/User');

const LocalStrategy = require('passport-local').Strategy;

exports.initializingPassport = (passport) => {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });

        if (!user) {
          console.log('Strategy: User not found');
          return done(null, false, { message: 'Incorrect username' });
        }

        const passwordMatch = bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);
      } catch (error) {
        console.error('Strategy: Error during authentication', error);
        return done(error);
      }
    })
  );
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      // User not found
      return done(null, false);
    }

    // Deserialization successful
    done(null, user);
  } catch (error) {
    done(error);
  }
});

exports.isAuthenticated = (req, res, next) => {
  if (req.user) return next();

  res.redirect('/login');
};

exports.ensureAuthenticated = (req, res, next) => {
  // Access the connect.sid cookie from the request object
  const connectSidCookie = req.cookies['connect.sid'];

  // Log the cookie value
  console.log('connect.sid cookie:', connectSidCookie);

  if (req.isAuthenticated()) return next();

  res.status(401).json({ message: 'Unauthorized' });
};
