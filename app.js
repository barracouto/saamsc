const API_GATEWAY_URL = "https://m2fb5z7rqi.execute-api.us-east-1.amazonaws.com"; // Replace with your API Gateway URL

// Handle File Upload
document.getElementById("upload-button").addEventListener("click", async () => {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];
  const progressBar = document.getElementById("progress-bar");
  const statusMessage = document.getElementById("upload-status");

  // Reset progress bar and status message
  progressBar.style.width = "0%";
  progressBar.textContent = "";
  statusMessage.textContent = "";

  // Check if user is authenticated
  const idToken = sessionStorage.getItem("idToken");
  if (!idToken) {
    alert("You are not logged in. Please log in to upload files.");
    return;
  }

  if (file) {
    try {
      // Request presigned URL
      statusMessage.textContent = "Requesting upload URL...";
      console.log("Headers being sent:", {
        Authorization: `${idToken}`,
        "Content-Type": "application/json",
      });
      console.log("Request being sent:", {
        URL: API_GATEWAY_URL,
        Method: requestDetails.method,
        Headers: requestDetails.headers,
        Body: requestDetails.body,
      });
      const response = await fetch(API_GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: file.name,
          action: "putObject",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get presigned URL");
      }

      const { url } = await response.json();

      // Upload file to S3
      statusMessage.textContent = "Uploading file...";
      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (uploadResponse.ok) {
        progressBar.style.width = "100%";
        progressBar.textContent = "100%";
        statusMessage.textContent = "Upload successful!";
      } else {
        throw new Error("Upload failed during S3 PUT operation");
      }
    } catch (err) {
      console.error(err);
      statusMessage.textContent =
        "Upload failed. Please try again or contact support.";
    }
  } else {
    alert("Please select a file to upload.");
  }
});
