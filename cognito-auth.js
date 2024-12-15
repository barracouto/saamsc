/*global SaaMsc _config AmazonCognitoIdentity AWSCognito*/

var SaaMsc = window.SaaMsc || {};

(function scopeWrapper($) {
    var signinUrl = '/signin.html';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    SaaMsc.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    SaaMsc.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });


    /*
     * Cognito User Pool functions
     */

    function register(username, password, onSuccess, onFailure) {
        var dataUsername = {
            Name: 'preferred_username',
            Value: username
        };
        var attributeUsername = new AmazonCognitoIdentity.CognitoUserAttribute(dataUsername);

        userPool.signUp(username, password, [attributeUsername], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(username, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password
        });

        var cognitoUser = createCognitoUser(username);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(username, code, onSuccess, onFailure) {
        createCognitoUser(username).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(username) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: username,
            Pool: userPool
        });
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signin-form').on('submit', handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
    });

    function handleSignin(event) {
        var username = $('#usernameInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        signin(username, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = 'upload.html';
            },
            function signinError(err) {
                alert(err.message || JSON.stringify(err));
            }
        );
    }

    function handleRegister(event) {
        var username = $('#usernameInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err.message || JSON.stringify(err));
        };
        event.preventDefault();

        if (password === password2) {
            register(username, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }
    
    // Display the current user's username in the header
    document.addEventListener("DOMContentLoaded", () => {
        const cognitoUser = userPool.getCurrentUser();
    
        if (cognitoUser) {
            // Display the logged-in user's username in the header
            document.getElementById("current-user").textContent = cognitoUser.getUsername();
        } else {
            console.warn("No logged-in user found.");
            document.getElementById("current-user").textContent = "Guest";
        }
    });
    
    // Handle the sign-out process
    document.getElementById("sign-out")?.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior
    
        const cognitoUser = userPool.getCurrentUser();
    
        if (cognitoUser) {
            // Use Cognito's signOut method to clear the local session
            cognitoUser.signOut();
            console.log("Cognito session ended.");
        } else {
            console.warn("No Cognito user found.");
        }
    
        // Clear app session and redirect
        sessionStorage.clear();
        window.location.href = "signin.html"; // Redirect to the login page
    });

    function handleVerify(event) {
        var username = $('#usernameInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(username, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err.message || JSON.stringify(err));
            }
        );
    }
}(jQuery));
