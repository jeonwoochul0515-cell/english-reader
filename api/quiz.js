export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, context } = req.body;

  if (!type || !context) {
    return res.status(400).json({ error: "type과 context가 필요합니다." });
  }

  const prompt = type === "vocab"
    ? `Based on these vocabulary words and their meanings:
${context}

Create a 4-question multiple choice quiz testing these words. Respond ONLY with JSON (no markdown, no backticks):
{
  "questions": [
    {
      "question": "단어의 뜻을 묻는 한국어 질문",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": "정답 선택지 (options 중 하나와 정확히 일치)"
    }
  ]
}`
    : `Based on this English text passage:
"${context}"

Create a 3-question reading comprehension quiz IN KOREAN testing understanding. Respond ONLY with JSON (no markdown, no backticks):
{
  "questions": [
    {
      "question": "내용 이해를 묻는 한국어 질문",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": "정답 선택지 (options 중 하나와 정확히 일치)"
    }
  ]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1000,
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
    console.error("Quiz API error:", error);
    return res.status(500).json({ error: "퀴즈 생성 오류가 발생했습니다." });
  }
}
