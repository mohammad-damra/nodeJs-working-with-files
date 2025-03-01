const apiUrl = "http://localhost:3000/api";

// Helper function to display messages
function showMessage(elementId, message, isError = false) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = isError ? "red" : "green";
}

// Read PDF file
async function readFile() {
  const fileName = document.getElementById("readFileName").value;

  if (!fileName.endsWith(".pdf")) {
    alert("Only PDF files are allowed");
    return;
  }

  try {
    const filePath = `${apiUrl}/read?fileName=${fileName}`;
    const pdfViewer = document.getElementById("pdfViewer");

    // Set the iframe source to the PDF file URL
    pdfViewer.src = filePath;
  } catch (error) {
    console.error("Error:", error.message);
    alert("Failed to load PDF file");
  }
}

// Write PDF file
async function writeFile() {
  const fileName = document.getElementById("writeFileName").value;
  const content = document.getElementById("writeContent").value;

  if (!fileName.endsWith(".pdf")) {
    alert("Only PDF files are allowed");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, content }),
    });

    if (!response.ok) {
      throw new Error("Failed to write file");
    }

    alert("PDF file written successfully");
  } catch (error) {
    alert(error.message);
  }
}
// Append to PDF file
async function appendFile() {
  const fileName = document.getElementById("appendFileName").value;
  const content = document.getElementById("appendContent").value;

  if (!fileName.endsWith(".pdf")) {
    alert("Only PDF files are allowed");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/append`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, content }),
    });
    if (!response.ok) {
      throw new Error("Failed to append to file");
    }
    alert("Content appended successfully");
  } catch (error) {
    alert(error.message);
  }
}

// Delete PDF file
async function deleteFile() {
  const fileName = document.getElementById("deleteFileName").value;
  if (!fileName.endsWith(".pdf")) {
    alert("Only PDF files are allowed");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/delete?fileName=${fileName}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete file");
    }
    alert("PDF file deleted successfully");
  } catch (error) {
    alert(error.message);
  }
}

// Rename PDF file
async function renameFile() {
  const oldName = document.getElementById("oldFileName").value;
  const newName = document.getElementById("newFileName").value;

  if (!oldName.endsWith(".pdf") || !newName.endsWith(".pdf")) {
    alert("Only PDF files are allowed");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldName, newName }),
    });
    if (!response.ok) {
      throw new Error("Failed to rename file");
    }
    alert("PDF file renamed successfully");
  } catch (error) {
    alert(error.message);
  }
}

// Create directory
async function createDirectory() {
  const dirName = document.getElementById("createDirName").value;
  try {
    const response = await fetch(`${apiUrl}/create-dir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dirName }),
    });
    if (!response.ok) {
      throw new Error("Failed to create directory");
    }
    alert("Directory created successfully");
  } catch (error) {
    alert(error.message);
  }
}

// Delete directory
async function deleteDirectory() {
  const dirName = document.getElementById("deleteDirName").value;
  try {
    const response = await fetch(`${apiUrl}/delete-dir?dirName=${dirName}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete directory");
    }
    alert("Directory deleted successfully");
  } catch (error) {
    alert(error.message);
  }
}
