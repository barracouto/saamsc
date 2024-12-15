// auth-check.js

// Ensure AWS Cognito SDK and configuration (_config) are loaded before this script

// Function to redirect to the Access Denied page
function redirectToAccessDenied() {
    window.location.href = "accessdenied.html"; // Redirect to Access Denied page
}

document.addEventListener("DOMContentLoaded", () => {
    try {
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
                    // Clear stored user data and redirect
                    sessionStorage.clear();
                    redirectToAccessDenied();
                } else {
                    console.log("Session is valid.");
                }
            });
        } else {
            console.warn("No user session found.");
            redirectToAccessDenied();
        }
    } catch (error) {
        console.error("Error during auth check:", error);
        redirectToAccessDenied(); // Redirect on failure
    }
});
