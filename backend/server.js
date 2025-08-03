const express = require('express');
const cors = require('cors'); // <-- Make sure this line exists
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables from .env file
require('dotenv').config();

const app = express();
const port = 3000;

// Correct CORS configuration
app.use(cors({
  origin: 'http://localhost:4200' // This is the most important part
}));

app.use(express.json());

// Configure Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint for the research assistant feature
app.post('/api/research', async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'No research topic provided.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Act as a professional research assistant. Provide a detailed and well-structured summary on the following topic. The response should be easy to read with clear headings and bullet points where appropriate.
    
    Topic: ${topic}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textContent = response.text().trim();

    res.status(200).json({ content: textContent });
  } catch (error) {
    console.error('Error generating research content:', error);
    res.status(500).json({ error: 'Failed to generate research content.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});