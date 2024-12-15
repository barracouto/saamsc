// Cognito Authentication and API Gateway Integration
const AWS_REGION = "us-east-1"; // Replace with your AWS region
const USER_POOL_ID = "your-user-pool-id"; // Replace with your Cognito User Pool ID
const CLIENT_ID = "your-client-id"; // Replace with your Cognito App Client ID
const API_GATEWAY_URL = "https://api.example.com/get-presigned-url"; // Replace with your API Gateway URL



  // Handle File Upload
  document.getElementById("upload-button").addEventListener("click", async () => {
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];

    if (file) {
      try {
        // Get presigned URL from API Gateway
        const response = await fetch(API_GATEWAY_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("idToken")}`,
          },
          body: JSON.stringify({ fileName: file.name, fileType: file.type }),
        });

        if (!response.ok) {
          throw new Error("Failed to get presigned URL");
        }

        const { uploadUrl } = await response.json();

        // Upload file to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (uploadResponse.ok) {
          document.getElementById("upload-status").textContent =
            "Upload successful!";
        } else {
          throw new Error("Upload failed");
        }
      } catch (err) {
        console.error(err);
        document.getElementById("upload-status").textContent =
          "Upload failed. Please try again or contact support.";
      }
    } else {
      alert("Please select a file to upload.");
    }
  });

