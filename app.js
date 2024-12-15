const API_GATEWAY_URL = "https://z0uqpw0kcg.execute-api.us-east-1.amazonaws.com"; // Replace with your API Gateway URL

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

  if (file) {
    try {
      // Get presigned URL from API Gateway
      statusMessage.textContent = "Requesting upload URL...";
      const response = await fetch(API_GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("idToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!response.ok) {
        throw new Error("Failed to get presigned URL");
      }

      const { uploadUrl } = await response.json();

      // Upload file to S3
      statusMessage.textContent = "Uploading file...";
      const uploadResponse = await fetch(uploadUrl, {
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

// Optional: Progress bar simulation (not required for S3 PUT but enhances UX)
function simulateProgress() {
  const progressBar = document.getElementById("progress-bar");
  let progress = 0;
  const interval = setInterval(() => {
    if (progress >= 100) {
      clearInterval(interval);
    } else {
      progress += 10;
      progressBar.style.width = progress + "%";
      progressBar.textContent = progress + "%";
    }
  }, 100); // Simulates progress every 100ms
}
