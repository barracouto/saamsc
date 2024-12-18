const API_GATEWAY_URL = "https://m2fb5z7rqi.execute-api.us-east-1.amazonaws.com/dev";

document.getElementById("upload-button").addEventListener("click", async () => {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];
  const progressBar = document.getElementById("progress-bar");
  const statusMessage = document.getElementById("upload-status");

  progressBar.style.width = "0%";
  progressBar.textContent = "0%";
  statusMessage.textContent = "";

  const idToken = sessionStorage.getItem("idToken");
  if (!idToken) {
    alert("You are not logged in. Please log in to upload files.");
    return;
  }

  if (file) {
    try {
      // Step 1: Request presigned URL
      statusMessage.textContent = "Requesting upload URL...";
      console.log("Requesting presigned URL for file:", file.name);

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
        const errorBody = await response.text();
        console.error("Failed to get presigned URL. Response:", errorBody);
        throw new Error("Failed to get presigned URL");
      }

      const jsonResponse = await response.json();
      const body = typeof jsonResponse.body === "string" ? JSON.parse(jsonResponse.body) : jsonResponse;
      const { url, contentType } = body;

      console.log("Received presigned URL:", url);

      // Step 2: Upload file to S3
      statusMessage.textContent = "Uploading file...";
      console.log(`Uploading file "${file.name}" to presigned URL: ${url}`);

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);

      // Explicitly set required headers
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.setRequestHeader("x-amz-server-side-encryption", "AES256");

      console.log("Sending file data to S3 with Content-Type and encryption headers...");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          progressBar.style.width = `${percentComplete}%`;
          progressBar.textContent = `${percentComplete}%`;
        }
      };

      xhr.onload = () => {
        console.log("S3 PUT Response Status:", xhr.status);
        if (xhr.status === 200) {
          progressBar.style.width = "100%";
          progressBar.textContent = "100%";
          statusMessage.textContent = "Upload successful!";
          console.log("File uploaded successfully.");
        } else {
          console.error(`S3 PUT request failed. Status: ${xhr.status}`);
          statusMessage.textContent = `Upload failed. Status: ${xhr.status}`;
        }
      };

      xhr.onerror = () => {
        console.error("Network error during S3 PUT request.");
        statusMessage.textContent = "Upload failed due to network error.";
      };

      xhr.send(file);
    } catch (err) {
      console.error("Error:", err.message);
      statusMessage.textContent = `Upload failed. ${err.message}`;
    }
  } else {
    alert("Please select a file to upload.");
  }
});
