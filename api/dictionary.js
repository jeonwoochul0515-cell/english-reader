export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { word, sentence } = req.body;

  if (!word || !sentence) {
    return res.status(400).json({ error: "word와 sentence가 필요합니다." });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an English-Korean dictionary AI for Korean learners. A user clicked the word "${word}" in this sentence:
"${sentence}"

Respond ONLY with a JSON object (no markdown, no backticks, no extra text):
{
  "word": "${word}",
  "phonetic": "IPA pronunciation",
  "pos": "품사 in Korean",
  "meaning": "이 문맥에서의 한국어 뜻 (1-2 phrases)",
  "contextMeaning": "이 문장에서 이 단어가 어떻게 쓰였는지 한국어로 1문장 설명",
  "example": "simple example sentence using this word similarly"
}

The meaning MUST reflect the word's usage in THIS specific sentence, not a generic definition.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Dictionary API error:", error);
    return res.status(500).json({ error: "AI 사전 오류가 발생했습니다." });
  }
}
