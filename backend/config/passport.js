const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    if (user) return done(null, user);

    // Check if email already registered normally
    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.googleId = profile.id;
      user.avatar = profile.photos?.[0]?.value || '';
      await user.save();
      return done(null, user);
    }

    // Build a safe username from displayName or email
    const baseUsername = (profile.displayName || profile.emails[0].value.split('@')[0])
      .replace(/\s+/g, '_')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    // Create brand new user
    user = new User({
      googleId: profile.id,
      username: baseUsername + '_' + Date.now().toString().slice(-4),
      email: profile.emails[0].value,
      avatar: profile.photos?.[0]?.value || '',
      password: Math.random().toString(36)
    });

    await user.save();
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;