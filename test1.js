const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUrl = process.env.REDIRECT_URI;

const authorizationUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=https://mail.google.com/`;

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
    console.log(data);

    try {
      // Step 1: Fetch the list of messages
      const messagesResponse = await axios.get('https://gmail.googleapis.com/gmail/v1/users/rishab.khandelwal27@gmail.com/messages', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          q: 'in:inbox -from:me',
          maxResults: 10 
        }
      });

      const messages = messagesResponse.data.messages;

      // Step 2: Iterate through the messages and process only the first email in each thread
      for (const message of messages) {
        const messageResponse = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/rishab.khandelwal27@gmail.com/messages/${message.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        const threadId = messageResponse.data.threadId;
        const email = messageResponse.data.payload.headers.find(header => header.name === 'From').value;

        // Check if the thread has any previous email sent by you
        const threadResponse = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/rishab.khandelwal27@gmail.com/threads/${threadId}/messages`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        const threadMessages = threadResponse.data.messages;
        const hasReplyFromYou = threadMessages.some(threadMessage => threadMessage.labelIds.includes('SENT') && threadMessage.from.emailAddress === email);

        // If no reply from you is found, send a reply
        if (!hasReplyFromYou) {
          // Step 3: Send a reply email
          const replyMessage = {
            to: email,
            subject: 'Auto Reply',
            message: 'Thank you for your email. I am currently on vacation and will respond to your inquiry when I return.'
          };

          // Implement the code to send the reply email using the Gmail API (you can refer to the previous response code for sending emails)

          // Step 4: Add a label and move the email
          const labelName = 'Vacation Reply'; 

          // Check if the label already exists, and if not, create it
          const labelsResponse = await axios.get('https://gmail.googleapis.com/gmail/v1/users/rishab.khandelwal27@gmail.com/labels', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

          const labels = labelsResponse.data.labels;
          const label = labels.find(label => label.name === labelName);

          if (!label) {
            const createLabelResponse = await axios.post('https://gmail.googleapis.com/gmail/v1/users/rishab.khandelwal27@gmail.com/labels', {
              name: labelName,
              labelListVisibility: 'labelShow',
              messageListVisibility: 'show'
            }, {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });

            console.log('Label created:', createLabelResponse.data);
          }

          // Apply the label to the replied email
          const modifyRequest = {
            addLabelIds: [label.id],
            removeLabelIds: []
          };

          const modifyResponse = await axios.post(`https://gmail.googleapis.com/gmail/v1/users/rishab.khandelwal27@gmail.com/messages/${message.id}/modify`, modifyRequest, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

          console.log('Email labeled and moved:', modifyResponse.data);
        }
      }

      res.send('Vacation auto-reply process completed.');

    } catch (error) {
      console.error('Error processing messages:', error);
      res.status(500).send('Error processing messages');
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


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
