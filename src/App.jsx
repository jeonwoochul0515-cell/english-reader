import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import * as pdfjsLib from "pdfjs-dist";

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

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
const BackIcon = () => <Icon d="M19 12H5M12 19l-7-7 7-7" />;

function splitSentences(text) {
  if (!text || !text.trim()) return ["(이 페이지에 텍스트가 없습니다)"];
  const r = [];
  // Split by sentence-ending punctuation, keeping the punctuation
  const parts = text.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/);
  for (const p of parts) {
    const trimmed = p.trim();
    if (trimmed.length > 0) {
      // If sentence is very long, split further by commas/semicolons
      if (trimmed.length > 200) {
        const subs = trimmed.split(/(?<=[,;])\s+/);
        for (const s of subs) { if (s.trim()) r.push(s.trim()); }
      } else {
        r.push(trimmed);
      }
    }
  }
  return r.length > 0 ? r : ["(이 페이지에 텍스트가 없습니다)"];
}

// PDF 텍스트 추출
async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const pg = await pdf.getPage(i);
    const content = await pg.getTextContent();
    const text = content.items.map(item => item.str).join(" ").replace(/\s+/g, " ").trim();
    if (text) {
      pages.push({ id: i, text });
    }
  }
  return pages;
}

// API 호출
async function fetchAIDef(word, sentence) {
  try {
    const res = await fetch("/api/dictionary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, sentence })
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) { console.error("AI err:", e); return null; }
}

async function fetchAIQuiz(type, context) {
  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, context })
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) { console.error("Quiz err:", e); return null; }
}

const Spinner = ({ text = "AI 분석 중..." }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24, gap: 12 }}>
    <div style={{ width: 28, height: 28, border: "3px solid #374151", borderTop: "3px solid #60A5FA", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <span style={{ fontSize: 13, color: "#6B7280" }}>{text}</span>
  </div>
);

function loadLocal(key, fb) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function saveLocal(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

export default function App() {
  const [view, setView] = useState("home");
  const [panel, setPanel] = useState(null);
  const [pages, setPages] = useState([]);
  const [bookTitle, setBookTitle] = useState("");
  const [page, setPage] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [vocab, setVocab] = useState(() => loadLocal("reader-vocab", []));
  const [tooltip, setTooltip] = useState(null);
  const [tooltipLoading, setTooltipLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [quizMode, setQuizMode] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const fileRef = useRef(null);
  const wordCache = useRef(loadLocal("reader-cache", {}));

  const totalPages = pages.length;
  const progress = totalPages > 0 ? ((page + 1) / totalPages) * 100 : 0;
  const lines = useMemo(() => {
    if (pages.length === 0 || page >= pages.length) return ["PDF를 업로드해 주세요."];
    return splitSentences(pages[page].text);
  }, [page, pages]);

  useEffect(() => { saveLocal("reader-vocab", vocab); }, [vocab]);

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

  // PDF 업로드 처리
  const handleFileUpload = async (file) => {
    if (!file || file.type !== "application/pdf") {
      alert("PDF 파일만 업로드할 수 있습니다.");
      return;
    }
    setPdfLoading(true);
    try {
      const extracted = await extractPdfText(file);
      if (extracted.length === 0) {
        alert("PDF에서 텍스트를 추출할 수 없습니다. 이미지 기반 PDF일 수 있습니다.");
        setPdfLoading(false);
        return;
      }
      const name = file.name.replace(".pdf", "").replace(/[_-]/g, " ");
      setBookTitle(name);
      setPages(extracted);
      setPage(0);
      setCurrentLine(0);
      setView("reader");
      setPanel(null);
    } catch (err) {
      console.error("PDF error:", err);
      alert("PDF 파일을 읽는 중 오류가 발생했습니다.");
    }
    setPdfLoading(false);
  };

  const onFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  };

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

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }, []);

  const startQuiz = async (type) => {
    setQuizMode(type); setQuizLoading(true); setQuizData(null);
    setQuizIdx(0); setQuizAnswer(null); setQuizScore(0);
    let ctx;
    if (type === "vocab") {
      ctx = vocab.map(v => `${v.word}: ${v.meaning}`).join("\n");
    } else {
      const start = Math.max(0, page - 2);
      ctx = pages.slice(start, page + 1).map(p => p.text).join("\n\n");
    }
    const data = await fetchAIQuiz(type, ctx);
    setQuizData(data); setQuizLoading(false);
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
    if (id === "home") { setPanel(null); setView("home"); }
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
              background: (panel === item.id || (item.id === "home" && !panel && view === "home")) ? "rgba(59,130,246,0.15)" : "transparent",
              color: (panel === item.id || (item.id === "home" && !panel && view === "home")) ? "#60A5FA" : "#6B7280",
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
                  {pages.length === 0 && (
                    <div style={{ background: "rgba(239,68,68,0.08)", borderRadius: 10, padding: 12, border: "1px solid rgba(239,68,68,0.2)", marginBottom: 4 }}>
                      <p style={{ fontSize: 13, color: "#FCA5A5", margin: 0 }}>⚠️ 먼저 PDF를 업로드하고 읽기를 시작해 주세요.</p>
                    </div>
                  )}
                  <button onClick={() => startQuiz("vocab")} disabled={vocab.length < 3}
                    style={{ padding: 20, background: vocab.length < 3 ? "#1F2937" : "rgba(59,130,246,0.1)", border: `1px solid ${vocab.length < 3 ? "#374151" : "rgba(59,130,246,0.3)"}`, borderRadius: 12, cursor: vocab.length < 3 ? "default" : "pointer", textAlign: "left", opacity: vocab.length < 3 ? 0.5 : 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#60A5FA" }}>📝 단어 퀴즈</div>
                    <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>최소 3개 단어 필요 (현재 {vocab.length}개)</div>
                  </button>
                  <button onClick={() => startQuiz("comprehension")} disabled={pages.length === 0}
                    style={{ padding: 20, background: pages.length === 0 ? "#1F2937" : "rgba(52,211,153,0.1)", border: `1px solid ${pages.length === 0 ? "#374151" : "rgba(52,211,153,0.3)"}`, borderRadius: 12, cursor: pages.length === 0 ? "default" : "pointer", textAlign: "left", opacity: pages.length === 0 ? 0.5 : 1 }}>
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
                <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>PDF 업로드 · AI 사전 · 퀴즈 · 자동저장</p>
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

        {/* Home */}
        {view === "home" && (
          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "#F9FAFB", margin: "0 0 8px" }}>영어 책 쉽게 읽기</h1>
                <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 4px" }}>PDF를 업로드하고 한 줄씩 집중하며 읽어보세요</p>
                <p style={{ fontSize: 15, color: "#818CF8", margin: 0, fontWeight: 600 }}>🤖 단어를 클릭하면 AI가 문맥에 맞는 뜻을 알려줍니다</p>
              </div>
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                onClick={() => !pdfLoading && fileRef.current?.click()}
                style={{ border: `2px dashed ${isDragging ? "#3B82F6" : "#374151"}`, borderRadius: 16, padding: "48px 24px", textAlign: "center", cursor: pdfLoading ? "wait" : "pointer", background: isDragging ? "rgba(59,130,246,0.1)" : "#111827", transition: "all 0.2s", marginBottom: 32 }}>
                {pdfLoading ? (
                  <Spinner text="PDF를 읽고 있어요..." />
                ) : (
                  <>
                    <div style={{ color: isDragging ? "#3B82F6" : "#4B5563", marginBottom: 12 }}><UploadIcon /></div>
                    <p style={{ fontWeight: 600, fontSize: 16, color: "#D1D5DB", margin: "0 0 4px" }}>{isDragging ? "여기에 놓으세요!" : "PDF 파일을 끌어다 놓거나 클릭"}</p>
                    <p style={{ fontSize: 13, color: "#4B5563", margin: 0 }}>영어 PDF 파일을 올려주세요</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept="application/pdf" onChange={onFileInput} style={{ display: "none" }} />
              </div>

              {/* 현재 읽고 있는 책으로 돌아가기 */}
              {pages.length > 0 && (
                <div onClick={() => setView("reader")}
                  style={{ background: "#111827", borderRadius: 12, padding: 16, cursor: "pointer", border: "1px solid #1F2937", transition: "border-color 0.2s", marginBottom: 16 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#374151"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1F2937"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#34D399", fontWeight: 600, marginBottom: 4 }}>📖 이어서 읽기</div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "#F9FAFB" }}>{bookTitle}</div>
                      <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{totalPages}페이지 · 현재 {page + 1}페이지</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#60A5FA" }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ marginTop: 10, height: 4, background: "#1F2937", borderRadius: 2 }}>
                    <div style={{ height: "100%", background: "#3B82F6", borderRadius: 2, width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reader */}
        {view === "reader" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}
            onClick={() => { if (!tooltip) goNextLine(); }}>
            <div style={{ padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, borderBottom: "1px solid #1F2937" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={(e) => { e.stopPropagation(); setView("home"); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 4, display: "flex" }}>
                  <BackIcon />
                </button>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#F9FAFB" }}>{bookTitle || "PDF"}</span>
                  <span style={{ fontSize: 12, color: "#4B5563", marginLeft: 10 }}>p.{page + 1}/{totalPages}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#818CF8", background: "rgba(129,140,248,0.1)", padding: "3px 10px", borderRadius: 20 }}>🤖 AI</span>
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
                      fontSize: isCur ? 24 : 16, lineHeight: 1.7,
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

        {/* Tooltip */}
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
