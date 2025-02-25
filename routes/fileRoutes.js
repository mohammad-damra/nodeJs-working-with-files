const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const router = express.Router();

// Helper function to get absolute file path (prevents path traversal attacks)
const getFilePath = (fileName) =>
  path.join(__dirname, "..", "storage", path.basename(fileName));
// for better validation
const isValidPdf = (fileName) =>
  path.extname(fileName).toLowerCase() === ".pdf";

router.get("/read", async (req, res) => {
  const fileName = req.query.fileName;

  if (!isValidPdf(fileName)) {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }
  try {
    const data = await fs.readFile(getFilePath(fileName));
    const pdfDoc = await PDFDocument.load(data);
    const textContent = await pdfDoc.getText();
    res.json({ content: textContent });
  } catch (err) {
    res.status(404).json({ error: "PDF file not found or cannot be read" });
  }
});

router.post("/append", async (req, res) => {
  const { fileName, content } = req.body;
  if (!isValidPdf(fileName)) {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }
  try {
    const filePath = getFilePath(fileName);
    const existingPdfBytes = await fs.readFile(filePath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.addPage();
    page.drawText(content, { x: 50, y: 750 });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(filePath, pdfBytes);
    res.json({ message: "Content appended successfully to PDF" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/rename", async (req, res) => {
  const { oldName, newName } = req.body;

  if (!isValidPdf(oldName) || !isValidPdf(newName)) {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  const oldFilePath = getFilePath(oldName);
  const newFilePath = getFilePath(newName);

  try {
    // Check if the old file exists
    await fs.access(oldFilePath);

    // Rename the file
    await fs.rename(oldFilePath, newFilePath);
    res.json({ message: "PDF file renamed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/create-dir", async (req, res) => {
  const { dirName } = req.body;

  if (!dirName) {
    return res.status(400).json({ error: "Directory name is required" });
  }

  const dirPath = getFilePath(dirName);

  try {
    await fs.mkdir(dirPath, { recursive: true }); // Creates nested directories if needed
    res.json({ message: "Directory created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete-dir", async (req, res) => {
  const { dirName } = req.query;

  if (!dirName) {
    return res.status(400).json({ error: "Directory name is required" });
  }

  const dirPath = getFilePath(dirName);

  try {
    await fs.rm(dirPath, { recursive: true, force: true }); // Deletes even if it's not empty
    res.json({ message: "Directory deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/write", async (req, res) => {
  const { fileName, content } = req.body;
  if (!isValidPdf(fileName)) {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(content, { x: 50, y: 750 });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(getFilePath(fileName), pdfBytes);
    res.json({ message: "PDF file written successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete", async (req, res) => {
  const fileName = req.query.fileName;

  if (!isValidPdf(fileName)) {
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
