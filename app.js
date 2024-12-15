const API_GATEWAY_URL = "https://m2fb5z7rqi.execute-api.us-east-1.amazonaws.com/dev";

document.getElementById("upload-button").addEventListener("click", async () => {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];
  const progressBar = document.getElementById("progress-bar");
  const statusMessage = document.getElementById("upload-status");

  progressBar.style.width = "0%";
  progressBar.textContent = "";
  statusMessage.textContent = "";

  const idToken = sessionStorage.getItem("idToken");
  if (!idToken) {
    alert("You are not logged in. Please log in to upload files.");
    return;
  }

  if (file) {
    try {
      statusMessage.textContent = "Requesting upload URL...";
      console.log("Requesting presigned URL...");
      console.log("Request headers:", {
        Authorization: `${idToken}`,
        "Content-Type": "application/json",
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

      console.log("API Gateway Response:", response);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed Response Body:", errorBody);
        throw new Error("Failed to get presigned URL");
      }

      const jsonResponse = await response.json();
      console.log("API Gateway JSON Response:", jsonResponse);

      const { url } = jsonResponse;
      if (!url) {
        throw new Error("Received invalid presigned URL!");
      }

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
      console.error("Error:", err.message);
      statusMessage.textContent = "Upload failed. Please try again.";
    }
  } else {
    alert("Please select a file to upload.");
  }
});
