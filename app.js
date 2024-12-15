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
      // Step 1: Request Presigned URL
      statusMessage.textContent = "Requesting upload URL...";
      console.log("Requesting presigned URL...");
      
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
      console.log("API Gateway Response:", jsonResponse);

      const { url } = jsonResponse;
      if (!url) {
        throw new Error("Received invalid presigned URL!");
      }

      // Step 2: Upload file to S3 using PUT request
      statusMessage.textContent = "Uploading file...";
      console.log(`Uploading file to presigned URL: ${url}`);

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      
      // Content-Type only, no other headers for S3 PUT
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          progressBar.style.width = `${percentComplete}%`;
          progressBar.textContent = `${percentComplete}%`;
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          progressBar.style.width = "100%";
          progressBar.textContent = "100%";
          statusMessage.textContent = "Upload successful!";
          console.log("File uploaded successfully!");
        } else {
          console.error("S3 PUT request failed with status:", xhr.status);
          statusMessage.textContent = "Upload failed during S3 PUT operation.";
        }
      };

      xhr.onerror = () => {
        console.error("S3 PUT request error:", xhr.statusText);
        statusMessage.textContent = "Upload failed. Network error.";
      };

      xhr.send(file);
    } catch (err) {
      console.error("Error:", err.message);
      statusMessage.textContent = "Upload failed. Please try again.";
    }
  } else {
    alert("Please select a file to upload.");
  }
});
