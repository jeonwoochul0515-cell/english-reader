import { useState, useRef, useCallback, useEffect, useMemo } from "react";

const samplePages = [
  { id: 1, text: `Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"\n\nSo she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.` },
  { id: 2, text: `There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be late!" (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet.\n\nFor it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it.` },
  { id: 3, text: `The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.\n\nEither the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next. First, she tried to look down and make out what she was coming to, but it was too dark to see anything.` },
  { id: 4, text: `"Curiouser and curiouser!" cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); "now I'm opening out like the largest telescope that ever was! Good-bye, feet!" (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off).\n\n"Oh, my poor little feet, I wonder who will put on your shoes and stockings for you now, dears? I'm sure I shan't be able! I shall be a great deal too far off to trouble myself about you."` },
  { id: 5, text: `Soon her eye fell on a little glass box that was lying under the table: she opened it, and found in it a very small cake, on which the words "EAT ME" were beautifully marked in currants. "Well, I'll eat it," said Alice, "and if it makes me grow larger, I can reach the key; and if it makes me grow smaller, I can creep under the door; so either way I'll get into the garden, and I don't care which happens!"\n\nShe ate a little bit, and said anxiously to herself, "Which way? Which way?", holding her hand on the top of her head to feel which way it was growing, and she was quite surprised to find that she remained the same size.` }
];

const recentBooks = [
  { title: "Alice in Wonderland", author: "Lewis Carroll", progress: 32 },
  { title: "The Little Prince", author: "Antoine de Saint-Exupéry", progress: 68 },
];

const Icon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const BookIcon = () => <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />;
const VocabIcon = () => <Icon d="M12 6.25V19.25M12 6.25C10.83 5.48 9.25 5 7.5 5S4.17 5.48 3 6.25V19.25C4.17 18.48 5.75 18 7.5 18S10.83 18.48 12 19.25M12 6.25C13.17 5.48 14.75 5 16.5 5S19.83 5.48 21 6.25V19.25C19.83 18.48 18.25 18 16.5 18S13.17 18.48 12 19.25" />;
const QuizIcon = () => <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />;
const SettingsIcon = () => <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />;
const UploadIcon = () => <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" size={48} />;
const CloseIcon = () => <Icon d="M18 6L6 18M6 6l12 12" size={20} />;
const TrashIcon = () => <Icon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" size={16} />;
const ChevronUp = () => <Icon d="M18 15l-6-6-6 6" />;
const ChevronDown = () => <Icon d="M6 9l6 6 6-6" />;
const SaveIcon = () => <Icon d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8" size={16} />;

function splitSentences(text) {
  const r = [];
  const re = /[^.!?"]+[.!?"]*\s*/g;
  let m;
  while ((m = re.exec(text)) !== null) { const s = m[0].trim(); if (s) r.push(s); }
  return r.length > 0 ? r : [text];
}

// AI 사전: Vercel API Route를 통해 안전하게 호출
async function fetchAIDef(word, sentence) {
  try {
    const res = await fetch("/api/dictionary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, sentence })
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    console.error("AI err:", e);
    return null;
  }
}

// AI 퀴즈: Vercel API Route를 통해 안전하게 호출
async function fetchAIQuiz(type, context) {
  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, context })
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    console.error("Quiz err:", e);
    return null;
  }
}

const Spinner = ({ text = "AI 분석 중..." }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24, gap: 12 }}>
    <div style={{ width: 28, height: 28, border: "3px solid #374151", borderTop: "3px solid #60A5FA", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <span style={{ fontSize: 13, color: "#6B7280" }}>{text}</span>
  </div>
);

// localStorage 헬퍼
function loadLocal(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function saveLocal(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function App() {
  const [view, setView] = useState("home");
  const [panel, setPanel] = useState(null);
  const [page, setPage] = useState(() => loadLocal("reader-page", 0));
  const [currentLine, setCurrentLine] = useState(() => loadLocal("reader-line", 0));
  const [vocab, setVocab] = useState(() => loadLocal("reader-vocab", []));
  const [tooltip, setTooltip] = useState(null);
  const [tooltipLoading, setTooltipLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [bookLoaded, setBookLoaded] = useState(false);
  const [quizMode, setQuizMode] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const fileRef = useRef(null);
  const wordCache = useRef(loadLocal("reader-cache", {}));

  const totalPages = samplePages.length;
  const progress = totalPages > 0 ? ((page + 1) / totalPages) * 100 : 0;
  const lines = useMemo(() => splitSentences(samplePages[page].text), [page]);

  // 자동 저장
  useEffect(() => { saveLocal("reader-vocab", vocab); }, [vocab]);
  useEffect(() => { saveLocal("reader-page", page); }, [page]);
  useEffect(() => { saveLocal("reader-line", currentLine); }, [currentLine]);

  useEffect(() => { setCurrentLine(0); }, [page]);

  const goNextLine = () => {
    if (currentLine < lines.length - 1) setCurrentLine(c => c + 1);
    else if (page < totalPages - 1) setPage(p => p + 1);
  };
  const goPrevLine = () => {
    if (currentLine > 0) setCurrentLine(c => c - 1);
    else if (page > 0) setPage(p => p - 1);
  };

  useEffect(() => {
    if (view !== "reader") return;
    const handler = (e) => {
      if (tooltip) return;
      if (e.key === "ArrowDown" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); goNextLine(); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); goPrevLine(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, currentLine, page, lines.length, tooltip]);

  const handleWordClick = async (word, sentence) => {
    const clean = word.toLowerCase().replace(/[^a-z'-]/g, "");
    if (!clean || clean.length < 2) return;
    const ck = `${clean}::${sentence.slice(0, 60)}`;
    if (wordCache.current[ck]) { setTooltip(wordCache.current[ck]); return; }

    setTooltipLoading(true);
    setTooltip({ word: clean, phonetic: "", pos: "", meaning: "AI가 문맥을 분석 중...", contextMeaning: "", example: "" });

    const result = await fetchAIDef(clean, sentence);
    if (result) {
      wordCache.current[ck] = result;
      saveLocal("reader-cache", wordCache.current);
      setTooltip(result);
    } else {
      setTooltip({ word: clean, phonetic: "", pos: "", meaning: "AI 응답을 가져올 수 없습니다.", contextMeaning: "", example: "" });
    }
    setTooltipLoading(false);
  };

  const addToVocab = (item) => {
    if (!vocab.find(v => v.word === item.word && v.meaning === item.meaning)) {
      setVocab(prev => [...prev, { ...item, id: Date.now() }]);
    }
    setTooltip(null);
  };
  const removeFromVocab = (id) => setVocab(prev => prev.filter(v => v.id !== id));

  const loadBook = () => { setBookLoaded(true); setView("reader"); setPanel(null); };

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); loadBook(); }, []);

  const startQuiz = async (type) => {
    setQuizMode(type);
    setQuizLoading(true);
    setQuizData(null);
    setQuizIdx(0);
    setQuizAnswer(null);
    setQuizScore(0);
    let ctx;
    if (type === "vocab") {
      ctx = vocab.map(v => `${v.word}: ${v.meaning}`).join("\n");
    } else {
      ctx = samplePages.slice(0, page + 1).map(p => p.text).join("\n\n");
    }
    const data = await fetchAIQuiz(type, ctx);
    setQuizData(data);
    setQuizLoading(false);
  };

  const handleQuizAnswer = (opt) => {
    if (quizAnswer) return;
    setQuizAnswer(opt);
    if (quizData && quizData.questions[quizIdx].answer === opt) setQuizScore(s => s + 1);
  };

  const nextQuizQ = () => {
    if (quizData && quizIdx < quizData.questions.length - 1) { setQuizIdx(i => i + 1); setQuizAnswer(null); }
  };

  const renderClickableWords = (text, sentence) => {
    return text.split(/(\s+)/).map((seg, i) => {
      if (/^\s+$/.test(seg)) return <span key={i}>{seg}</span>;
      if (/[a-zA-Z]/.test(seg)) {
        return (
          <span key={i} onClick={(e) => { e.stopPropagation(); handleWordClick(seg, sentence); }}
            style={{ cursor: "pointer", borderRadius: 4, transition: "all 0.2s", padding: "2px 3px", display: "inline-block" }}
            onMouseEnter={e => { e.target.style.background = "rgba(59,130,246,0.2)"; e.target.style.color = "#93C5FD"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "inherit"; }}>
            {seg}
          </span>
        );
      }
      return <span key={i}>{seg}</span>;
    });
  };

  const sidebarItems = [
    { id: "home", icon: <BookIcon />, label: "홈" },
    { id: "vocab", icon: <VocabIcon />, label: "단어장", badge: vocab.length || null },
    { id: "quiz", icon: <QuizIcon />, label: "퀴즈" },
    { id: "settings", icon: <SettingsIcon />, label: "설정" },
  ];

  const handleSidebarClick = (id) => {
    if (id === "home") { setPanel(null); setView(bookLoaded ? "reader" : "home"); }
    else setPanel(panel === id ? null : id);
  };

  const VISIBLE_RANGE = 3;
  const curQ = quizData?.questions?.[quizIdx];
  const quizDone = quizData && quizIdx >= quizData.questions.length - 1 && quizAnswer;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#0B0F1A", color: "#E5E7EB", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 72, background: "#111827", borderRight: "1px solid #1F2937", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20, gap: 4, flexShrink: 0, zIndex: 999 }}>
        <div style={{ marginBottom: 20, fontWeight: 800, fontSize: 20 }}>📖</div>
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => handleSidebarClick(item.id)}
            style={{
              width: 52, height: 52, border: "none", borderRadius: 12, cursor: "pointer", position: "relative",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
              background: (panel === item.id || (item.id === "home" && !panel)) ? "rgba(59,130,246,0.15)" : "transparent",
              color: (panel === item.id || (item.id === "home" && !panel)) ? "#60A5FA" : "#6B7280",
              transition: "all 0.2s"
            }}>
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
            {item.badge && (
              <span style={{ position: "absolute", top: 4, right: 4, background: "#3B82F6", color: "white", fontSize: 9, fontWeight: 700, borderRadius: 10, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Side Panel */}
      {panel && (
        <div style={{ width: 340, background: "#111827", borderRight: "1px solid #1F2937", overflow: "auto", animation: "slideIn 0.2s ease", flexShrink: 0 }}>
          <div style={{ padding: "20px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1F2937" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#F9FAFB" }}>
              {panel === "vocab" ? "📚 내 단어장" : panel === "quiz" ? "✏️ AI 퀴즈" : "⚙️ 설정"}
            </h2>
            <button onClick={() => setPanel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 4 }}><CloseIcon /></button>
          </div>

          {panel === "vocab" && (
            <div style={{ padding: 16 }}>
              {vocab.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>
                  <p style={{ fontSize: 40, margin: "0 0 12px" }}>📝</p>
                  <p style={{ fontSize: 14 }}>저장된 단어가 없습니다.</p>
                  <p style={{ fontSize: 13 }}>단어를 클릭하면 AI가 문맥에 맞는<br/>뜻을 알려줍니다!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>{vocab.length}개 단어</p>
                    <span style={{ fontSize: 11, color: "#4B5563", display: "flex", alignItems: "center", gap: 4 }}><SaveIcon /> 자동 저장</span>
                  </div>
                  {vocab.map((v) => (
                    <div key={v.id} style={{ background: "#1F2937", borderRadius: 12, padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 16, color: "#F9FAFB" }}>{v.word}</span>
                          {v.phonetic && <span style={{ fontSize: 12, color: "#6B7280", marginLeft: 8 }}>{v.phonetic}</span>}
                          {v.pos && <span style={{ fontSize: 11, color: "#60A5FA", marginLeft: 8, background: "rgba(59,130,246,0.15)", padding: "2px 6px", borderRadius: 4 }}>{v.pos}</span>}
                        </div>
                        <button onClick={() => removeFromVocab(v.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4B5563", padding: 2 }}><TrashIcon /></button>
                      </div>
                      <p style={{ margin: "6px 0 0", fontSize: 14, color: "#D1D5DB" }}>{v.meaning}</p>
                      {v.contextMeaning && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#818CF8", background: "rgba(129,140,248,0.1)", padding: "4px 8px", borderRadius: 6 }}>💡 {v.contextMeaning}</p>}
                      {v.example && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280", fontStyle: "italic" }}>"{v.example}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {panel === "quiz" && (
            <div style={{ padding: 16 }}>
              {!quizMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "rgba(129,140,248,0.08)", borderRadius: 10, padding: 12, border: "1px solid rgba(129,140,248,0.2)", marginBottom: 4 }}>
                    <p style={{ fontSize: 13, color: "#A5B4FC", margin: 0 }}>🤖 AI가 퀴즈를 자동 생성합니다!</p>
                  </div>
                  <button onClick={() => startQuiz("vocab")} disabled={vocab.length < 3}
                    style={{ padding: 20, background: vocab.length < 3 ? "#1F2937" : "rgba(59,130,246,0.1)", border: `1px solid ${vocab.length < 3 ? "#374151" : "rgba(59,130,246,0.3)"}`, borderRadius: 12, cursor: vocab.length < 3 ? "default" : "pointer", textAlign: "left", opacity: vocab.length < 3 ? 0.5 : 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#60A5FA" }}>📝 단어 퀴즈</div>
                    <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>최소 3개 단어 필요 (현재 {vocab.length}개)</div>
                  </button>
                  <button onClick={() => startQuiz("comprehension")}
                    style={{ padding: 20, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 12, cursor: "pointer", textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#34D399" }}>📖 내용 이해 퀴즈</div>
                    <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>읽은 내용 기반 AI 퀴즈</div>
                  </button>
                </div>
              ) : (
                <div>
                  <button onClick={() => { setQuizMode(null); setQuizData(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 13, padding: 0, marginBottom: 16 }}>← 돌아가기</button>
                  {quizLoading ? <Spinner text="AI가 퀴즈를 만드는 중..." /> : !quizData ? (
                    <p style={{ color: "#EF4444", textAlign: "center", padding: 20 }}>퀴즈 생성 실패. 다시 시도해 주세요.</p>
                  ) : quizDone ? (
                    <div style={{ textAlign: "center", padding: 24 }}>
                      <p style={{ fontSize: 48, margin: "0 0 12px" }}>🎉</p>
                      <p style={{ fontSize: 20, fontWeight: 800, color: "#F9FAFB", margin: "0 0 8px" }}>퀴즈 완료!</p>
                      <p style={{ fontSize: 32, fontWeight: 800, color: "#60A5FA", margin: "0 0 4px" }}>{quizScore}/{quizData.questions.length}</p>
                      <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 20px" }}>
                        {quizScore === quizData.questions.length ? "완벽해요! 🎊" : quizScore >= quizData.questions.length / 2 ? "잘했어요! 👍" : "다시 도전! 💪"}
                      </p>
                      <button onClick={() => startQuiz(quizMode)} style={{ padding: "10px 24px", background: "#3B82F6", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>다시 풀기</button>
                    </div>
                  ) : curQ ? (
                    <div style={{ background: "#1F2937", borderRadius: 12, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: "#6B7280" }}>{quizIdx + 1}/{quizData.questions.length}</span>
                        <span style={{ fontSize: 12, color: "#60A5FA" }}>점수: {quizScore}</span>
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 16px", color: "#F9FAFB", lineHeight: 1.5 }}>{curQ.question}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {curQ.options.map((opt, i) => {
                          const isSel = quizAnswer === opt, isCor = opt === curQ.answer;
                          let bg = "#0B0F1A", bdr = "#374151", col = "#D1D5DB";
                          if (quizAnswer) {
                            if (isCor) { bg = "rgba(52,211,153,0.15)"; bdr = "#34D399"; col = "#34D399"; }
                            else if (isSel) { bg = "rgba(239,68,68,0.15)"; bdr = "#EF4444"; col = "#EF4444"; }
                          }
                          return (
                            <button key={i} onClick={() => handleQuizAnswer(opt)}
                              style={{ padding: "12px 16px", background: bg, border: `1px solid ${bdr}`, borderRadius: 10, cursor: quizAnswer ? "default" : "pointer", textAlign: "left", fontSize: 14, color: col, transition: "all 0.2s", fontWeight: isSel || (quizAnswer && isCor) ? 600 : 400 }}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {quizAnswer && !quizDone && (
                        <button onClick={nextQuizQ} style={{ marginTop: 16, padding: "10px 20px", background: "#3B82F6", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>다음 문제 →</button>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {panel === "settings" && (
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "rgba(52,211,153,0.08)", borderRadius: 12, padding: 14, border: "1px solid rgba(52,211,153,0.2)" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#34D399", margin: "0 0 6px" }}>✅ 모든 기능 자동 동작!</p>
                <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>AI 사전 · 퀴즈 · 자동저장</p>
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#D1D5DB", margin: "0 0 8px" }}>⌨️ 단축키</h3>
                <div style={{ fontSize: 13, color: "#6B7280", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div><span style={{ color: "#D1D5DB", background: "#1F2937", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>↓</span> <span style={{ color: "#D1D5DB", background: "#1F2937", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>Space</span> 다음 줄</div>
                  <div><span style={{ color: "#D1D5DB", background: "#1F2937", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>↑</span> 이전 줄</div>
                  <div>화면 클릭 → 다음 줄 / 단어 클릭 → AI 사전</div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid #1F2937", paddingTop: 16 }}>
                <button onClick={() => { localStorage.clear(); location.reload(); }}
                  style={{ padding: "8px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, cursor: "pointer", color: "#EF4444", fontSize: 13 }}>
                  🗑️ 모든 데이터 초기화
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
        {view === "reader" && (
          <div style={{ height: 3, background: "#1F2937", flexShrink: 0 }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg, #3B82F6, #818CF8)", width: `${progress}%`, transition: "width 0.3s ease" }} />
          </div>
        )}

        {view === "home" && (
          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "#F9FAFB", margin: "0 0 8px" }}>영어 책 쉽게 읽기</h1>
                <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 4px" }}>한 줄씩 집중하며 읽고, 단어를 클릭하면</p>
                <p style={{ fontSize: 15, color: "#818CF8", margin: 0, fontWeight: 600 }}>🤖 AI가 문맥에 맞는 뜻을 알려줍니다</p>
              </div>
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${isDragging ? "#3B82F6" : "#374151"}`, borderRadius: 16, padding: "48px 24px", textAlign: "center", cursor: "pointer", background: isDragging ? "rgba(59,130,246,0.1)" : "#111827", transition: "all 0.2s", marginBottom: 32 }}>
                <div style={{ color: isDragging ? "#3B82F6" : "#4B5563", marginBottom: 12 }}><UploadIcon /></div>
                <p style={{ fontWeight: 600, fontSize: 16, color: "#D1D5DB", margin: "0 0 4px" }}>{isDragging ? "여기에 놓으세요!" : "PDF 파일을 끌어다 놓거나 클릭"}</p>
                <p style={{ fontSize: 13, color: "#4B5563", margin: 0 }}>지원 형식: PDF</p>
                <input ref={fileRef} type="file" accept="application/pdf" onChange={loadBook} style={{ display: "none" }} />
              </div>
              {recentBooks.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#D1D5DB", margin: "0 0 12px" }}>📖 최근 읽은 책</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {recentBooks.map((b, i) => (
                      <div key={i} onClick={loadBook}
                        style={{ background: "#111827", borderRadius: 12, padding: 16, cursor: "pointer", border: "1px solid #1F2937", transition: "border-color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#374151"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#1F2937"}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: "#F9FAFB" }}>{b.title}</div>
                            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{b.author}</div>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#60A5FA" }}>{b.progress}%</span>
                        </div>
                        <div style={{ marginTop: 10, height: 4, background: "#1F2937", borderRadius: 2 }}>
                          <div style={{ height: "100%", background: "#3B82F6", borderRadius: 2, width: `${b.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "reader" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}
            onClick={() => { if (!tooltip) goNextLine(); }}>
            <div style={{ padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, borderBottom: "1px solid #1F2937" }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#F9FAFB" }}>Alice in Wonderland</span>
                <span style={{ fontSize: 13, color: "#4B5563", marginLeft: 12 }}>p.{page + 1}/{totalPages}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "#818CF8", background: "rgba(129,140,248,0.1)", padding: "3px 10px", borderRadius: 20 }}>🤖 AI 사전</span>
                <span style={{ fontSize: 12, color: "#4B5563" }}>{currentLine + 1}/{lines.length}</span>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px 32px", overflow: "hidden", cursor: "pointer", position: "relative" }}>
              <div style={{ maxWidth: 800, width: "100%", position: "relative" }}>
                {lines.map((line, idx) => {
                  const diff = idx - currentLine;
                  const absDiff = Math.abs(diff);
                  if (absDiff > VISIBLE_RANGE) return null;
                  const isCur = idx === currentLine;
                  const scale = isCur ? 1 : 0.85 - absDiff * 0.05;
                  const opacity = isCur ? 1 : Math.max(0.06, 0.3 - absDiff * 0.1);
                  const blur = isCur ? 0 : absDiff * 2;
                  const baseY = isCur ? 0 : diff > 0 ? 60 + (diff - 1) * 56 : -60 + (diff + 1) * 56;
                  return (
                    <div key={`${page}-${idx}`} style={{
                      position: isCur ? "relative" : "absolute", left: 0, right: 0,
                      top: isCur ? undefined : "50%",
                      transform: isCur ? `scale(${scale})` : `translateY(${baseY}px) scale(${scale})`,
                      opacity, filter: `blur(${blur}px)`,
                      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      textAlign: "center", padding: isCur ? "24px 16px" : "8px 16px",
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: isCur ? 26 : 18, lineHeight: 1.7,
                      color: isCur ? "#F9FAFB" : "#6B7280",
                      fontWeight: isCur ? 500 : 400,
                      pointerEvents: isCur ? "auto" : "none", zIndex: isCur ? 10 : 1,
                    }}>
                      {isCur ? renderClickableWords(line, line) : line}
                    </div>
                  );
                })}
              </div>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to bottom, #0B0F1A, transparent)", pointerEvents: "none", zIndex: 20 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, #0B0F1A, transparent)", pointerEvents: "none", zIndex: 20 }} />
            </div>
            <div style={{ padding: "12px 32px 20px", display: "flex", justifyContent: "center", alignItems: "center", gap: 16, flexShrink: 0 }}>
              <button onClick={(e) => { e.stopPropagation(); goPrevLine(); }}
                style={{ width: 44, height: 44, border: "1px solid #1F2937", borderRadius: 12, background: "#111827", cursor: "pointer", color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronUp />
              </button>
              <div style={{ fontSize: 11, color: "#4B5563", letterSpacing: 1 }}>TAP OR ↓</div>
              <button onClick={(e) => { e.stopPropagation(); goNextLine(); }}
                style={{ width: 44, height: 44, border: "1px solid #1F2937", borderRadius: 12, background: "#111827", cursor: "pointer", color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronDown />
              </button>
            </div>
          </div>
        )}

        {tooltip && (
          <div onClick={e => e.stopPropagation()} style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, animation: "slideUp 0.25s ease" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px 16px" }}>
              <div style={{ background: "#1F2937", borderRadius: 16, padding: 20, boxShadow: "0 -4px 32px rgba(0,0,0,0.5)", border: "1px solid #374151" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#F9FAFB" }}>{tooltip.word}</span>
                    {tooltip.phonetic && <span style={{ fontSize: 14, color: "#6B7280" }}>{tooltip.phonetic}</span>}
                    {tooltip.pos && <span style={{ fontSize: 12, color: "#60A5FA", background: "rgba(59,130,246,0.15)", padding: "2px 8px", borderRadius: 4 }}>{tooltip.pos}</span>}
                  </div>
                  <button onClick={() => setTooltip(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 2, flexShrink: 0 }}><CloseIcon /></button>
                </div>
                {tooltipLoading ? <Spinner /> : (
                  <>
                    <p style={{ fontSize: 17, color: "#E5E7EB", margin: "12px 0 0", fontWeight: 600 }}>{tooltip.meaning}</p>
                    {tooltip.contextMeaning && (
                      <div style={{ margin: "10px 0 0", background: "rgba(129,140,248,0.1)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(129,140,248,0.2)" }}>
                        <p style={{ fontSize: 13, color: "#A5B4FC", margin: 0 }}>💡 <strong>문맥:</strong> {tooltip.contextMeaning}</p>
                      </div>
                    )}
                    {tooltip.example && <p style={{ fontSize: 13, color: "#6B7280", margin: "8px 0 0", fontStyle: "italic" }}>📝 "{tooltip.example}"</p>}
                    <button onClick={() => addToVocab(tooltip)}
                      style={{ marginTop: 14, padding: "10px 24px", background: "#3B82F6", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                      + 단어장에 추가
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        ::selection { background: rgba(59,130,246,0.3); }
      `}</style>
    </div>
  );
}