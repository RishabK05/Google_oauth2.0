const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUrl = process.env.REDIRECT_URI;

const authorizationUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=https://www.googleapis.com/auth/drive.apps.readonly`;

app.get('/', (req, res) => {
  res.redirect(authorizationUrl);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUrl,
      grant_type: 'authorization_code'
    });

    const accessToken = data.access_token;

    try {
      const { data: appsResponse } = await axios.get('https://www.googleapis.com/drive/v2/apps', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const appsList = appsResponse.items;
      console.log(appsList);

      res.render('index', { appsList });
    } catch (error) {
      console.error('Error retrieving authorized applications:', error);
      res.status(500).send('Error retrieving authorized applications');
    }
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).send('Error during OAuth callback');
  }
});

// Error handling routes
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).send('Internal server error');
});

app.set('view engine', 'ejs');

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
