import React, { useState, useRef, useEffect } from "react";
import { 
  Wrench, 
  ShieldAlert, 
  Gauge, 
  FileQuestion, 
  BookOpen, 
  Calculator, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  User, 
  Cpu, 
  Award, 
  Search, 
  Sparkles, 
  Check, 
  HelpCircle,
  FileText,
  Bookmark,
  ChevronRight,
  ClipboardList,
  Home,
  Briefcase,
  Building2,
  Info,
  Mic,
  MicOff,
  Image,
  Volume2,
  VolumeX,
  Copy,
  PlusCircle,
  Download
} from "lucide-react";
import { Message, QuizQuestion, GlossaryTerm, SafetyCheckItem } from "./types";
import { SAMPLE_QUIZZES } from "./data/quiz";
import { GLOSSARY_TERMS } from "./data/glossary";
// @ts-ignore
import tabBotLogo from "./assets/images/tab_bot_logo_1781152066922.png";

interface AppMessage extends Message {
  imagePreview?: string;
}

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab ] = useState<"beranda" | "chat" | "materi" | "quiz" | "pkl" | "karier" | "tentang">("beranda");

  // Learning Level State
  const [classLevel, setClassLevel] = useState<"Kelas X" | "Kelas XI" | "Kelas XII">("Kelas XI");

  // Chat Interface State
  const [messages, setMessages] = useState<AppMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Halo Taruna Teknik Alat Berat SMK Muhammadiyah 1 Kepanjen! 🚜\n\nSaya **TAB MUSAKE AI**, asisten pembelajaran resmi Anda. Saya siap melatih Anda menguasai:\n- ⚙️ **Engine Diesel & Common Rail Engine**\n- 🔧 **Sistem Hidrolik & Tekanan**\n- ⛓️ **Powertrain & Undercarriage**\n- 🦺 **Keselamatan Kerja (K3LH) & P2H**\n- 🏭 **Persiapan Magang (PKL) & Pembekalan UKK**\n\n*Silakan pilih menu / pintasan modul, ketik pertanyaan teknis, atau gunakan fitur suara 🎤 & analisis foto 📷 di bawah!*",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice Assistant States (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Image Selection States
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [isAssessorMode, setIsAssessorMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PKL Journal & Report Planner State
  const [pklJournal, setPklJournal] = useState({
    hariTanggal: "Rabu, 10 Juni 2026",
    unitKerja: "Komatsu Hydraulic Excavator PC200-8",
    aktivitas: "Melakukan Periodic Service (PS) 250 Jam",
    kendala: "Klem filter solar keras saat dilepas menggunakan sabuk kunci",
    solusi: "Menyemprotkan penetrating oil WD-40 dan memukul perlahan gagang kunci filter",
    k3: "Menggunakan kacamata pelindung safety, penampung tumpahan oli dan sarung tangan tahan korosi kimia"
  });
  const [generatedJournalText, setGeneratedJournalText] = useState<string | null>(null);

  // Career CV ATS Form State
  const [cvForm, setCvForm] = useState({
    nama: "Taruna Bagus Prakoso",
    email: "tarunabagus@gmail.com",
    kontak: "0812-3456-7890",
    sekolah: "SMK Muhammadiyah 1 Kepanjen",
    jurusan: "Teknik Alat Berat (TAB) - Kelas XII (Binaan PT United Tractors)",
    keahlian: "Preventive Maintenance PM 250 & PM 500 Komatsu PC200-8 & Bulldozer D85ESS, Dasar Diagnosis Hidrolik sirkuit umum, SOP LOTO, Pengoperasian SST, Menguasai pembacaan basic Hydraulic Schematic Diagram",
    pengalamanPKL: "Mekanik Magang di PT United Tractors Tbk - Cabang Surabaya (Januari - Juni 2025).\n- Melakukan asisten periodic service pada unit Dump Truck Scania P360 & Excavator Komatsu PC200-8 sebanyak 45 unit.\n- Mengisi checklist P2H harian dengan presisi 100%."
  });
  const [generatedCvText, setGeneratedCvText] = useState<string | null>(null);

  // Filter & Search states for Glossary
  const [glossarySearch, setGlossarySearch] = useState("");
  const [glossaryCategory, setGlossaryCategory] = useState<string>("Semua");

  // Interactive Calculator State
  const [calcType, setCalcType] = useState<"hydraulic" | "gear_ratio">("hydraulic");
  const [calcInputs, setCalcInputs] = useState({
    pressure: "180",
    diameter: "100",
    teethPinion: "14",
    teethRing: "48"
  });
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Interactive Quiz State
  const [selectedQuizIndex, setSelectedQuizIndex] = useState(0);
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // P2H Safety Checklist State
  const [p2hItems, setP2hItems] = useState<SafetyCheckItem[]>([
    { id: "p1", category: "P2H", task: "Periksa level oli engine menggunakan dipstick (pastikan antara L dan H)", checked: false },
    { id: "p2", category: "P2H", task: "Cek ketinggian air radiator di surplus tank & bersihkan kisi-kisi radiator", checked: false },
    { id: "p3", category: "P2H", task: "Periksa kelonggaran track link (tension check) - tinggi kenduran 50-65 mm", checked: false },
    { id: "p4", category: "P2H", task: "Periksa rembesan oli hidrolik pada cylinder seal, selang fleksibel, & relief valve", checked: false },
    { id: "p5", category: "Apd", task: "Pastikan memakai Helm Pelindung, Kacamata Kerja, & Sepatu Safety baja", checked: false },
    { id: "p6", category: "Loto", task: "Pasang Lock-Out Tag-Out (LOTO) pada switch aki sebelum menyentuh sasis dalam", checked: false },
    { id: "p7", category: "ShopProcedures", task: "Pastikan safety lock lever ditarik ke atas (terkunci) sebelum menyalakan mesin", checked: false },
  ]);
  const [p2hEngineStarted, setP2hEngineStarted] = useState(false);
  const [p2hMessage, setP2hMessage] = useState<string | null>(null);

  // Scroll chat to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle Speech Synthesis (Indonesia TTS)
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    // Stop current speaking
    window.speechSynthesis.cancel();

    // Remove markdown symbols to make reading clean and fluid
    const cleanText = text
      .replace(/[#*`_~]/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\\/g, "")
      .replace(/\(.*?\)/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "id-ID";

    // Standardize Indonesian voice if present
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(v => v.lang.startsWith("id") || v.lang.includes("ID"));
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Handle Speech to Text Recognition (Indonesian Web Speech API)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Maaf, browser Anda belum mendukung fitur perekam suara Speech-To-Text secara native. Silakan gunakan Google Chrome atau Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      // Turn TTS auto-response on when voice is activated
      setIsTtsEnabled(true);
    };

    recognition.onerror = (e: any) => {
      console.error("Speech Recognition Error:", e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      if (speechToText && speechToText.trim()) {
        setInputText(speechToText);
        // Automatically send voice command
        sendMessage(speechToText);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Handling Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (compress base64 if very large)
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Pilih gambar berdiameter kecil atau hemat resolusi di bawah 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(",")[1];
      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
        preview: URL.createObjectURL(file)
      });
      // Automatically switch to chat tab so the user can see their image preview in the compose box!
      setActiveTab("chat");
    };
    reader.readAsDataURL(file);
  };

  // Handling Quick Question Prompts
  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    sendMessage(question);
  };

  // Chat API Integration with added vision support, classLevel contexts, and assess mode
  const sendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() && !selectedImage) return;

    // Retain selected image info and reset immediately to prevent race conditions
    const imageToSend = selectedImage;
    setInputText("");
    setSelectedImage(null);

    // Create user message
    const userMsg: AppMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: textToSend || (imageToSend ? "📷 Mengunggah foto hasil pekerjaan untuk unjuk kerja draf..." : ""),
      timestamp: new Date(),
      imagePreview: imageToSend ? imageToSend.preview : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Map history correctly for the API backend
      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend || (isAssessorMode ? "Analisislah gambar unjuk kerja ini" : "Apa komponen yang ada di gambar ini?"),
          history: historyPayload,
          classLevel: classLevel,
          isAssessorMode: isAssessorMode,
          image: imageToSend ? { data: imageToSend.data, mimeType: imageToSend.mimeType } : undefined
        })
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil respon dari asisten server.");
      }

      const data = await res.json();
      const aiMsg: AppMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        text: data.text || "Terjadi kesalahan internal. Mohon ulangi kembali.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

      // Automatically speak the response if TTS is activated
      if (isTtsEnabled) {
        speakText(aiMsg.text);
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: AppMessage = {
        id: `ai-err-${Date.now()}`,
        role: "model",
        text: `⚠️ **Galat Koneksi**: Gagal menghubungi server AI.\n\nTenang saja! Aplikasi TAB MUSAKE AI ini **100% GRATIS** dan bebas digunakan selamanya. Anda tetap dapat belajar menggunakan semua alat simulasi di sini secara gratis. Jika Anda ingin mengaktifkan obrolan AI yang dinamis, Anda bisa mendapatkan **Free API Key** di *Google AI Studio* secara cuma-cuma (gratis, tanpa prasyarat kartu kredit) lalu menyematkannya di menu **Settings > Secrets**.\n\n*Detail teknis: ${err.message}*`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setIsAssessorMode(false); // Reset assessor mode trigger
    }
  };

  // Submit Mechanical Math to `/api/calculate`
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setCalcResult(null);

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: calcType,
          inputs: calcInputs
        })
      });

      if (!response.ok) {
        throw new Error("Gagal menghitung hasil dari formula teknik.");
      }

      const data = await response.json();
      setCalcResult(data.result);
    } catch (err: any) {
      console.error(err);
      setCalcResult(`❌ Gagal menghitung: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  // Submit Quiz Answer
  const submitQuizAnswer = () => {
    if (userSelectedOption === null) return;
    setQuizSubmitted(true);
    const activeQuestion = SAMPLE_QUIZZES[selectedQuizIndex];
    const isCorrect = userSelectedOption === activeQuestion.correctAnswer;

    if (isCorrect) {
      setQuizScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      setQuizFeedback("BENAR");
    } else {
      setQuizScore(prev => ({ ...prev, total: prev.total + 1 }));
      setQuizFeedback("SALAH");
    }
  };

  // Next Quiz Question
  const nextQuiz = () => {
    const nextIndex = (selectedQuizIndex + 1) % SAMPLE_QUIZZES.length;
    setSelectedQuizIndex(nextIndex);
    setUserSelectedOption(null);
    setQuizSubmitted(false);
    setQuizFeedback(null);
  };

  // Reset entire Quiz
  const resetQuiz = () => {
    setSelectedQuizIndex(0);
    setUserSelectedOption(null);
    setQuizSubmitted(false);
    setQuizScore({ correct: 0, total: 0 });
    setQuizFeedback(null);
  };

  // Toggle checklist
  const toggleP2hCheck = (id: string) => {
    setP2hItems(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
    setP2hMessage(null);
  };

  // Attempt to start engine (simulating actual machinery safety check)
  const tryStartEngine = () => {
    const uncheckedCritical = p2hItems.filter(item => !item.checked);
    if (uncheckedCritical.length > 0) {
      setP2hEngineStarted(false);
      setP2hMessage(
        `🚨 **Gagal Menyalakan Mesin!** Ada ${uncheckedCritical.length} poin inspeksi K3 & P2H yang diabaikan. Menyalakan unit tanpa P2H berisiko merusak komponen vital atau menyebabkan kecelakaan fatal kerja!`
      );
    } else {
      setP2hEngineStarted(true);
      setP2hMessage(
        `🎉 **Vrrrruuumm!** Engine Diesel Komatsu PC200 berhasil dinyalakan dengan aman! Tekanan oli normal, rilis LOTO dicopot dengan benar, dan seluruh SOP K3 telah terpenuhi. Kerja cerdas, mekanik hebat!`
      );
    }
  };

  // Filter glossary based on category and search text
  const filteredGlossary = GLOSSARY_TERMS.filter(term => {
    const matchesCategory = glossaryCategory === "Semua" || term.category.toLowerCase().includes(glossaryCategory.toLowerCase()) || term.example.toLowerCase().includes(glossaryCategory.toLowerCase());
    const matchesSearch = term.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
                          term.definition.toLowerCase().includes(glossarySearch.toLowerCase()) ||
                          term.function.toLowerCase().includes(glossarySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "engine":
      case "engine diesel":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "hydraulic":
      case "hydraulic system":
        return "bg-sky-500/20 text-sky-400 border border-sky-500/30";
      case "powertrain":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "k3lh":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
    }
  };

  // Convert raw text into nicely styled blocks if they contain markdown headers
  const formatMarkdownResponse = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Check Headers or structured categories
      if (line.startsWith("🔍 GEJALA")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-slate-900 border-l-4 border-amber-500 p-3 rounded-r-lg">
            <span className="font-display font-bold text-amber-400 text-lg flex items-center md:text-xl">
              🔍 GEJALA MASALAH
            </span>
          </div>
        );
      }
      if (line.startsWith("🔎 KEMUNGKINAN PENYEBAB")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-slate-900 border-l-4 border-red-500 p-3 rounded-r-lg">
            <span className="font-display font-bold text-red-400 text-lg flex items-center md:text-xl">
              🔎 KEMUNGKINAN PENYEBAB (DIAGNOSIS)
            </span>
          </div>
        );
      }
      if (line.startsWith("🛠 LANGKAH PEMERIKSAAN")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-slate-900 border-l-4 border-yellow-400 p-3 rounded-r-lg">
            <span className="font-display font-bold text-yellow-300 text-lg flex items-center md:text-xl">
              🛠 LANGKAH PEMERIKSAAN (INVESTIGASI)
            </span>
          </div>
        );
      }
      if (line.startsWith("✅ TINDAKAN PERBAIKAN")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-slate-900 border-l-4 border-emerald-500 p-3 rounded-r-lg">
            <span className="font-display font-bold text-emerald-400 text-lg flex items-center md:text-xl">
              ✅ TINDAKAN PERBAIKAN (REPAIR & REPLACEMENT)
            </span>
          </div>
        );
      }
      if (line.startsWith("⚠ K3 (KESELAMATAN KERJA)") || line.startsWith("⚠ K3")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-amber-500/10 border-2 border-amber-500/40 p-4 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 zebra-stripes w-8 h-full opacity-20"></div>
            <span className="font-display font-bold text-amber-400 text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
              SOP KESELAMATAN KERJA (K3LH)
            </span>
          </div>
        );
      }
      if (line.startsWith("📚 KONSEP YANG DIPERLAJARI")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-indigo-950/40 border-l-4 border-indigo-400 p-3 rounded-r-lg">
            <span className="font-display font-bold text-indigo-300 text-lg flex items-center md:text-xl">
              📚 MATERI KURIKULUM TAB
            </span>
          </div>
        );
      }

      // Theory category triggers
      if (line.startsWith("📖 PENGERTIAN")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-slate-900 border-l-4 border-indigo-400 p-3 rounded-r-lg">
            <span className="font-display font-bold text-indigo-400 text-lg flex items-center md:text-xl">
              📖 PENGERTIAN TEORITIS
            </span>
          </div>
        );
      }
      if (line.startsWith("⚙ FUNGSI")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-slate-900 border-l-4 border-emerald-400 p-3 rounded-r-lg">
            <span className="font-display font-bold text-emerald-400 text-lg flex items-center md:text-xl">
              ⚙ FUNGSI UTAMA KOMPONEN
            </span>
          </div>
        );
      }
      if (line.startsWith("🔩 KOMPONEN")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-slate-900 border-l-4 border-amber-400 p-3 rounded-r-lg">
            <span className="font-display font-bold text-amber-400 text-lg flex items-center md:text-xl">
              🔩 STRUKTUR & DETAIL KOMPONEN
            </span>
          </div>
        );
      }
      if (line.startsWith("🔄 CARA KERJA")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-slate-900 border-l-4 border-sky-400 p-3 rounded-r-lg">
            <span className="font-display font-bold text-sky-400 text-lg flex items-center md:text-xl">
              🔄 TAHAPAN/PRINSIP KERJA
            </span>
          </div>
        );
      }
      if (line.startsWith("🚜 CONTOH PADA ALAT BERAT")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-slate-900 border-l-4 border-orange-400 p-3 rounded-r-lg">
            <span className="font-display font-bold text-orange-400 text-lg flex items-center md:text-xl">
              🚜 APLIKASI PADA UNIT KOMERSIAL
            </span>
          </div>
        );
      }
      if (line.startsWith("💡 TIPS MENGINGAT")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
            <span className="font-display font-bold text-yellow-300 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              TIPS MEMUDAHKAN HAFALAN SISWA:
            </span>
          </div>
        );
      }

      // K3LH triggers
      if (line.startsWith("⚠ POTENSI BAHAYA")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-red-950/40 border-l-4 border-red-500 p-3 rounded-r-lg">
            <span className="font-display font-bold text-red-400 text-lg">⚠ POTENSI BAHAYA (HAZARD)</span>
          </div>
        );
      }
      if (line.startsWith("🦺 APD YANG DIGUNAKAN")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-slate-900 border-l-4 border-emerald-400 p-3 rounded-r-lg">
            <span className="font-display font-bold text-emerald-400 text-lg">🦺 APD (SAFETY GEAR) WAJIB</span>
          </div>
        );
      }
      if (line.startsWith("🚫 RISIKO JIKA DIABAIKAN")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-red-950/30 border-l-4 border-red-600 p-3 rounded-r-lg">
            <span className="font-display font-bold text-red-500 text-lg">🚫 AKIBAT FATAL TIDAK PATUH</span>
          </div>
        );
      }
      if (line.startsWith("✅ PROSEDUR AMAN")) {
        return (
          <div key={idx} className="mt-4 mb-2 bg-teal-950/30 border-l-4 border-teal-400 p-3 rounded-r-lg">
            <span className="font-display font-bold text-teal-400 text-lg">✅ PROSEDUR AMAN (SOP)</span>
          </div>
        );
      }

      // Formatting standard markdown style bullet points or paragraphs
      let formattedLine = line;
      let isBold = false;
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-lg font-bold text-amber-300 mt-4 mb-1 font-display">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-xl font-bold text-amber-400 mt-5 mb-2 border-b border-slate-800 pb-1 font-display">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const textContent = line.replace(/^[-*]\s+/, "");
        // support inline bold **text**
        return (
          <li key={idx} className="ml-5 list-disc text-slate-300 my-1 leading-relaxed">
            {parseInlineStyles(textContent)}
          </li>
        );
      }
      return <p key={idx} className="text-slate-300 my-1.5 leading-relaxed">{parseInlineStyles(line)}</p>;
    });
  };

  // Helper code to map markdown '**text**' to actual JSX <strong> tags
  const parseInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-amber-300 font-semibold">{part.slice(2, -2)}</strong>;
      }
      // Quick support for mono blocks `code`
      const subParts = part.split(/(`.*?`)/g);
      return subParts.map((subPart, j) => {
        if (subPart.startsWith("`") && subPart.endsWith("`")) {
          return <code key={j} className="bg-slate-900 border border-slate-800 text-yellow-400 rounded px-1 text-sm font-mono">{subPart.slice(1, -1)}</code>;
        }
        return subPart;
      });
    });
  };

  const getActiveTabButtonClass = (tab: typeof activeTab) => {
    return activeTab === tab
      ? "flex items-center gap-2.5 py-3 px-4 bg-amber-500 text-slate-950 font-bold rounded-lg shadow-md transition-all duration-200"
      : "flex items-center gap-2.5 py-3 px-4 text-slate-400 hover:text-amber-400 hover:bg-slate-900 font-semibold rounded-lg transition-all duration-200";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="tab-musake-app">
      {/* Heavy-Machinery Style Header */}
      <header className="bg-slate-900 border-b-4 border-amber-500 px-4 py-4 md:px-8 relative overflow-hidden">
        {/* Warning Hazard Line top highlight */}
        <div className="absolute top-0 left-0 w-full h-1 zebra-stripes opacity-40"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-950 border-2 border-amber-500 rounded-xl glow-yellow overflow-hidden flex items-center justify-center shrink-0 animate-pulse hover:animate-none">
              <img 
                src={tabBotLogo} 
                alt="TAB-Bot Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold font-display uppercase tracking-tight text-amber-400">
                  TAB MUSAKE AI
                </h1>
                <span className="text-[10px] bg-slate-950 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  STT & TTS AKTIF
                </span>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  BINAAN UT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Official Heavy Equipment Learning Assistant &bull; <span className="text-amber-300 font-semibold">SMK Muhammadiyah 1 Kepanjen</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end">
            {/* Interactive Class Level Selection Dropdown/Pills in Header */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-3 py-2 rounded-xl text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tingkat Kelas:</span>
              <div className="flex gap-1">
                {(["Kelas X", "Kelas XI", "Kelas XII"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setClassLevel(lvl)}
                    className={`px-2 py-1 rounded text-[10px] font-extrabold transition-all ${
                      classLevel === lvl
                        ? "bg-amber-500 text-slate-950 font-bold shadow"
                        : "text-slate-400 hover:text-amber-400 hover:bg-slate-900"
                    }`}
                    title={`Materi Khusus ${lvl}`}
                  >
                    {lvl.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs leading-tight">
              <span className="text-slate-400 block font-light text-[9px] uppercase tracking-wider">Semboyan Belajar:</span>
              <span className="text-amber-400 font-semibold italic text-xs block">"Berakhlaq, Cerdas, dan Terampil"</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 max-w-full pb-3 lg:pb-0 h-fit lg:border-r border-slate-800 lg:pr-4">
          <button 
            id="tab-btn-beranda"
            onClick={() => setActiveTab("beranda")} 
            className={`${getActiveTabButtonClass("beranda")} whitespace-nowrap w-auto lg:w-full`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>🏠 Beranda</span>
          </button>

          <button 
            id="tab-btn-chat"
            onClick={() => setActiveTab("chat")} 
            className={`${getActiveTabButtonClass("chat")} whitespace-nowrap w-auto lg:w-full`}
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <span>🤖 TAB MUSAKE AI</span>
          </button>

          <button 
            id="tab-btn-materi"
            onClick={() => setActiveTab("materi")} 
            className={`${getActiveTabButtonClass("materi")} whitespace-nowrap w-auto lg:w-full`}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span>📚 Materi Ajar</span>
          </button>
          
          <button 
            id="tab-btn-quiz"
            onClick={() => {
              setActiveTab("quiz");
              setUserSelectedOption(null);
              setQuizSubmitted(false);
              setQuizFeedback(null);
            }} 
            className={`${getActiveTabButtonClass("quiz")} whitespace-nowrap w-auto lg:w-full`}
          >
            <FileQuestion className="w-5 h-5 shrink-0" />
            <span>📝 Quiz Ujian</span>
          </button>

          <button 
            id="tab-btn-pkl"
            onClick={() => setActiveTab("pkl")} 
            className={`${getActiveTabButtonClass("pkl")} whitespace-nowrap w-auto lg:w-full`}
          >
            <Building2 className="w-5 h-5 shrink-0" />
            <span>🏭 Jurnal & PKL Hub</span>
          </button>

          <button 
            id="tab-btn-karier"
            onClick={() => setActiveTab("karier")} 
            className={`${getActiveTabButtonClass("karier")} whitespace-nowrap w-auto lg:w-full`}
          >
            <Briefcase className="w-5 h-5 shrink-0" />
            <span>💼 Karier & Alat K3</span>
          </button>

          <button 
            id="tab-btn-tentang"
            onClick={() => setActiveTab("tentang")} 
            className={`${getActiveTabButtonClass("tentang")} whitespace-nowrap w-auto lg:w-full`}
          >
            <Info className="w-5 h-5 shrink-0" />
            <span>ℹ️ Tentang Sekolah</span>
          </button>

          {/* Quick Informational Panel for students */}
          <div className="hidden lg:block mt-6 border-t border-slate-800 pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 font-display">Kurikulum Binaan</h4>
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg text-xs text-slate-300">
              <span className="font-bold text-yellow-500 block mb-1">PT UNITED TRACTORS TBK</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Program Keahlian Teknik Alat Berat SMK Muhammadiyah 1 Kepanjen diselaraskan khusus dengan standar mekanik handal UT.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 italic">
                Pilih tab kelas di kanan atas untuk memicu respons spesifik tingkat kompetensi Anda!
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Display Area */}
        <main className="lg:col-span-9 flex flex-col min-h-[500px]">
          
          {/* TAB 0: BERANDA (HOME SCREEN) */}
          {activeTab === "beranda" && (
            <div className="space-y-5 animate-fade-in" id="tab-pane-beranda">
              {/* Grand Banner */}
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                
                <div className="space-y-4 max-w-xl text-center md:text-left z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Asisten Belajar Heavy Equipment
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight text-white uppercase tracking-tight">
                    Gerbang Belajar <span className="text-amber-400">Teknik Alat Berat</span>
                  </h2>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light">
                    Selamat datang di simulator belajar resmi **Program Keahlian Teknik Alat Berat SMK Muhammadiyah 1 Kepanjen** (Sekolah Binaan PT United Tractors Tbk). Dapatkan kemudahan konsultasi troubleshooting mekanik, kuis UKK, draf jurnal PKL, serta evaluasi praktik visual didukung teknologi AI.
                  </p>
                  
                  {/* Buttons */}
                  <div className="pt-3 flex flex-wrap justify-center md:justify-start gap-2.5">
                    <button
                      onClick={() => setActiveTab("chat")}
                      className="px-5 py-3 bg-amber-500 hover:bg-amber-600 hover:glow-yellow text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow cursor-pointer font-sans"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Mulai Bertanya (Chat)</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("chat");
                        // start listening automatically
                        setTimeout(() => toggleListening(), 200);
                      }}
                      className="px-5 py-3 bg-slate-900 hover:bg-slate-850 text-amber-400 border border-slate-800 hover:border-slate-750 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer font-sans"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Mulai Bicara (Suara)</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("chat");
                        setIsAssessorMode(true);
                        fileInputRef.current?.click();
                      }}
                      className="px-5 py-3 bg-slate-900 hover:bg-slate-850 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/30 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Image className="w-4 h-4" />
                      <span>Analisis Gambar Praktik</span>
                    </button>
                  </div>
                </div>

                <div className="w-40 h-40 shrink-0 relative flex items-center justify-center bg-slate-950 rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl glow-yellow">
                  <img 
                    src={tabBotLogo} 
                    alt="TAB-Bot Mascot Logo" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Bento Grid Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-5 space-y-2.5">
                  <div className="w-9 h-9 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center border border-amber-500/20">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold font-display text-sm text-slate-100 uppercase">Standar K3LH Tinggi</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Kuasai keselamatan operasional bengkel alat berat standar ISO, prosedur LOTO (*Lock-Out Tag-Out*), dan perlengkapan APD mekanik yang wajib dipatuhi.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-5 space-y-2.5">
                  <div className="w-9 h-9 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center border border-amber-500/20">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold font-display text-sm text-slate-100 uppercase">Binaan United Tractors</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Materi dan studi kasus diselaraskan khusus dengan kurikulum PT United Tractors Tbk untuk menjamin taruna lulus sebagai teknisi profesional berkompeten.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-5 space-y-2.5">
                  <div className="w-9 h-9 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center border border-amber-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold font-display text-sm text-slate-100 uppercase">Mekanik Asisten AI</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Asisten belajar yang bisa mendengar suara Anda secara langsung, menjawab troubleshooting, dan menganalisis visual komponen dalam sekejap.
                  </p>
                </div>
              </div>

              {/* Semboyan Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Award className="w-9 h-9 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Komitmen Taruna TAB</h4>
                    <p className="text-sm font-semibold text-slate-200">
                      Membentuk karakter mekanik berkompeten tinggi dengan pondasi akhlaqul karimah.
                    </p>
                  </div>
                </div>
                <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-850 font-display font-medium text-xs text-amber-400 uppercase tracking-widest text-center">
                  "Berakhlaq, Cerdas, dan Terampil"
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: CORE CHAT AI */}
          {activeTab === "chat" && (
            <div className="flex flex-col flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden" id="tab-pane-chat">
              
              {/* Chat Sub-Header Info */}
              <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-mono text-slate-300">Sesi Belajar Aktif bersama Instruktur AI</span>
                </div>
                <button 
                  onClick={() => {
                    if (confirm("Yakinkah Anda ingin me-restart seluruh riwayat chat belajar?")) {
                      setMessages([
                        {
                          id: "welcome",
                          role: "model",
                          text: "Halo rekan siswa Teknik Alat Berat SMK Muhammadiyah 1 Kepanjen! 🚜\n\nSaya **TAB MUSAKE AI**, instruktur digital Anda. Saya siap membantu Anda menguasai teori, praktik, troubleshooting, K3LH, persiapan magang (PKL), hingga ujian kompetensi dan wawancara kerja mekanik alat berat.\n\nSilakan pilih salah satu contoh pertanyaan di bawah atau ketik langsung apa yang ingin Anda pelajari harian!",
                          timestamp: new Date()
                        }
                      ]);
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-all"
                  title="Clear chat"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Mulai Baru</span>
                </button>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[550px] min-h-[350px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {/* Bot icon avatar */}
                    {message.role === "model" && (
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-500/30 flex items-center justify-center shrink-0 glow-yellow select-none bg-slate-950">
                        <img 
                          src={tabBotLogo} 
                          alt="TAB-Bot Avatar" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className={`max-w-[85%] rounded-xl p-4 shadow-sm border ${
                      message.role === "user" 
                        ? "bg-amber-500 text-slate-950 border-amber-600 font-medium" 
                        : "bg-slate-950 text-slate-100 border-slate-800"
                    }`}>
                      {message.role === "user" ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{message.text}</p>
                      ) : (
                        <div className="text-sm md:text-base space-y-2">
                          {formatMarkdownResponse(message.text)}
                        </div>
                      )}
                      
                      <div className={`text-[10px] mt-2 block text-right ${
                        message.role === "user" ? "text-slate-950/70" : "text-slate-500"
                      } font-mono`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* User avatar */}
                    {message.role === "user" && (
                      <div className="w-9 h-9 rounded-lg bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-xs select-none uppercase">
                        Siswa
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3.5 justify-start">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-500/30 flex items-center justify-center shrink-0 glow-yellow select-none bg-slate-950">
                      <img 
                        src={tabBotLogo} 
                        alt="TAB-Bot Avatar" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-4 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-75"></span>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-150"></span>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-225"></span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">TAB MUSAKE AI sedang menganalisis unit...</span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Starter Prompt Templates Hub */}
              <div className="bg-slate-950 border-t border-slate-800 p-3.5 space-y-3">
                <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-850">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    PINTASAN MODUL BELAJAR INTERAKTIF
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleQuickQuestion("/guru")}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-850 rounded-full text-xs font-semibold text-amber-400 transition-all cursor-pointer shadow-sm"
                    >
                      <span>👨‍🏫 /guru</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion("/quiz")}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-850 rounded-full text-xs font-semibold text-amber-400 transition-all cursor-pointer shadow-sm"
                    >
                      <span>🏆 /quiz</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion("/kerja")}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-850 rounded-full text-xs font-semibold text-amber-400 transition-all cursor-pointer shadow-sm"
                    >
                      <span>💼 /kerja</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion("/pkl")}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-850 rounded-full text-xs font-semibold text-amber-400 transition-all cursor-pointer shadow-sm"
                    >
                      <span>📓 /pkl</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion("/praktik")}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-850 rounded-full text-xs font-semibold text-amber-400 transition-all cursor-pointer shadow-sm"
                    >
                      <span>🔧 /praktik</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion("/ukk")}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-850 rounded-full text-xs font-semibold text-amber-400 transition-all cursor-pointer shadow-sm"
                    >
                      <span>🥇 /ukk</span>
                    </button>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wide flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  CONTOH TOPIK HARIAN (SOP UNITED TRACTORS)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleQuickQuestion("Kenapa tekanan oli mesin diesel excavator Komatsu PC200 drop drastis di pagi hari saat start?")}
                    className="p-2 text-left bg-slate-900 hover:bg-slate-850 hover:border-amber-500/50 border border-slate-800 rounded-lg text-xs leading-snug transition-all"
                  >
                    <span className="font-bold text-amber-400 block mb-0.5">🔍 Troubleshooting</span>
                    Tekanan oli drop mendadak di pagi hari pada unit PC200.
                  </button>

                  <button 
                    onClick={() => handleQuickQuestion("Jelaskan secara detail pengertian, fungsi, dan cara kerja Torque Converter")}
                    className="p-2 text-left bg-slate-900 hover:bg-slate-850 hover:border-amber-500/50 border border-slate-800 rounded-lg text-xs leading-snug transition-all"
                  >
                    <span className="font-bold text-amber-400 block mb-0.5">📖 Teori Komponen</span>
                    Prinsip kerja hidrosinetis dari Torque Converter.
                  </button>

                  <button 
                    onClick={() => handleQuickQuestion("Bagaimana langkah K3LH yang aman untuk melepas roda crawler track (Undercarriage) agar terhindar dari ketapel pegas recoil tensioner?")}
                    className="p-2 text-left bg-slate-900 hover:bg-slate-850 hover:border-amber-500/50 border border-slate-800 rounded-lg text-xs leading-snug transition-all"
                  >
                    <span className="font-bold text-amber-400 block mb-0.5">🦺 Keselamatan Kerja</span>
                    Bahaya tegangan mekanis pegas recoil undercarriage.
                  </button>

                  <button 
                    onClick={() => handleQuickQuestion("Berperan sebagai tim penguji wawancara kerja teknisi PT United Tractors. Tanyakan saya soal interview!")}
                    className="p-2 text-left bg-slate-900 hover:bg-slate-850 hover:border-amber-500/50 border border-slate-800 rounded-lg text-xs leading-snug transition-all"
                  >
                    <span className="font-bold text-amber-400 block mb-0.5">💼 Wawancara Kerja HRD</span>
                    Simulasi wawancara mekanik magang / kerja.
                  </button>

                  <button 
                    onClick={() => handleQuickQuestion("Berikan saya soal asesmen uji kompetensi keahlian tentang hydraulic system dengan format pilihan ganda dan hots beserta pembahasannya.")}
                    className="p-2 text-left bg-slate-900 hover:bg-slate-850 hover:border-amber-500/50 border border-slate-800 rounded-lg text-xs leading-snug transition-all"
                  >
                    <span className="font-bold text-amber-400 block mb-0.5">🏆 Uji Kompetensi</span>
                    Soal analisis sistem kerja katup kendali hidrolik.
                  </button>

                  <button 
                    onClick={() => handleQuickQuestion("Hitunglah gaya piston silinder jika tekanan hydraulic sistem diatur pada 210 bar sedangkan diameter piston rod barunya 80 mm.")}
                    className="p-2 text-left bg-slate-900 hover:bg-slate-850 hover:border-amber-500/50 border border-slate-800 rounded-lg text-xs leading-snug transition-all"
                  >
                    <span className="font-bold text-amber-400 block mb-0.5">🧮 Perhitungan Fisika</span>
                    Gaya hidrolik silinder rod (F = P * A).
                  </button>
                </div>
              </div>

              {/* Image Preview attachment row inside compose box */}
              {selectedImage && (
                <div className="px-4 py-2 bg-slate-950 border-t border-slate-805 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedImage.preview} 
                      alt="Attachment Preview" 
                      className="w-12 h-12 rounded object-cover border border-amber-500/50"
                    />
                    <div>
                      <span className="text-xs font-bold text-amber-400 block font-mono">FOTO AKTIVITAS / KOMPONEN TERPILIH</span>
                      <span className="text-[10px] text-slate-400">Siap dikirim untuk diuji oleh AI.</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="p-1 px-2.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded text-xs transition-all tracking-wider"
                  >
                    HAPUS FOTO
                  </button>
                </div>
              )}

              {/* Chat Command Control Buttons */}
              <div className="p-2 px-3 bg-slate-950 border-t border-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-[11px] text-amber-500 hover:text-amber-400">
                  <input 
                    type="checkbox" 
                    checked={isAssessorMode}
                    onChange={(e) => setIsAssessorMode(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>📸 AKTIFKAN PENILAI PRAKTIK (ASSESSOR MODE VISION)</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[10px] flex items-center gap-1.5 transition-all ${
                      isTtsEnabled 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-slate-900 text-slate-500 border border-slate-800"
                    }`}
                  >
                    <span>🔊 SUARA BALASAN AI: {isTtsEnabled ? "AKTIF" : "SENYAP"}</span>
                  </button>
                </div>
              </div>

              {/* Chat Input Area */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
              >
                {/* Voice speech-to-text mic trigger */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    isListening 
                      ? "bg-red-600 text-white animate-pulse glow-red"
                      : "bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-800"
                  }`}
                  title={isListening ? "Merekam suara Anda (Tekan untuk stop)..." : "Gunakan asisten suara (Voice Assistant)"}
                >
                  <Mic className="w-5 h-5" />
                </button>

                {/* Upload Image paperclip trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-amber-400 border border-slate-800 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer"
                  title="Lampirkan foto praktek / komponen rujukan"
                >
                  <Image className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isAssessorMode 
                      ? "Unggah foto di kiri atas lalu klik KIRIM untuk mulai penilaian..." 
                      : "Ketik pertanyaan teknik atau troubleshooting (cth: 'Excavator low power')..."
                  }
                  className="flex-1 bg-slate-905 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-slate-100 placeholder-slate-500 font-sans"
                  disabled={isTyping}
                  id="chat-input-field"
                />
                
                <button
                  type="submit"
                  disabled={isTyping || (!inputText.trim() && !selectedImage)}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-850 disabled:text-slate-600 text-slate-950 px-5 py-3 rounded-lg flex items-center justify-center font-extrabold tracking-wide transition-all gap-1.5 cursor-pointer font-sans"
                  id="chat-send-btn"
                >
                  <span>KIRIM</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}


          {/* TAB 2: TEXTBOOK BOOKLET & GLOSSARY */}
          {activeTab === "materi" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 animate-fade-in" id="tab-pane-materi">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 text-slate-950 flex items-center justify-center rounded-lg">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-amber-400 uppercase tracking-tight">Perpustakaan & Glosarium Teknik Alat Berat</h3>
                    <p className="text-xs text-slate-400">Pusat bacaan mandiri untuk menguasai kompetensi dasar hingga standar industri United Tractors.</p>
                  </div>
                </div>

                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
                  <button
                    onClick={() => setGlossaryCategory("Semua")}
                    className={`px-3 py-1.5 rounded text-xs transition-all font-semibold ${
                      glossaryCategory === "Semua" 
                        ? "bg-amber-500 text-slate-950 font-bold" 
                        : "text-slate-400 hover:text-amber-400"
                    }`}
                  >
                    Buku Saku
                  </button>
                  <button
                    onClick={() => setGlossaryCategory("Engine")}
                    className={`px-3 py-1.5 rounded text-xs transition-all font-semibold ${
                      glossaryCategory === "Engine" 
                        ? "bg-amber-500 text-slate-950 font-bold" 
                        : "text-slate-400 hover:text-amber-400"
                    }`}
                  >
                    Kamus Istilah
                  </button>
                </div>
              </div>

              {glossaryCategory === "Semua" ? (
                <div className="space-y-6">
                  {/* Textbook booklets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-3 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs bg-red-500/10 text-red-400 font-bold px-2.5 py-1 rounded border border-red-500/20">MODUL 01</span>
                        <h4 className="font-bold text-slate-200">Engine Diesel & Fuel System</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        Mempelajari siklus kerja diesel 4-langkah, komponen silinder, piston, katup, crankshaft, hingga sistem suplai solar tekanan tinggi generasi terbaru **HPRI (High Pressure Common Rail Injection)**.
                      </p>
                      <ul className="text-[11px] text-slate-500 space-y-1 font-mono">
                        <li>• Fungsi Feed Pump & Supply Pump</li>
                        <li>• Mekanisme kerja Injector Solenoid</li>
                        <li>• Troubleshooting: Mesin pincang (misfire)</li>
                      </ul>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-3 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs bg-sky-500/10 text-sky-400 font-bold px-2.5 py-1 rounded border border-sky-500/20">MODUL 02</span>
                        <h4 className="font-bold text-slate-200">Sistem Hidrolik (Hydraulics)</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        Prinsip Hukum Pascal (F = P × A) yang diterapkan pada sirkuit hidrolik unit. Membahas pompa hidrolik (*Variable Displacement Piston Pump*), katup pengarah (*Control Valve*), serta aktuator silinder.
                      </p>
                      <ul className="text-[11px] text-slate-500 space-y-1 font-mono">
                        <li>• Analisis diagram skematik hidrolik</li>
                        <li>• Fungsi Relief Valve (pengatur tekanan kerja)</li>
                        <li>• Bahas bahaya kebocoran mikro (fluida mikro penetrasi)</li>
                      </ul>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-3 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs bg-amber-500/10 text-amber-400 font-bold px-2.5 py-1 rounded border border-amber-500/20">MODUL 03</span>
                        <h4 className="font-bold text-slate-200">Power Train & Undercarriage</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        Aliran daya putar gerak sasis dari Flywheel Engine menuju **Torque Converter**, transmisi powershift, differential bevel gear, hingga reduksi akhir di **Final Drive** dan menggerakkan rantai undercarriage.
                      </p>
                      <ul className="text-[11px] text-slate-500 space-y-1 font-mono">
                        <li>• Fungsi utama Torque Converter fluid coupling</li>
                        <li>• Mekanisme kerja planetary gear set</li>
                        <li>• Pengukuran keausan track link & sprocket</li>
                      </ul>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-3 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded border border-emerald-500/20">MODUL 04</span>
                        <h4 className="font-bold text-slate-200">Preventive Maintenance SOP</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        Standar perawatan berkala harian (P2H) hingga jadwal penggantian filter dan oli di jam kerja tertentu (PM 250, PM 500, PM 1000, PM 2000) sesuai rekomendasi manufacturer Komatsu & Caterpillar.
                      </p>
                      <ul className="text-[11px] text-slate-500 space-y-1 font-mono">
                        <li>• Prosedur lubrikasi nepel grease</li>
                        <li>• Pengambilan sampel oli (S.O.S analysis)</li>
                        <li>• Kriteria kebersihan bahan bakar solar bebas air</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-400">Ingin mendalami materi di atas dengan model dialog interaktif?</p>
                    <button
                      onClick={() => {
                        setActiveTab("chat");
                        handleQuickQuestion("Jelaskan materi modul Teknik Alat Berat tentang HPRI dan hidrolik system!");
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg uppercase tracking-wider"
                    >
                      Bahas Bersama AI
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Search Engine and Category Buttons */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-8">
                      <input
                        type="text"
                        value={glossarySearch}
                        onChange={(e) => setGlossarySearch(e.target.value)}
                        placeholder="Cari kata kunci istilah (cth: 'Common Rail', 'LOTO', 'Relief Valve')..."
                        className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>
                    <div className="md:col-span-4 flex items-center justify-end">
                      <span className="text-[11px] text-slate-500 font-mono">Ditemukan: {filteredGlossary.length} istilah</span>
                    </div>
                  </div>

                  {/* Glossary Term Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGlossary.length > 0 ? (
                      filteredGlossary.map((term, index) => (
                        <div 
                          key={index} 
                          className="bg-slate-950 border border-slate-850 p-4 rounded-xl hover:border-amber-500/20 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-base font-bold text-amber-400 font-display">{term.term}</span>
                              <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-mono">
                                {term.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-light mb-2">{term.definition}</p>
                            
                            <div className="bg-slate-900/50 p-2.5 rounded border border-slate-850 text-[11px] text-slate-400 leading-snug mb-3">
                              <span className="font-semibold block text-amber-500/80 mb-0.5">⚙️ FUNGSI SISTEM:</span>
                              {term.function}
                            </div>
                          </div>

                          <div className="text-[10px] bg-amber-500/5 text-amber-400/80 border-l-2 border-amber-500 p-2 rounded-r">
                            <span className="font-bold uppercase block text-[9px] mb-0.5">SOP & Bahaya Kerja (K3LH):</span>
                            {term.example}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 text-slate-500">
                        Tidak ada istilah yang cocok dengan pencarian Anda. Coba istilah lain seperti "Common Rail" atau "LOTO".
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* TAB 3: QUIZ & ASSESSMENT SIMULATION */}
          {activeTab === "quiz" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6" id="tab-pane-quiz">
              
              <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 text-slate-950 flex items-center justify-center rounded-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-amber-400 uppercase tracking-tight">Simulasi Uji Kompetensi Keahlian (UKK)</h3>
                    <p className="text-xs text-slate-400">Siapkan mental hadapi BNSP dan LSP dengan latihan soal analitis berbasis HOTS.</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-lg text-right">
                  <span className="text-[9px] block text-slate-400 font-bold uppercase tracking-wider">SKOR SEKARANG</span>
                  <span className="text-base font-mono font-bold text-amber-400">
                    {quizScore.correct} / {quizScore.total}
                  </span>
                </div>
              </div>

              {/* Quiz layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Active question */}
                <div className="lg:col-span-8 space-y-5">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
                    
                    {/* Header badge */}
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-mono px-2.5 py-1 rounded">
                        Pertanyaan {selectedQuizIndex + 1} dari {SAMPLE_QUIZZES.length}
                      </span>
                      
                      <div className="flex gap-1.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${
                          getCategoryColor(SAMPLE_QUIZZES[selectedQuizIndex].category)
                        }`}>
                          {SAMPLE_QUIZZES[selectedQuizIndex].category}
                        </span>
                        
                        {SAMPLE_QUIZZES[selectedQuizIndex].isHots && (
                          <span className="text-[10px] bg-red-500 text-slate-100 font-bold px-2.5 py-1 rounded uppercase tracking-wider animate-pulse">
                            SOAL HOTS
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-base md:text-lg font-bold font-display text-slate-100 leading-snug">
                      {SAMPLE_QUIZZES[selectedQuizIndex].question}
                    </h4>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3.5">
                    {SAMPLE_QUIZZES[selectedQuizIndex].options.map((option, idx) => {
                      const letter = ["A", "B", "C", "D", "E"][idx];
                      
                      let optionClass = "flex items-start gap-3 w-full text-left p-4 rounded-xl border transition-all text-sm leading-relaxed ";
                      if (quizSubmitted) {
                        if (idx === SAMPLE_QUIZZES[selectedQuizIndex].correctAnswer) {
                          // Correct answer glows green
                          optionClass += "bg-emerald-500/10 border-emerald-500 text-slate-100 font-medium";
                        } else if (idx === userSelectedOption) {
                          // User selected wrong answer glows red
                          optionClass += "bg-red-500/10 border-red-500 text-slate-300";
                        } else {
                          optionClass += "bg-slate-950/60 border-slate-850 text-slate-500 cursor-not-allowed";
                        }
                      } else {
                        // Standard selection styling
                        optionClass += userSelectedOption === idx
                          ? "bg-amber-500/15 border-amber-500 text-slate-100 font-medium glow-yellow"
                          : "bg-slate-950 hover:bg-slate-850 border-slate-850 hover:border-slate-700 text-slate-300";
                      }

                      return (
                        <button
                          key={idx}
                          id={`quiz-opt-${idx}`}
                          onClick={() => {
                            if (!quizSubmitted) {
                              setUserSelectedOption(idx);
                            }
                          }}
                          disabled={quizSubmitted}
                          className={optionClass}
                        >
                          <span className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            quizSubmitted
                              ? idx === SAMPLE_QUIZZES[selectedQuizIndex].correctAnswer
                                ? "bg-emerald-500 text-slate-950"
                                : idx === userSelectedOption
                                  ? "bg-red-500 text-slate-100"
                                  : "bg-slate-800 text-slate-600"
                              : userSelectedOption === idx
                                ? "bg-amber-500 text-slate-950"
                                : "bg-slate-900 group-hover:bg-slate-800 text-slate-400"
                          }`}>
                            {letter}
                          </span>
                          <span className="pt-0.5">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Submission controls */}
                  <div className="flex gap-3 justify-end pt-2">
                    {quizSubmitted ? (
                      <button
                        id="quiz-next-btn"
                        onClick={nextQuiz}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm uppercase tracking-wider transition-all shadow-md"
                      >
                        <span>Soal Berikutnya</span>
                        <ChevronRight className="w-4.5 h-4.5" />
                      </button>
                    ) : (
                      <button
                        id="quiz-submit-btn"
                        onClick={submitQuizAnswer}
                        disabled={userSelectedOption === null}
                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-850 disabled:text-slate-500 text-slate-950 font-bold px-8 py-3 rounded-xl flex items-center gap-2 text-sm uppercase tracking-wider transition-all shadow-sm"
                      >
                        <Check className="w-4.5 h-4.5" />
                        <span>Kunci & Nilai</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Score breakdown & explanation pane */}
                <div className="lg:col-span-4 p-5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-800">
                      💡 EVALUASI PEMBAHASAN ASESOR
                    </h4>

                    {quizSubmitted ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {quizFeedback === "BENAR" ? (
                            <div className="bg-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-bold tracking-widest flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              JAWABAN BETUL!
                            </div>
                          ) : (
                            <div className="bg-red-500/20 text-red-500 px-3.5 py-1.5 rounded-lg border border-red-500/30 text-xs font-bold tracking-widest flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 animate-bounce" />
                              JAWABAN SALAH
                            </div>
                          )}
                        </div>

                        <div className="text-slate-350 text-xs leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-850">
                          <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] block mb-1.5">PEMBAHASAN TEKNIS:</span>
                          {SAMPLE_QUIZZES[selectedQuizIndex].explanation}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-600 flex flex-col items-center">
                        <HelpCircle className="w-10 h-10 mb-2.5 text-slate-800" />
                        <p className="text-xs font-semibold text-slate-500">Kunci jawaban Anda dahulu.</p>
                        <p className="text-[11px] text-slate-600 max-w-xs mt-1">Pembahasan lengkap dari instruktur industri akan dirilis otomatis di panel ini sesaat setelah penguncian opsi.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 border-t border-slate-900 pt-4 flex flex-col gap-2">
                    <button
                      onClick={resetQuiz}
                      className="w-full text-slate-400 border border-slate-800 hover:border-slate-700 font-semibold py-2.5 rounded-lg text-xs tracking-wider transition-all hover:text-amber-400 hover:bg-slate-900"
                    >
                      Reset Score & Mulai Lagi
                    </button>
                    
                    <div className="text-[10px] text-slate-500 text-center uppercase tracking-widest leading-normal">
                      Direkomendasikan oleh panitia LSP SMK
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}


          {/* TAB 4: PKL HUB & DRAFTING ASSISTANT */}
          {activeTab === "pkl" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 animate-fade-in" id="tab-pane-pkl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 bg-amber-500 text-slate-950 flex items-center justify-center rounded-lg">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-amber-400 uppercase tracking-tight">Jurnal & Hub PKL (Praktik Kerja Lapangan)</h3>
                  <p className="text-xs text-slate-400">Tingkatkan kualitas laporan PKL SMK dan jurnal harianmu agar sesuai standar industri United Tractors.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Inputs for PKL journaling */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block pb-2 border-b border-slate-900">
                    ✍️ INPUT AKTIVITAS MAGANG HARIAN
                  </span>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                      Pekerjaan Yang Dilakukan Hari Ini
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Contoh: Ikut mekanik ganti seal hidrolik boom cylinder excavator PC200..."
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 placeholder-slate-600 font-sans leading-relaxed"
                      id="pkl-activity-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                      Kategori Sistem Alat Berat
                    </label>
                    <select 
                      id="pkl-sys-select"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-300 font-semibold"
                    >
                      <option value="Engine">Engine & Fuel System</option>
                      <option value="Hydraulic">Hydraulic Circuit</option>
                      <option value="Powertrain">Powertrain & Final Drive</option>
                      <option value="Undercarriage">Undercarriage Assembly</option>
                      <option value="Preventive">Routine Preventive Maintenance</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      const inputVal = (document.getElementById("pkl-activity-input") as HTMLTextAreaElement)?.value || "";
                      const sysVal = (document.getElementById("pkl-sys-select") as HTMLSelectElement)?.value || "";
                      if (!inputVal.trim()) {
                        alert("Harap masukkan deskripsi aktivitas magang Anda!");
                        return;
                      }
                      setActiveTab("chat");
                      handleQuickQuestion(`Saya sedang PKL dan melakukan aktivitas: "${inputVal}" pada kategori "${sysVal}". Tolong buatkan draf rincian Jurnal Kegiatan PKL dan draf Laporan Bab III terkait keselamatan kerja, alat yang digunakan, langkah pembongkaran, langkah pengukuran dan K3LH yang tepat!`);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-lg text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Draf Laporan dengan AI</span>
                  </button>

                  <div className="text-[10px] text-slate-500 bg-slate-900 p-2.5 rounded border border-slate-850 leading-relaxed font-mono">
                    <span className="text-amber-500 font-bold block mb-0.5">ℹ️ TIPS PENYUSUNAN JURNAL:</span>
                    Kalimat laporan industri harus menggunakan bentuk baku (cth: "Melakukan pelepasan mounting bolt" bukan "nyopot baut"). Klik tombol di atas untuk merapikan deskripsi Anda.
                  </div>
                </div>

                {/* Training Log Templates and Guides */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block pb-1 border-b border-slate-900">
                      📖 FORMAT PENULISAN BAB III LAPORAN PKL
                    </span>

                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      Laporan PKL resmi SMK Muhammadiyah 1 Kepanjen khususnya binaan United Tractors harus memenuhi sistematika baku berikut untuk lolos verifikasi Asesor:
                    </p>

                    <div className="space-y-3 font-sans text-xs">
                      <div className="p-3 bg-slate-900/50 rounded border border-slate-850">
                        <span className="font-bold text-amber-400 block mb-1">3.1 ALAT DAN BAHAN YANG DIGUNAKAN</span>
                        Sebutkan nama kunci pas, socket, dial gauge, torque wrench berserta spesifikasi ukurannya. Jangan menulis "kunci-kunci" secara umum.
                      </div>
                      
                      <div className="p-3 bg-slate-900/50 rounded border border-slate-850">
                        <span className="font-bold text-amber-400 block mb-1">3.2 KESELAMATAN KERJA (K3LH) & LOTO</span>
                        Penerapan LOTO (Lockout/Tagout) wajib digambarkan di awal langkah pembongkaran untuk mengisolasi energi listrik maupun akumulator hidrolik.
                      </div>

                      <div className="p-3 bg-slate-900/50 rounded border border-slate-850">
                        <span className="font-bold text-amber-400 block mb-1">3.3 PROSEDUR LANGKAH KERJA (SOP)</span>
                        Ditulis sistematis berurutan mulai dari persiapan unit, pembersihan area, penandaan (marking), pembongkaran, inspeksi pengukuran, perakitan, dan pengujian akhir.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex gap-2 items-center">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-400">Butuh template Laporan PKL lengkap?</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("chat");
                        handleQuickQuestion("/guru Tolong buatkan kerangka sistematika Modul Laporan PKL SMK Jurusan Teknik Alat Berat yang lengkap dan HOTS!");
                      }}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded uppercase tracking-wider transition-all"
                    >
                      Minta Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* TAB 5: CAREER, CALCULATORS, & SAFETY IN ONE */}
          {activeTab === "karier" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 animate-fade-in" id="tab-pane-karier">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 text-slate-950 flex items-center justify-center rounded-lg">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-amber-400 uppercase tracking-tight">Karier Mekanik & Laboratorium K3</h3>
                    <p className="text-xs text-slate-400">Simulasikan perhitungan parameter hidrolik, inspeksi P2H unit, dan analisis CV ATS industri alat berat.</p>
                  </div>
                </div>

                <div className="flex p-0.5 bg-slate-950 rounded-lg border border-slate-850">
                  <button
                    onClick={() => {
                      setCalcResult(null);
                      setP2hMessage(null);
                    }}
                    className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-extrabold rounded text-xs tracking-wider"
                  >
                    OPERATOR WORKSTATION
                  </button>
                </div>
              </div>

              {/* Dynamic Grid: Calc Section & Checklist Section Side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Kalkulator Alat Berat */}
                <div className="lg:col-span-6 bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-900">
                    <Calculator className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Kalkulator Fisika Alat Berat</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-920 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setCalcType("hydraulic");
                        setCalcResult(null);
                      }}
                      className={`py-1.5 rounded text-[10px] font-bold text-center transition-all ${
                        calcType === "hydraulic" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-amber-300"
                      }`}
                    >
                      Silinder Hidrolik
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCalcType("gear_ratio");
                        setCalcResult(null);
                      }}
                      className={`py-1.5 rounded text-[10px] font-bold text-center transition-all ${
                        calcType === "gear_ratio" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-amber-300"
                      }`}
                    >
                      Rasio Differential
                    </button>
                  </div>

                  <form onSubmit={handleCalculate} className="space-y-3 text-xs">
                    {calcType === "hydraulic" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">TEKANAN (BAR)</label>
                          <input
                            type="number"
                            value={calcInputs.pressure}
                            onChange={(e) => setCalcInputs(prev => ({ ...prev, pressure: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">PISTON D (MM)</label>
                          <input
                            type="number"
                            value={calcInputs.diameter}
                            onChange={(e) => setCalcInputs(prev => ({ ...prev, diameter: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">PINION INPUT (N1)</label>
                          <input
                            type="number"
                            value={calcInputs.teethPinion}
                            onChange={(e) => setCalcInputs(prev => ({ ...prev, teethPinion: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">RING GEAR (N2)</label>
                          <input
                            type="number"
                            value={calcInputs.teethRing}
                            onChange={(e) => setCalcInputs(prev => ({ ...prev, teethRing: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-100 font-mono"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isCalculating}
                      className="w-full bg-amber-500 hover:bg-amber-600 font-bold py-2 text-slate-950 rounded uppercase text-[10px] tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isCalculating ? "MENGHITUNG..." : "Proses Kalkulasi & Bahas via AI"}
                    </button>
                  </form>

                  {calcResult ? (
                    <div className="mt-3 p-3 bg-slate-900 rounded border border-slate-800 text-[11px] prose text-slate-350 leading-relaxed overflow-x-auto h-36 overflow-y-auto custom-scrollbar">
                      {formatMarkdownResponse(calcResult)}
                    </div>
                  ) : (
                    <div className="mt-3 p-4 bg-slate-900 border border-slate-850 rounded text-center text-slate-500 text-[11px]">
                      Masukkan variabel dan tekan tombol kalkulasi untuk melihat langkah penyelesaian mekanis.
                    </div>
                  )}
                </div>

                {/* 2. Checklist P2H & Safety */}
                <div className="lg:col-span-6 bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">PIS Inspeksi Checklist P2H</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${p2hEngineStarted ? "text-emerald-400" : "text-amber-400"}`}>
                      {p2hEngineStarted ? "● ENGINE DEVISE ON" : "● OFFLINE READY"}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                    {p2hItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleP2hCheck(item.id)}
                        className={`p-2 rounded border text-xs flex items-center gap-3 cursor-pointer select-none transition-all ${
                          item.checked 
                            ? "bg-slate-900 border-amber-500/50 text-slate-200" 
                            : "bg-slate-920 border-slate-850 text-slate-400 hover:border-slate-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-slate-700 text-amber-500 bg-slate-900"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[10px] uppercase text-slate-500 font-mono tracking-tight">Kategori: {item.category}</p>
                          <p className="truncate text-slate-200 font-medium text-[11px]">{item.task}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={tryStartEngine}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2 rounded text-[10px] uppercase tracking-wider transition-all shadow"
                    >
                      Putar Starter Unit
                    </button>
                    <button
                      onClick={() => {
                        setP2hItems(prev => prev.map(item => ({ ...item, checked: false })));
                        setP2hEngineStarted(false);
                        setP2hMessage(null);
                      }}
                      className="border border-slate-800 hover:bg-slate-900 text-slate-400 py-2 rounded text-[10px] uppercase tracking-wider transition-all"
                    >
                      Reset Formulir
                    </button>
                  </div>

                  {p2hMessage && (
                    <div className="p-2.5 bg-slate-900 border border-slate-850 rounded text-[10px] font-mono leading-relaxed text-slate-300">
                      {parseInlineStyles(p2hMessage)}
                    </div>
                  )}
                </div>

              </div>

              {/* CV ATS Builder Prompt block */}
              <div className="mt-6 p-4 bg-slate-950 border border-slate-850 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-400 font-display">Persiapan Wawancara Kerja & CV ATS Alat Berat</h4>
                  <p className="text-xs text-slate-400">Minta AI menilai draf riwayat hidupmu agar sesuai dengan preferensi rekrutmen PT United Tractors Tbk.</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("chat");
                    handleQuickQuestion("Bantu saya membuat draf CV ATS-friendly untuk posisi Junior Mechanic Alat Berat lulusan SMK Muhammadiyah 1 Kepanjen dan berikan contoh simulasi tes psikotes!");
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg uppercase tracking-wider shrink-0 transition-all"
                >
                  Mulai Konsultasi Karier
                </button>
              </div>
            </div>
          )}


          {/* TAB 6: ABOUT SCHOOL & INTEGRATION DETAILS */}
          {activeTab === "tentang" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 animate-fade-in" id="tab-pane-tentang">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 bg-amber-500 text-slate-950 flex items-center justify-center rounded-lg">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-amber-400 uppercase tracking-tight">Kemitraan Industri & Profil Sekolah</h3>
                  <p className="text-xs text-slate-400">SMK Muhammadiyah 1 Kepanjen (SMK Musake) Kabupaten Malang Jawa Timur - Sekolah Binaan UT.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* School Profile and Partnership Summary */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-900 flex items-center justify-center rounded-lg border border-slate-800 shrink-0">
                      <span className="text-lg font-extrabold text-amber-400 tracking-tighter">SMK</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-100 font-display uppercase tracking-tight">Program Keahlian Teknik Alat Berat</h4>
                      <p className="text-xs text-slate-400 font-mono">Binaan Resmi PT United Tractors Tbk</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed font-light">
                    Program Keahlian Teknik Alat Berat di **SMK Muhammadiyah 1 Kepanjen** didirikan dengan komitmen menyuplai taruna terampil berakhlaq mulia ke industri pertambangan, kehutanan, perkebunan, dan konstruksi di seluruh Indonesia.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded border border-slate-850">
                      <span className="font-bold text-amber-400 block mb-0.5">Semboyan Belajar:</span>
                      <span className="text-slate-300">"Berakhlaq, Cerdas, dan Terampil"</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded border border-slate-850">
                      <span className="font-bold text-amber-400 block mb-0.5">Kerja Sama Industri:</span>
                      <span className="text-slate-300">PT United Tractors Tbk (UT KPP)</span>
                    </div>
                  </div>

                  <div className="bg-amber-500/5 p-4 rounded-lg border border-amber-500/20 text-xs text-slate-300 space-y-2">
                    <span className="font-bold text-amber-400 block uppercase tracking-wider text-[11px]">STANDAR LULUSAN KOMPETENSI TEKNIS</span>
                    <p className="leading-relaxed font-light">
                      Lulusan dibekali pengetahuan komprehensif penanganan unit berat, sertifikasi sertifikat mekanik kelas dasar, keselamatan tinggi (Zero Accident), dan kedisiplinan kerja ala militer (Bintalsik).
                    </p>
                  </div>
                </div>

                {/* Deploy & Embedding Guide */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block pb-2 border-b border-slate-900">
                    🔗 CONTOH INTEGRASI WEBSITE (IFRAME EMBED)
                  </span>

                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Anda dapat memasang asisten belajar **TAB MUSAKE AI** ini ke dalam situs web sekolah utama atau sistem ujian LMS resmi menggunakan tag HTML standard berikut:
                  </p>

                  <div className="bg-slate-900 p-3 rounded border border-slate-800 font-mono text-[10px] text-emerald-400 select-all overflow-x-auto whitespace-pre-wrap leading-normal">
{`<iframe
  src="https://tabmusake-ai.vercel.app"
  width="100%"
  height="700px"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);"
  allow="microphone; camera; geolocation"
>
</iframe>`}
                  </div>

                  <div className="text-[10px] text-slate-500 leading-normal space-y-1 font-mono">
                    <span className="text-amber-500 font-bold block mb-0.5">🚀 DEPLOYMENT TIPS:</span>
                    Pastikan menambahkan variabel lingkungan <span className="text-amber-400">&#96;GEMINI_API_KEY&#96;</span> di panel konfigurasi Vercel Dashboard Anda untuk mengaktifkan kecerdasan buatan Gemini secara penuh.
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer highlighting industrial credentials */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs gap-4">
          <div className="text-center sm:text-left">
            <span className="font-bold text-amber-500 block">TAB MUSAKE AI &bull; Version 2.0.4</span>
            <span className="text-[11px] text-slate-500">Membantu taruna teknik alat berat menguasai troubleshooting & SOP industri.</span>
          </div>
          <div className="text-center sm:text-right text-[11px]">
            <span>Kurikulum Vokasi Khas SMK Muhammadiyah 1 Kepanjen</span>
            <span className="block text-slate-500 mt-1">Hak Cipta Terlindungi &copy; {new Date().getFullYear()}.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
 
