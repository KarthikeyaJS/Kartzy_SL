import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = 7000;
app.set("view engine", "ejs");

// Define the views directory (optional; default is "./views")
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("index"); // Render 'index.ejs' from the views directory
});

// Google Gemini API setup
const genAI = new GoogleGenerativeAI("<YOUR_API_KEY>"); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(express.static("public")); // Serve static files (e.g., index.html)

app.use(express.json()); // To parse JSON body

// Endpoint to handle the chat prompt
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Modify the prompt to request a response with a word limit
    const promptWithLimit = `${prompt} (Please limit your response to 150 words and avoid negative and ai based responses)`;

    // Send the prompt to Gemini model
    const result = await model.generateContent(promptWithLimit, {
      maxTokens: 70,
    });

    // Get the generated response text
    let reply = result.response.text();

    // Analyze and trim the response to 150 words
    reply = trimToExactWordCount(reply, 150);

    // Return the response to the frontend
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ reply: "Error generating content: " + error.message });
  }
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});
// Function to trim the response to exactly 150 words
function trimToExactWordCount(text, wordLimit) {
  const words = text.split(/\s+/); // Split the text into words

  if (words.length <= wordLimit) {
    return text; // If the response is already within the limit, return as-is
  }

  const trimmedText = words.slice(0, wordLimit).join(" "); // Slice to 150 words and join them back
  return trimmedText + "..."; // Append '...' to indicate truncation
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
