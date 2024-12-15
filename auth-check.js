// auth-check.js

document.addEventListener("DOMContentLoaded", () => {
    const cognitoUser = userPool.getCurrentUser(); // Check if a user is logged in

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
