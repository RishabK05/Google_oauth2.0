# Google_oauth2.0
Google auth2.0

The code is an example of a Node.js application using the Express framework to handle HTTP requests. 
It demonstrates the OAuth2 authorization flow to retrieve a user's authorized third-party applications from the Google Drive API and display the list of apps on a web page.

Here's a breakdown of the code:

1) Import express, axios and ejs

2) Define the OAuth2 parameters in a .env file:
    A) clientId: Your client ID obtained from the Google API Console.
    B) clientSecret: Your client secret obtained from the Google API Console.
    C) redirectUrl: The URL to redirect to after the OAuth2 authorization process.
These above parameters will be found on the Google API console. They can be accessed by creating a new OAuth 2.0 Client ID. 
https://www.googleapis.com/auth/drive.apps.readonly API has to be enabled in the OAuth Consent screen.


Inside the callback route, exchange the authorization code for an access token by sending a POST request to the Google token endpoint (https://oauth2.googleapis.com/token). The access token is used to authenticate subsequent requests to the Google Drive API.

A GET request is made to https://www.googleapis.com/drive/v2/apps using Axios. Included the access token in the request headers to authorize the request.

Start the Express application and listen on port 3000.
