const express = require('express');
const axios = require('axios');

const app = express();

const clientId = '909979546267-0amk3tf9g190gddue9vpuufhg1gjnqcr.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUrl = 'http://localhost:3000/auth/callback';

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

    const { data: appsResponse } = await axios.get('https://www.googleapis.com/drive/v2/apps', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const appsList = appsResponse.items;
    console.log(appsList);

    res.render('index', { appsList });
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.sendStatus(500);
  }
});

app.set('view engine', 'ejs');

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
