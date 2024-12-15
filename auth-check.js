// auth-check.js

// Ensure AWS Cognito SDK and configuration (_config) are loaded before this script

document.addEventListener("DOMContentLoaded", () => {
    // Reinitialize the user pool
    const poolData = {
        UserPoolId: _config.cognito.userPoolId, // Cognito User Pool ID
        ClientId: _config.cognito.userPoolClientId, // Cognito App Client ID
    };

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    // Check if the user is logged in
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
        // Verify session validity
        cognitoUser.getSession((err, session) => {
            if (err || !session.isValid()) {
                console.warn("Session is invalid or expired.");
                redirectToAccessDenied();
            }
        });
    } else {
        console.warn("No user session found.");
        redirectToAccessDenied();
    }
});

// Function to redirect to the Access Denied page
function redirectToAccessDenied() {
    window.location.href = "accessdenied.html"; // Redirect to access denied page
}
