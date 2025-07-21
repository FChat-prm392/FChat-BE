const { askGemini } = require('../services/geminiService');

exports.askGemini = async (req, res) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const reply = await askGemini(message, context);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gemini API failed' });
  }
};