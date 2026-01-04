# Plantilizer

Plantilizer is an AI-powered web application designed to be your personal plant care companion. By simply uploading an image of a plant, Plantilizer uses Google's advanced Gemini 1.5 Flash model to instantly identify the species, assess its health, and provide tailored care recommendations. Whether you're a seasoned gardener or a new plant parent, Plantilizer helps you understand your plants better. You can even generate and download a professional PDF report of the analysis to keep as a record.

## Features
- Instant Identification: accurate plant identification using generative AI.
- Health Analysis: Detect plant diseases or health issues from images.
- Care Recommendations: Get specific advice on watering, sunlight, and soil requirements.
- PDF Reports: Generate and download a beautifully formatted PDF report of the analysis.
- Interactive UI: Clean and modern interface for easy interaction.

## Tech Stack
- Backend: Node.js, Express.js
- AI Model: Google Gemini 1.5 Flash (@google/generative-ai)
- File Handling: Multer (image uploads), PDFKit (report generation)
- Frontend: HTML, CSS, JavaScript

## Prerequisites
Before running the application, ensure you have the following installed:
- Node.js (v14 or higher recommended)
- An API Key for Google Gemini API. Get it here (https://aistudio.google.com/app/apikey).

## Installation
1. Clone the repository:
```bash
git clone https://github.com/ash29032006/PLANLTIZER.git
cd PLANLTIZER
```
2. Install dependencies:
```bash
npm install
```
*Note: If package.json is missing, you can set it up manually:*
```bash
npm init -y
npm install express dotenv multer pdfkit @google/generative-ai
```
3. Configure Environment:
Create a .env file in the root directory and add your API credentials:
```env
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5001
```

## Usage
1. Start the server:
```bash
node app.js
# Or with watch mode for development:
node --watch app.js
```
2. Access the App:
Open your browser and navigate to:
```
http://localhost:5001
```
3. Analyze a Plant:
- Click the upload button to select a plant image.
- Wait for the AI to analyze the image.
- View the results and download the PDF report if desired.

## Project Structure
```
PLANLTIZER/
├── public/          # Frontend files (HTML, CSS, JS)
├── reports/         # Generated PDF reports
├── upload/          # Temporary storage for uploaded images
├── app.js           # Main server application
└── README.md        # Project documentation
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
