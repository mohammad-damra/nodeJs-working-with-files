const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const pdf = require("pdf-parse");
const router = express.Router();

// Helper function to get absolute file path (prevents path traversal attacks)
const getFilePath = (fileName) =>
  path.join(__dirname, "..", "storage", path.basename(fileName));

// Middleware to check if the file is a PDF
const isPDF = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  return ext === ".pdf";
};

// Read PDF file
router.get("/read", async (req, res) => {
  try {
    const fileName = req.query.fileName;
    if (!isPDF(fileName)) {
      return res.status(400).json({ error: "Only PDF files are supported" });
    }

    const filePath = getFilePath(fileName);
    const dataBuffer = await fs.readFile(filePath); // Read the PDF file as binary data

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`); // Display in the browser
    res.send(dataBuffer); // Send the binary data
  } catch (err) {
    console.error("Error reading file:", err.message);
    res.status(404).json({ error: "File not found or could not be parsed" });
  }
});
// Write a new PDF file
router.post("/write", async (req, res) => {
  const { fileName, content } = req.body;

  if (!isPDF(fileName)) {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  try {
    const filePath = getFilePath(fileName);

    // Create a new PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(content, { x: 50, y: 750, size: 12 });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(filePath, pdfBytes);

    res.json({ message: "PDF file written successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Rename a PDF file
router.put("/rename", async (req, res) => {
  const { oldName, newName } = req.body;

  if (!isPDF(oldName) || !isPDF(newName)) {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  const oldFilePath = getFilePath(oldName);
  const newFilePath = getFilePath(newName);

  try {
    await fs.access(oldFilePath); // Check if the old file exists
    await fs.rename(oldFilePath, newFilePath);
    res.json({ message: "PDF file renamed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a PDF file
router.delete("/delete", async (req, res) => {
  const fileName = req.query.fileName;

  if (!isPDF(fileName)) {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  try {
    await fs.unlink(getFilePath(fileName));
    res.json({ message: "PDF file deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
