const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
const ejs = require('ejs');
require('dotenv').config();

const app = express();

app.use(session({
  secret: 'your_session_secret',
  resave: true,
  saveUninitialized: true
}));

// Set up Passport.js
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.REDIRECT_URI
}, (accessToken, refreshToken, profile, done) => {
  // Make the API request to retrieve Drive apps
  axios.get('https://www.googleapis.com/drive/v2/apps', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then(response => {
      const driveApps = response.data.items; 
      done(null, driveApps); 
    })
    .catch(error => {
      done(error); 
    });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

// Routes
app.get('/', passport.authenticate('google', { scope: ['profile', 'https://www.googleapis.com/auth/drive.apps.readonly'] }));

app.get('/auth/callback', passport.authenticate('google', {
  successRedirect: '/drive-apps', 
  failureRedirect: '/login' 
}));

app.get('/drive-apps', (req, res) => {
  const driveApps = req.user;
  res.render('drive-apps', { driveApps });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
