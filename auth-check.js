// auth-check.js

// Function to redirect to the Access Denied page
function redirectToAccessDenied() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "accessdenied.html"; // Redirect to Access Denied page
}

// Force a page reload when loaded from browser cache
window.addEventListener("pageshow", (event) => {
    if (event.persisted) { // If the page is loaded from the browser cache
        console.log("Page loaded from cache. Forcing reload...");
        window.location.reload(true); // Force reload, bypass cache
    }
});

document.addEventListener("DOMContentLoaded", () => {
    try {
        const poolData = {
            UserPoolId: _config.cognito.userPoolId, // Cognito User Pool ID
            ClientId: _config.cognito.userPoolClientId, // Cognito App Client ID
        };

        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

        const cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession((err, session) => {
                if (err || !session.isValid()) {
                    console.warn("Session is invalid or expired.");
                    redirectToAccessDenied();
                } else {
                    console.log("Session is valid.");

                    // Store idToken in sessionStorage
                    const idToken = session.getIdToken().getJwtToken();
                    sessionStorage.setItem("idToken", idToken);

                    // Log the idToken for debugging
                    console.log("idToken stored in sessionStorage:", idToken);

                    // Optionally display the username on the page
                    cognitoUser.getUserAttributes((err, attributes) => {
                        if (!err) {
                            const username = attributes.find(attr => attr.Name === "email")?.Value || cognitoUser.getUsername();
                            document.getElementById("current-user").textContent = username;
                        }
                    });
                }
            });
        } else {
            console.warn("No user session found.");
            redirectToAccessDenied();
        }
    } catch (error) {
        console.error("Error during auth check:", error);
        redirectToAccessDenied();
    }
});
