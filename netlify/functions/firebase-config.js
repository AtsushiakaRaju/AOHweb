// This function runs on Netlify's servers, not in the user's browser.
// It can securely access the environment variables you set in the Netlify UI.

exports.handler = async function(event, context) {
    
    // We are sending the public Firebase config keys to the front-end.
    // process.env.VARIABLE_NAME is how we access the keys.
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };

    return {
        statusCode: 200,
        body: JSON.stringify(firebaseConfig)
    };
};
