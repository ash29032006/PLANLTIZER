require("dotenv").config();
const express = require("express");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 5001;

/*************  ✨ Codeium Command 🌟  *************/
//configure multer
app.use(express.json({ limit: "50mb" }));
/******  4fff3ba0-2b43-47b0-82de-02c36ade0df7  *******/
const upload = multer({ dest: "upload/" });
app.use(express.json({ limit: "10mb" }));

//initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
app.use(express.static("public"));

//routes
//analyze
app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const imagePath = req.file.path;
    const imageData = await fsPromises.readFile(imagePath, {
      encoding: "base64",
    });

    // Use the Gemini model to analyze the image
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      "Analyze this plant image and provide its Indian name with a detailed analysis of its species , health, and care recommendations, its characteristics, care instructions, and any interesting facts. Please provide the response in plain text without using any markdown formatting.",
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageData,
        },
      },
    ]);

    const plantInfo = result.response.text();

    // Clean up: delete the uploaded file
    await fsPromises.unlink(imagePath);

    // Respond with the analysis result and the image data
    res.json({
      result: plantInfo,
      image: `data:${req.file.mimetype};base64,${imageData}`,
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    res
      .status(500)
      .json({ error: "An error occurred while analyzing the image" });
  }
});

//download pdf
app.post("/download", express.json(), async (req, res) => {
  const { result, image } = req.body;
  try {
    const reportsDir = path.join(__dirname, "reports");
    await fsPromises.mkdir(reportsDir, { recursive: true });

    const filename = `plant_analysis_report_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, filename);
    const writeStream = fs.createWriteStream(filePath);
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 72, left: 72, right: 72, bottom: 72 },
      bufferPages: true // Enable buffering of pages
    });
    doc.pipe(writeStream);

    // Function to add gradient background to a page
    const addBackgroundGradient = () => {
      const gradient = doc.linearGradient(0, 0, 0, doc.page.height);
      gradient.stop(0, '#a8e063').stop(1, '#56ab2f');
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(gradient);
    };

    // Footer with page numbers
    const addFooter = () => {
      const bottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      
      doc.fontSize(10).font('Helvetica').fillColor('#000000');
      doc.text(
        `Page ${doc.page.number}`,
        0,
        doc.page.height - 50,
        { align: "center" }
      );
      
      doc.page.margins.bottom = bottom;
    };

    // Add background gradient and footer to each new page
    doc.on('pageAdded', () => {
      addBackgroundGradient();
    });

    // First page content
    addBackgroundGradient();

    // Header
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#000000').text("Plant Analysis Report", 72, 50);
    doc.moveDown(2);

    // Date
    doc.fontSize(12).font('Helvetica').fillColor('#000000').text(`Date: ${new Date().toLocaleDateString()}`, {
      align: "right"
    });
    doc.moveDown(2);

    // Analysis result
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000').text("Analysis Result", {
      underline: true
    });
    doc.moveDown();

    // Split the result into sections and add content
    const sections = result.split('\n\n');
    sections.forEach((section, index) => {
      const [title, ...content] = section.split('\n');
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text(title);
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').fillColor('#000000').text(content.join('\n'), {
        align: 'justify',
        columns: 1
      });
      if (index < sections.length - 1) {
        doc.moveDown(1.5);
      }
    });

    // Add image after all text content
    if (image) {
      try {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        doc.addPage();
        addBackgroundGradient();
        
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000').text("Analyzed Plant Image", {
          align: 'center'
        });
        doc.moveDown();
        
        doc.image(buffer, {
          fit: [400, 400],
          align: "center"
        });
      } catch (imageError) {
        console.error("Error adding image to PDF:", imageError);
        // Continue without adding the image
      }
    }

    // Add page numbers
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      addFooter();
    }

    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    res.download(filePath, (err) => {
      if (err) {
        console.error("Error downloading the PDF report:", err);
        res.status(500).json({ error: "Error downloading the PDF report" });
      } else {
        fsPromises.unlink(filePath);
      }
    });
  } catch (error) {
    console.error("Error generating PDF report:", error);
    res.status(500).json({ error: "An error occurred while generating the PDF report" });
  }
});

//start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});