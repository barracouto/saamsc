// auth-check.js

// Function to redirect to the Access Denied page
function redirectToAccessDenied() {
    // Clear localStorage and sessionStorage to ensure full logout
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to Access Denied page
    window.location.href = "accessdenied.html";
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
                    redirectToAccessDenied();
                } else {
                    console.log("Session is valid."); // Debugging
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
