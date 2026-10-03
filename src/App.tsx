import React, { useState, useEffect, useRef } from 'react';
import { 
  MakeAMatchGame, 
  InteractiveQuiz, 
  ChoiceGame, 
  EmbeddedYouTube,
  ProjectTask
} from './components/InteractiveGames';
import { KecerdasanAnak } from './components/KecerdasanAnak';
import { PanduanMengajar } from './components/PanduanMengajar';
import { BahanPeragaGambar, VisualPeragaItem } from './components/BahanPeragaGambar';
import { MasterKurikulum, MasterKurikulumItem, DEFAULT_MASTER_KURIKULUM } from './components/MasterKurikulum';
import { 
  BookOpen, 
  FileText, 
  MessageSquare,
  Send, 
  Plus, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  User,
  School,
  Calendar,
  ClipboardCheck,
  RefreshCw,
  CheckCircle2,
  Settings,
  Download,
  FileDown,
  X,
  Image as ImageIcon,
  Mic,
  Volume2,
  Loader2,
  Headphones,
  Type,
  Youtube,
  Music,
  FileQuestion,
  Award,
  AlertCircle,
  BrainCircuit,
  Brain,
  Puzzle,
  BarChart3,
  File as FileIcon,
  Cpu,
  Layout,
  Target,
  Users,
  Heart,
  Bot,
  GraduationCap,
  Menu,
  Sparkle,
  Clock,
  Layers,
  LayoutList,
  CheckSquare,
  Square,
  Sparkles as SparklesIcon
} from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  image?: string | null;
  file?: { name: string; size: string } | null;
  audio?: { name: string; size: string } | null;
  aiImage?: string | null;
}

interface AssessmentQuestion {
  id: number;
  type: 'pg' | 'isian' | 'uraian';
  question: string;
  options?: string[];
}

interface ItemEvaluation {
  id: number;
  status: 'correct' | 'incorrect' | 'partial';
  studentAnswer: string;
  correctAnswer?: string;
  evaluation: string;
  improvementTip?: string;
}

interface EvaluationResult {
  rating: number;
  score: number;
  hots_analysis: string;
  motivation: string;
  feedback: { pg: string; isian: string; uraian: string };
  summary?: {
    correctCount?: number;
    incorrectCount?: number;
    strengths?: string[];
    areasToImprove?: string[];
  };
  item_evaluations?: ItemEvaluation[];
}

export interface SupportingMaterialItem {
  id: string;
  kategori: string;
  judul: string;
  tipe: 'lkpd' | 'kartu' | 'video' | 'rubrik' | 'gambar' | 'media' | 'lainnya';
  deskripsi: string;
  instruksiPenggunaan: string;
  langkahRPP?: {
    tahap: 'awal' | 'inti' | 'penutup';
    namaLangkah: string;
    alokasiWaktu?: string;
    peranGuru?: string;
  };
  daftarGambarKoleksi?: VisualPeragaItem[];
  bahanGambar?: {
    judulGambar: string;
    deskripsiVisual: string;
    labelKategori?: string;
    promptAi?: string;
    urlGambar?: string;
    penjelasanKonsep?: string;
  };
  kontenLKPD?: {
    namaAktivitas: string;
    tujuan: string;
    petunjuk: string[];
    langkahLangkah: string[];
    soalDiskusi: Array<{ nomor: number; pertanyaan: string; ruangJawaban?: string }>;
    refleksiSingkat?: string;
  };
  daftarKartu?: Array<{
    kode: string;
    judul: string;
    isi: string;
    kategoriBadges?: string;
    pertanyaanPanduan?: string;
    gambarPeragaUrl?: string;
  }>;
  videoInfo?: {
    judulVideo: string;
    kataKunciPencarian: string;
    youtubeSearchUrl: string;
    deskripsiIsi: string;
    pertanyaanPemantikVideo: string[];
  };
  rubrikPenilaian?: {
    kriteria: Array<{ aspek: string; kriteriaBagus: string; kriteriaBiasa: string; kriteriaPerluBimbingan: string }>;
    skorMaksimal?: number;
    catatanGuru?: string;
  };
  mediaLainnya?: {
    tipeBahan: string;
    panduanLengkap: string;
    langkahPersiapan: string[];
  };
}

export interface SupportingMaterialsData {
  rppTitle: string;
  modelMetode: string;
  ringkasanKebutuhan: string;
  items: SupportingMaterialItem[];
}

type SubTab = 'overview' | 'master-kurikulum' | 'setup' | 'rpp' | 'panduan' | 'pendukung' | 'interactive';

const App: React.FC = () => {
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'belajar-sekolah' | 'kecerdasan-anak'>('kecerdasan-anak');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');
  const [isBelajarSekolahExpanded, setIsBelajarSekolahExpanded] = useState(true);

  // Application logic state
  const [isLoading, setIsLoading] = useState(false);
  const [isSurveying, setIsSurveying] = useState(false);
  const [isGeneratingModel, setIsGeneratingModel] = useState(false);
  const [isGeneratingCP, setIsGeneratingCP] = useState(false);
  const [isGeneratingTP, setIsGeneratingTP] = useState(false);
  const [isGeneratingKBC, setIsGeneratingKBC] = useState(false);
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [isGeneratingSupporting, setIsGeneratingSupporting] = useState(false);
  const [supportingMaterials, setSupportingMaterials] = useState<SupportingMaterialsData | null>(null);
  const [singleItemToPrint, setSingleItemToPrint] = useState<SupportingMaterialItem | null>(null);
  const [activePendukungFilter, setActivePendukungFilter] = useState<'all' | 'gambar' | 'lkpd' | 'kartu' | 'video' | 'rubrik' | 'lainnya'>('all');
  const [fullScreenImageModal, setFullScreenImageModal] = useState<VisualPeragaItem | null>(null);
  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [generatedRPP, setGeneratedRPP] = useState<string | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, string>>({});
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [attachedAudio, setAttachedAudio] = useState<{ name: string; size: string } | null>(null);
  const [isLessonFinished, setIsLessonFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);

  // Master Kurikulum shared state (persisted in localStorage)
  const [masterKurikulumList, setMasterKurikulumList] = useState<MasterKurikulumItem[]>(() => {
    try {
      const saved = localStorage.getItem('guru_gem_master_kurikulum');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading master kurikulum from localStorage:', e);
    }
    return DEFAULT_MASTER_KURIKULUM;
  });

  const updateMasterKurikulumList = (newList: MasterKurikulumItem[]) => {
    setMasterKurikulumList(newList);
    try {
      localStorage.setItem('guru_gem_master_kurikulum', JSON.stringify(newList));
    } catch (e) {
      console.warn('Error saving master kurikulum to localStorage:', e);
    }
  };

  // Helper pemetaan kelas ke fase Kurikulum Merdeka
  const getFaseFromKelas = (kelasVal: string | number): string => {
    const n = parseInt(String(kelasVal), 10) || 1;
    if (n <= 2) return "Fase A";
    if (n <= 4) return "Fase B";
    if (n <= 6) return "Fase C";
    if (n <= 9) return "Fase D";
    if (n === 10) return "Fase E";
    return "Fase F";
  };

  // Filter ketat: Hanya menampilkan data jika cocok presisi dengan Mapel, Fase, DAN Semester
  // Jika tidak ada induk filter atau data tidak cocok -> KOSONG ([])
  const getFilteredCurriculum = (mapel: string, kelas: string | number, semester?: string): MasterKurikulumItem[] => {
    const cleanMapel = (mapel || '').trim().toLowerCase();
    if (!cleanMapel || cleanMapel === 'mata pelajaran') {
      return [];
    }
    const targetFase = getFaseFromKelas(kelas).toLowerCase();
    
    // Identifikasi target semester: "1" untuk Ganjil, "2" untuk Genap
    const targetSem = (semester || '').toLowerCase();
    const isSem1 = targetSem.includes('1') || targetSem.includes('ganjil');
    const isSem2 = targetSem.includes('2') || targetSem.includes('genap');

    return masterKurikulumList.filter(item => {
      // 1. Filter Mapel
      const itemMapel = (item.mataPelajaran || '').trim().toLowerCase();
      if (itemMapel !== cleanMapel) return false;

      // 2. Filter Fase
      const itemTingkat = (item.tingkatKelas || '').toLowerCase();
      if (!itemTingkat.includes(targetFase)) return false;

      // 3. Filter Semester
      if (isSem1 || isSem2) {
        const itemSem = (item.semester || '').toLowerCase();
        if (isSem1 && !itemSem.includes('1') && !itemSem.includes('ganjil')) return false;
        if (isSem2 && !itemSem.includes('2') && !itemSem.includes('genap')) return false;
      }

      return true;
    });
  };
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const wasVoiceUsedRef = useRef<boolean>(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechTokenRef = useRef<number>(0);
  const isSendingMsgRef = useRef<boolean>(false);

  const stopAllSpeech = () => {
    speechTokenRef.current++;
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
        activeAudioRef.current.src = "";
      } catch (e) {
        console.log("Audio stop error:", e);
      }
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.log("SpeechSynthesis cancel error:", e);
      }
    }
    setIsSpeaking(null);
  };
  const [learningMode, setLearningMode] = useState<'text' | 'audio'>('text');
  const [assessmentLevel, setAssessmentLevel] = useState<'dasar' | 'menengah' | 'tinggi'>('menengah');
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  
  const [showBlackboard, setShowBlackboard] = useState(false);
  const [blackboardSummary, setBlackboardSummary] = useState<string | null>(null);
  const [isGeneratingBlackboard, setIsGeneratingBlackboard] = useState(false);
  
  const [pageConfig, setPageConfig] = useState({
    paperSize: 'A4',
    fontSize: '12pt',
    fontFamily: 'serif'
  });

  const modelSuggestions = [
    { name: "Problem Based Learning", desc: "Belajar melalui pemecahan masalah nyata untuk melatih berpikir kritis." },
    { name: "Project Based Learning", desc: "Belajar melalui pembuatan proyek/produk nyata dalam jangka waktu tertentu." },
    { name: "Discovery Learning", desc: "Siswa menemukan sendiri konsep atau prinsip melalui serangkaian pengamatan." },
    { name: "Inquiry Learning", desc: "Penyelidikan mandiri siswa untuk menjawab pertanyaan atau masalah." },
    { name: "Contextual Teaching", desc: "Mengaitkan materi dengan situasi dunia nyata agar lebih relevan." },
    { name: "Cooperative Learning", desc: "Belajar bersama dalam kelompok kecil untuk melatih kerjasama sosial." }
  ];

  const readinessPresets: Record<string, string[]> = {
    pengetahuan: [
      "Sebagian besar siswa sudah memahami konsep dasar materi.",
      "Pengetahuan siswa bervariasi: 30% paham utuh, 50% paham sebagian, 20% butuh bimbingan ekstra.",
      "Siswa baru pertama kali mengenal topik materi ini (perlu apersepsi mendalam).",
      "Siswa memiliki literasi baca dan pemahaman awal yang baik.",
      "Siswa sudah menguasai prasyarat materi dan siap masuk ke pemahaman lanjutan."
    ],
    fisik: [
      "Kondisi fisik siswa prima, energik, dan siap mengikuti pembelajaran aktif.",
      "Beberapa siswa terlihat lelah/mengantuk di jam pelajaran siang.",
      "Ada siswa yang membutuhkan penanganan khusus (penglihatan/pendengaran/posisi duduk depan).",
      "Motorik halus dan kasar siswa berkembang baik sesuai usianya.",
      "Siswa bersemangat dalam kegiatan pembelajaran kinestetik/praktik langsung."
    ],
    mental: [
      "Siswa memiliki antusiasme dan motivasi belajar yang tinggi.",
      "Beberapa siswa masih cemas/kurang percaya diri saat maju ke depan kelas.",
      "Emosi siswa stabil dan mampu fokus dalam rentang waktu 20-30 menit.",
      "Siswa butuh dorongan apresiasi dan semangat positif dari guru.",
      "Siswa memiliki sikap pantang menyerah dan rasa ingin tahu tinggi."
    ],
    sosial: [
      "Siswa sangat kooperatif, mampu bekerja sama dalam kelompok secara inklusif.",
      "Interaksi sosial cukup baik, namun masih ada kecenderungan memilih-milih teman.",
      "Siswa aktif berkomunikasi dan saling membantu dalam diskusi kelas.",
      "Siswa butuh pembiasaan bertoleransi dan mendengarkan pendapat teman.",
      "Siswa terbiasa menghargai perbedaan pendapat dan saling menghormati."
    ],
    spiritual: [
      "Pembiasaan ibadah (doa, tadarus, salam) sudah tertanam dengan sangat baik.",
      "Siswa memiliki rasa syukur dan sopan santun yang tinggi terhadap guru dan teman.",
      "Pembiasaan karakter akhlakul karimah berkembang dengan bimbingan harian.",
      "Siswa rajin menjalankan kesadaran moral dan spiritual dalam aktivitas sekolah.",
      "Siswa memiliki sikap integritas, kejujuran, dan kepedulian yang tinggi."
    ],
    asesmen: [
      "Asesmen Diagnostik Awal: 60% Kategori Mahir, 30% Kategori Cukup, 10% Kategori Perlu Bimbingan.",
      "Hasil pre-test menunjukkan kesiapan merata pada tingkat pemahaman dasar.",
      "Terdapat diferensiasi kemampuan: butuh pendampingan bertingkat (scaffolding).",
      "Mayoritas siswa siap untuk pembelajaran berbasis proyek/pemecahan masalah.",
      "Hasil kuis awal menunjukkan perlunya pengulangan konsep dasar sebelum materi inti."
    ]
  };

  const [formData, setFormData] = useState({
    namaSekolah: "MI CIBUNGUR I",
    mataPelajaran: "IPAS",
    kelas: "3",
    semester: "Semester 1 (Ganjil)",
    topik: "",
    alokasiWaktu: "2 x 35 Menit 1 x Pertemuan",
    modelPembelajaran: { tipe: "otomatis", manual: "", hasil: "" },
    cp: { tipe: "otomatis", manual: "", hasil: "" },
    tp: { tipe: "otomatis", manual: "", hasil: "" },
    kesiapanMurid: { 
      pengetahuan: "", 
      fisik: "", 
      mental: "", 
      sosial: "", 
      spiritual: "", 
      asesmen: "",
      hasilKesimpulan: "" 
    },
    dimensiProfil: { tipe: "otomatis", selected: [] as string[] },
    topikPancaCinta: { tipe: "otomatis", selected: "", hasil: "" },
    materiIntegrasiKBC: "",
    titiMangsa: {
      tempat: "Cipeundeuy",
      tanggal: new Date().toLocaleDateString('id-ID'),
      guru: "Nama Guru",
      kepala: "Nama Kepala Madrasah"
    }
  });

  // State multi-pilihan untuk ATP (Alur Tujuan Pembelajaran)
  const [selectedAtpIds, setSelectedAtpIds] = useState<string[]>([]);

  const handleToggleAtp = (atpItem: MasterKurikulumItem) => {
    setSelectedAtpIds(prev => {
      const isAlreadySelected = prev.includes(atpItem.id);
      const nextIds = isAlreadySelected 
        ? prev.filter(id => id !== atpItem.id) 
        : [...prev, atpItem.id];
      
      const selectedItems = masterKurikulumList.filter(item => nextIds.includes(item.id));
      const formattedText = selectedItems.length === 1 
        ? selectedItems[0].rumusan 
        : selectedItems.map((item, idx) => `${idx + 1}. ${item.rumusan}`).join('\n');
      
      setFormData(f => ({
        ...f,
        tp: {
          ...f.tp,
          tipe: 'manual',
          manual: formattedText,
          hasil: formattedText
        }
      }));

      return nextIds;
    });
  };

  const handleSelectAllAtp = (items: MasterKurikulumItem[]) => {
    const allIds = items.map(i => i.id);
    setSelectedAtpIds(allIds);
    const formattedText = allIds.length === 1
      ? items[0].rumusan
      : items.map((item, idx) => `${idx + 1}. ${item.rumusan}`).join('\n');
    setFormData(f => ({
      ...f,
      tp: {
        ...f.tp,
        tipe: 'manual',
        manual: formattedText,
        hasil: formattedText
      }
    }));
  };

  const handleClearAllAtp = () => {
    setSelectedAtpIds([]);
    setFormData(f => ({
      ...f,
      tp: {
        ...f.tp,
        manual: '',
        hasil: ''
      }
    }));
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const rppContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDocInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (learningMode === 'audio' && chatHistory.length > 0) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (lastMsg.role === 'assistant') {
        playTTS(lastMsg.text, chatHistory.length - 1);
      }
    }
  }, [chatHistory, learningMode]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setSingleItemToPrint(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handleTitiMangsaChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      titiMangsa: { ...prev.titiMangsa, [field]: value }
    }));
  };

  const handleKesiapanChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      kesiapanMurid: { ...prev.kesiapanMurid, [field as keyof typeof prev.kesiapanMurid]: value }
    }));
  };

  // Backend Proxy API Call
  const callGemini = async (
    prompt: string, 
    systemPrompt = "", 
    useSearch = false, 
    imageData: string | null = null, 
    history: Message[] = [], 
    isJson = false
  ) => {
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemPrompt,
          useSearch,
          imageData,
          history,
          isJson
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal menghubungi server AI.');
      }

      const data = await response.json();
      return data.text || '';
    } catch (err: any) {
      console.error('Gemini error:', err);
      throw err;
    }
  };

  const generateAIImage = async (prompt: string) => {
    try {
      setIsGeneratingMedia(true);
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!response.ok) {
        throw new Error('Gagal generate gambar');
      }
      const data = await response.json();
      return data.imageUrl;
    } catch (err) {
      console.error("Gagal generate gambar:", err);
      return null;
    } finally {
      setIsGeneratingMedia(false);
    }
  };

  const pcmToWav = (base64Data: string, sampleRate = 24000) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const buffer = byteArray.buffer;
    const dataView = new DataView(buffer);
    const wavBuffer = new ArrayBuffer(44 + buffer.byteLength);
    const wavView = new DataView(wavBuffer);

    wavView.setUint32(0, 0x52494646, false); 
    wavView.setUint32(4, 36 + buffer.byteLength, true);
    wavView.setUint32(8, 0x57415645, false); 
    wavView.setUint32(12, 0x666d7420, false); 
    wavView.setUint32(16, 16, true);
    wavView.setUint16(20, 1, true); 
    wavView.setUint16(22, 1, true); 
    wavView.setUint32(24, sampleRate, true);
    wavView.setUint32(28, sampleRate * 2, true);
    wavView.setUint16(32, 2, true);
    wavView.setUint16(34, 16, true);
    wavView.setUint32(36, 0x64617461, false); 
    wavView.setUint32(40, buffer.byteLength, true);

    for (let i = 0; i < buffer.byteLength; i++) {
      wavView.setUint8(44 + i, dataView.getUint8(i));
    }
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  const playTTS = async (text: string, msgId: number) => {
    if (isSpeaking === msgId) {
      stopAllSpeech();
      return;
    }

    // Stop any currently playing audio stream or speech synthesis before starting
    stopAllSpeech();
    const currentToken = speechTokenRef.current;

    // Strip JSON tags, system codes, and markup before narrating
    const cleanText = text
      .replace(/\[GAME_MAKE_A_MATCH:[\s\S]*?\]/g, '')
      .replace(/\[GAME_QUIZ:[\s\S]*?\]/g, '')
      .replace(/\[GAME_CHOICE:[\s\S]*?\]/g, '')
      .replace(/\[PROJECT_TASK:[\s\S]*?\]/g, '')
      .replace(/\[EMBED_YOUTUBE:.*?\]/g, '')
      .replace(/\[GENERATE_IMAGE:.*?\]/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/PEMBELAJARAN SELESAI/g, '')
      .trim();

    if (!cleanText) return;

    setIsSpeaking(msgId);
    let playedWithGemini = false;

    try {
      const response = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText })
      });

      // Abort if another TTS request or stopAllSpeech was called while fetching
      if (speechTokenRef.current !== currentToken) return;

      if (response.ok) {
        const result = await response.json();
        const base64Audio = result?.base64Audio;
        if (base64Audio && speechTokenRef.current === currentToken) {
          playedWithGemini = true;
          const audioBlob = pcmToWav(base64Audio);
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          activeAudioRef.current = audio;

          audio.onended = () => {
            if (speechTokenRef.current === currentToken) {
              activeAudioRef.current = null;
              setIsSpeaking(null);
            }
          };
          audio.onerror = () => {
            if (speechTokenRef.current === currentToken) {
              activeAudioRef.current = null;
              setIsSpeaking(null);
            }
          };

          await audio.play();
          return; // Strictly return here so Web Speech is NEVER called
        }
      }
    } catch (err) {
      console.error("Gemini TTS endpoint error, falling back to Web Speech:", err);
    }

    // Web Speech API Fallback (runs ONLY if Gemini TTS failed AND token is still active)
    if (!playedWithGemini && speechTokenRef.current === currentToken && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      utterance.rate = 0.92; // Slightly natural pace for clear Indonesian
      utterance.pitch = 1.05; // Warm, friendly tone

      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang === 'id-ID' || v.lang === 'id_ID' || v.lang.startsWith('id'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      utterance.onend = () => {
        if (speechTokenRef.current === currentToken) {
          setIsSpeaking(null);
        }
      };
      utterance.onerror = () => {
        if (speechTokenRef.current === currentToken) {
          setIsSpeaking(null);
        }
      };

      if (speechTokenRef.current === currentToken) {
        window.speechSynthesis.speak(utterance);
      }
    } else {
      if (speechTokenRef.current === currentToken) {
        setIsSpeaking(null);
      }
    }
  };

  const generateBlackboardSummary = async () => {
    if (!generatedRPP && chatHistory.length === 0) return;
    setIsGeneratingBlackboard(true);
    setShowBlackboard(true);
    
    const recentChat = chatHistory.slice(-10).map(m => `${m.role === 'assistant' ? 'Guru GEM' : 'Siswa'}: ${m.text}`).join("\n");
    const prompt = `Berdasarkan RPP dan percakapan kelas interaktif berikut:
    Mata Pelajaran: ${formData.mataPelajaran}
    Topik: ${formData.topik}
    Kelas: ${formData.kelas}
    
    Riwayat Percakapan Terbaru:
    ${recentChat}
    
    Tugas: Buatlah "CATATAN PAPAN TULIS KELAS" (Visual Blackboard Card) yang sangat rapi, sistematis, dan mudah dibaca oleh siswa KELAS ${formData.kelas}:
    Gunakan format poin-poin sederhana dengan ikon:
    - 📌 POIN KUNCI MATERI (2-3 rangkuman utama)
    - 💡 ISTILAH & KOSA KATA PENTING
    - 📝 CONTOH / CARA MENYELESAIKAN (jika matematika/hitung, tuliskan langkah sederhana)
    - 🌟 PESAN MOTIVASI KELAS
    
    Langsung tuliskan catatan papan tulis murni tanpa kata pengantar!`;

    try {
      const summary = await callGemini(prompt, "Anda adalah Guru AI yang menulis catatan papan tulis interaktif yang menarik untuk siswa sekolah.");
      setBlackboardSummary(summary);
    } catch (err) {
      setBlackboardSummary("📌 Catatan Papan Tulis:\n- Mata Pelajaran: " + formData.mataPelajaran + "\n- Topik: " + formData.topik + "\n- Selalu semangat menyimak penjelasan Guru GEM di kelas!");
    } finally {
      setIsGeneratingBlackboard(false);
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Speech recognition stop error", e);
      }
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch (e) {
        console.log("Media recorder stop error", e);
      }
    }
    setIsListening(false);
  };

  const startVoiceRecognition = async () => {
    setMicErrorMsg(null);

    // If currently listening, toggle stop which triggers onend & auto-sends
    if (isListening) {
      stopVoiceRecognition();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        transcriptRef.current = '';
        recognition.lang = 'id-ID';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
          setMicErrorMsg(null);
          transcriptRef.current = '';
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setChatInput(currentTranscript);
            transcriptRef.current = currentTranscript;
          }
        };

        recognition.onerror = async (event: any) => {
          console.warn("SpeechRecognition error:", event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
            await startMediaRecorderFallback("Izin mikrofon terblokir pada SpeechRecognition. Membuka Perekam Suara Langsung...");
          } else if (event.error === 'no-speech') {
            setMicErrorMsg("Tidak ada suara terdengar. Klik tombol mikrofon lagi dan ucapkan kalimat Anda.");
            setIsListening(false);
          } else {
            setMicErrorMsg(`Gagal mendengarkan otomatis (${event.error}). Beralih ke perekam audio...`);
            await startMediaRecorderFallback();
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          const finalSpeechText = transcriptRef.current.trim();
          transcriptRef.current = '';
          if (finalSpeechText) {
            wasVoiceUsedRef.current = true;
            handleSendMessage(finalSpeechText, true);
          }
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn("SpeechRecognition start exception:", err);
      }
    }

    // Fallback if SpeechRecognition is missing or threw exception
    await startMediaRecorderFallback();
  };

  const startMediaRecorderFallback = async (customErrorTip?: string) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicErrorMsg("Browser tidak mendukung perekaman suara. Silakan ketik pesan atau buka aplikasi di tab baru.");
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
        const audioFile = new File([audioBlob], `rekaman_suara_${Date.now()}.mp3`, { type: 'audio/mp3' });
        const audioObj = { name: audioFile.name, size: (audioBlob.size / 1024).toFixed(1) + ' KB' };
        
        stream.getTracks().forEach(track => track.stop());
        setIsListening(false);
        setMediaRecorder(null);

        // Auto send audio recording
        wasVoiceUsedRef.current = true;
        handleSendMessage("🎙️ (Pesan Suara Azkayra)", true, audioObj);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);
      if (customErrorTip) {
        setMicErrorMsg(customErrorTip);
      }
    } catch (err: any) {
      console.error("MediaRecorder error:", err);
      setIsListening(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicErrorMsg("Izin mikrofon ditolak oleh browser. Jika membuka di dalam iframe preview, klik ikon 'Buka di Tab Baru' di kanan atas layar untuk mengizinkan mikrofon.");
      } else {
        setMicErrorMsg("Perangkat mikrofon tidak ditemukan atau belum aktif di komputer/HP Anda.");
      }
    }
  };

  const runModelAI = async () => {
    if (!formData.topik) return;
    setIsGeneratingModel(true);
    const prompt = `Tentukan hanya satu model pembelajaran utama yang paling rasional, efektif, dan paling cocok untuk mata pelajaran "${formData.mataPelajaran}" topik "${formData.topik}" kelas "${formData.kelas}". Tanpa kata pengantar, tanpa penjelasan, langsung hanya satu namanya saja.`;
    try {
      const result = await callGemini(prompt, "Anda pakar metodologi pembelajaran modern.");
      setFormData(p => ({...p, modelPembelajaran: {...p.modelPembelajaran, hasil: result}}));
    } catch (err) {
      alert("Gagal membuat rekomendasi model.");
    } finally {
      setIsGeneratingModel(false);
    }
  };

  const runCPAI = async () => {
    if (!formData.topik) return;
    setIsGeneratingCP(true);
    const prompt = `Lakukan riset mendalam pada regulasi pendidikan resmi Indonesia (BSKAP Kurikulum Merdeka) untuk mata pelajaran "${formData.mataPelajaran}" topik "${formData.topik}" kelas "${formData.kelas}". Tuliskan isi Capaian Pembelajaran (CP) yang sesuai dan valid. Tanpa kata pengantar, tanpa penjelasan tambahan, langsung tuliskan hasil pokok CP nya saja. Jangan mengarang.`;
    try {
      const result = await callGemini(prompt, "Anda pakar kurikulum nasional Indonesia yang bekerja berdasarkan data valid.", true);
      setFormData(p => ({...p, cp: {...p.cp, hasil: result}}));
    } catch (err) {
      alert("Gagal meriset CP.");
    } finally {
      setIsGeneratingCP(false);
    }
  };

  const runTPAI = async () => {
    if (!formData.topik) return;
    setIsGeneratingTP(true);
    const cpText = formData.cp.tipe === 'manual' ? formData.cp.manual : formData.cp.hasil;
    const prompt = `Lakukan perumusan Tujuan Pembelajaran (TP) Kurikulum Merdeka yang operasional, spesifik, dan terukur untuk mata pelajaran "${formData.mataPelajaran}" topik "${formData.topik}" kelas "${formData.kelas}".
${cpText ? `Merujuk pada Capaian Pembelajaran (CP) berikut:\n"${cpText}"\n` : ''}
Rumuskan 1-3 Tujuan Pembelajaran (TP) yang jelas mencakup kompetensi dan konten materi secara terukur (gunakan kata kerja operasional). Tanpa kata pengantar, tanpa penjelasan tambahan, langsung tuliskan poin-poin rumusan TP-nya saja.`;
    try {
      const result = await callGemini(prompt, "Anda pakar kurikulum nasional Indonesia yang merumuskan Tujuan Pembelajaran (TP) Kurikulum Merdeka berbasis Taksonomi operasional.", true);
      setFormData(p => ({...p, tp: {...p.tp, hasil: result}}));
    } catch (err) {
      alert("Gagal meriset TP.");
    } finally {
      setIsGeneratingTP(false);
    }
  };

  const runKbcAI = async () => {
    if (!formData.topik) return;
    setIsGeneratingKBC(true);
    const prompt = `Berdasarkan topik pembelajaran "${formData.topik}" pada mata pelajaran "${formData.mataPelajaran}", pilihkan SATU dari Panca Cinta KBC (Karakter Berbasis Cinta) yang paling relevan: 
    1. Cinta Allah dan Rasul-Nya 
    2. Cinta Ilmu 
    3. Cinta Lingkungan 
    4. Cinta Diri dan Sesama 
    5. Cinta Tanah Air.
    
    Tuliskan nama pilihannya saja, diikuti dengan penjelasan singkat 1 kalimat mengapa itu relevan.`;
    try {
      const result = await callGemini(prompt, "Anda pakar kurikulum karakter di Madrasah.");
      setFormData(p => ({...p, topikPancaCinta: {...p.topikPancaCinta, hasil: result}}));
    } catch (err) {
      alert("Gagal menentukan integrasi KBC.");
    } finally {
      setIsGeneratingKBC(false);
    }
  };

  const finalizeSurvey = async () => {
    const { pengetahuan, fisik, mental, sosial, spiritual, asesmen } = formData.kesiapanMurid;
    if (!pengetahuan && !asesmen) return;
    setIsSurveying(true);
    const prompt = `Berdasarkan data kesiapan murid berikut:
    - Pengetahuan: ${pengetahuan}
    - Fisik: ${fisik}
    - Mental: ${mental}
    - Sosial: ${sosial}
    - Spiritual: ${spiritual}
    - Hasil Asesmen: ${asesmen}

    Tugas:
    1. Jelaskan Kondisi Murid secara ringkas dan padat.
    2. Tuliskan Tindak Lanjutnya untuk topik "${formData.topik}".
    Tanpa kata pengantar, langsung ke pokok bahasan.`;
    
    try {
      const summary = await callGemini(prompt, "Anda pakar psikologi dan pedagogi pendidikan.");
      setFormData(p => ({...p, kesiapanMurid: {...p.kesiapanMurid, hasilKesimpulan: summary}}));
      setShowSurveyForm(false);
    } catch (err) {
      alert("Gagal menyimpulkan kondisi murid.");
    } finally {
      setIsSurveying(false);
    }
  };

  const generateRPP = async () => {
    setIsLoading(true);
    setIsLessonFinished(false);

    const cpText = formData.cp.tipe === 'manual' ? (formData.cp.manual || 'Capaian Pembelajaran sesuai kurikulum.') : (formData.cp.hasil || 'Capaian Pembelajaran sesuai kurikulum.');
    const tpText = formData.tp.tipe === 'manual' ? (formData.tp.manual || 'Tujuan Pembelajaran operasional terukur.') : (formData.tp.hasil || 'Tujuan Pembelajaran operasional terukur.');
    const modelText = formData.modelPembelajaran.tipe === 'otomatis' ? (formData.modelPembelajaran.hasil || 'Problem Based Learning') : (formData.modelPembelajaran.manual || 'Problem Based Learning');
    const kbcPillar = formData.topikPancaCinta.tipe === 'otomatis' ? (formData.topikPancaCinta.hasil || 'Cinta Ilmu dan Cinta Lingkungan') : (formData.topikPancaCinta.selected || 'Cinta Ilmu dan Cinta Lingkungan');
    const kesiapanInfo = formData.kesiapanMurid.hasilKesimpulan || 'Kondisi murid siap belajar dengan profil beragam dan membutuhkan pendampingan bertingkat (scaffolding).';

    const systemPrompt = `Anda adalah mesin pengembang RPP/Modul Ajar Kurikulum Merdeka Madrasah (Kemenag) berbasis Kurikulum Berbasis Cinta (KBC).

PRINSIP LOGIKA UTAMA (BACKWARD DESIGN):
Tujuan Pembelajaran (TP) adalah rujukan sentral dan kompas tertinggi dalam menyusun seluruh isi pembelajaran. Jangan mendasarkan langkah kegiatan langsung dari CP. Capaian Pembelajaran (CP) hanya dicantumkan sebagai payung administratif.

ATURAN PERANCANGAN:
1. Bedah Kompetensi TP:
   Identifikasi Kata Kerja Operasional (KKO) dan materi pada [TP]. Seluruh kegiatan inti wajib mencerminkan tingkatan KKO tersebut secara konkret (bukan sekadar ceramah pasif). Jika terdapat lebih dari 1 butir TP, pastikan setiap butir TP dilatih dan diuji dalam tahapan kegiatan inti.
2. Integrasi Nilai Panca Cinta (KBC):
   Padukan pilar KBC yang dipilih ke dalam langkah kegiatan:
   - Pendahuluan: Ciptakan suasana kelas yang aman, hangat, penuh penerimaan, serta lakukan apersepsi emosional/spiritual yang menggugah nalar.
   - Inti: Terapkan sintaks model pembelajaran secara interaktif dan berpihak pada murid, dengan menyisipkan perilaku nyata panca cinta.
   - Penutup: Berikan ruang refleksi perasaan murid, afirmasi positif dari guru, serta doa bersama penuh ketulusan.
3. Diferensiasi Pembelajaran:
   Gunakan data [Kesiapan Murid] untuk menyesuaikan bantuan (scaffolding bertingkat) pada kegiatan inti (kelompok perlu bimbingan vs mandiri/mahir).
4. Asesmen Berkelanjutan:
   Rumuskan asesmen formatif dan rubrik penilaian yang menguji ketercapaian [TP] secara langsung, terukur, dan mendidik.

FORMAT DOKUMEN:
- Gunakan tag HTML <b> HANYA untuk menebalkan judul poin utama A, B, C, dan D.
- Jangan menebalkan seluruh rincian isi agar dokumen rapi dan elegan saat dicetak.
- Gunakan format teks polos terstruktur dengan penomoran manual yang rapi.`;

    const prompt = `Susunlah Dokumen RPP Utuh Kurikulum Merdeka Madrasah (Kemenag) Berbasis Cinta (KBC) dengan menerapkan prinsip BACKWARD DESIGN secara ketat mengacu pada Tujuan Pembelajaran (TP) berikut:

DATA ACUAN PEMBELAJARAN:
- Madrasah: ${formData.namaSekolah}
- Mata Pelajaran: ${formData.mataPelajaran}
- Kelas / Semester: Kelas ${formData.kelas} / ${formData.semester}
- Topik Pembelajaran: ${formData.topik}
- Alokasi Waktu: ${formData.alokasiWaktu}
- Payung Administratif Capaian Pembelajaran (CP): ${cpText}
- RUJUKAN SENTRAL UTAMA - Tujuan Pembelajaran (TP): 
${tpText}
- Model Pembelajaran: ${modelText}
- Pilar Panca Cinta KBC: ${kbcPillar}
- Materi Integrasi KBC: ${formData.materiIntegrasiKBC || 'Penanaman akhlak mulia dan kasih sayang dalam pembelajaran'}
- Data Kesiapan Murid (Asesmen Diagnostik): ${kesiapanInfo}
- Dimensi Profil Lulusan / P5RA: ${formData.dimensiProfil.tipe === 'otomatis' ? 'Beriman & Bertakwa, Bernalar Kritis, Gotong Royong' : formData.dimensiProfil.selected.join(', ')}

STRUKTUR DOKUMEN WAJIB:

<b>A. SPESIFIKASI</b>
1. Madrasah: ${formData.namaSekolah}
2. Mata Pelajaran: ${formData.mataPelajaran}
3. Kelas / Semester: Kelas ${formData.kelas} / ${formData.semester}
4. Topik Pembelajaran: ${formData.topik}
5. Alokasi Waktu: ${formData.alokasiWaktu}

<b>B. IDENTIFIKASI</b>
1. Kesiapan Murid (Diagnostik): ${kesiapanInfo}
2. Dimensi Profil Lulusan (P5RA): ${formData.dimensiProfil.tipe === 'otomatis' ? 'Sebutkan 2-3 dimensi P5RA relevan beserta cara pencapaiannya.' : formData.dimensiProfil.selected.join(", ") + '. Uraikan cara pencapaiannya.'}
3. Topik Panca Cinta (KBC): ${kbcPillar}. Jelaskan keterkaitan filosofis dan pembiasaannya di kelas.
4. Materi Integrasi KBC: ${formData.materiIntegrasiKBC || 'Integrasi nilai kasih sayang dan kepedulian dalam topik ini.'}

<b>C. DESAIN PEMBELAJARAN (BACKWARD DESIGN)</b>
1. Capaian Pembelajaran (CP) [Payung Administratif]: ${cpText}
2. Tujuan Pembelajaran (TP) [Kompas Tertinggi & Terukur]:
${tpText}
3. Kerangka Pembelajaran Berbasis Cinta:
   a. Praktik Pedagogis:
      - Model Pembelajaran: ${modelText} (dijalankan berpusat pada murid / student-centered)
      - Metode: Diskusi kelompok, investigasi terbimbing, presentasi, dan refleksi cinta
   b. Kemitraan Pembelajaran: Kolaborasi hangat antara guru-murid, relasi saling asah-asih-asuh antarmurid, dan pelibatan orang tua
   c. Lingkungan Pembelajaran: Ruang kelas ramah anak, aman secara psikologis, bebas perundungan, dan kaya budaya apresiasi
   d. Pemanfaatan Digital: Pemanfaatan media stimulus visual/audio kontekstual yang mendukung ketercapaian TP

<b>D. PENGALAMAN BELAJAR DENGAN MODEL ${modelText}</b>
1. Kegiatan Awal:
   - Salam pembuka, doa bersama, dan pembiasaan tadarus/akhlak madrasah.
   - Penciptaan suasana kelas yang aman, hangat, dan penuh penerimaan (penerapan KBC).
   - Presensi dengan menyapa kabar emosional murid.
   - Apersepsi emosional/spiritual yang mengaitkan fenomena nyata topik dengan pilar ${kbcPillar}.
   - Penyampaian rujukan Tujuan Pembelajaran (TP) dan alur kegiatan hari ini.

2. Kegiatan Inti:
   Jabarkan langkah kegiatan secara konkret mengikuti sintaks model ${modelText}.
   WAJIB membedah KKO pada [TP] agar seluruh poin TP benar-benar dicapai murid:
   - Uraikan peran aktif GURU dan aktivitas eksplorasi MURID pada setiap tahapan sintaks model.
   - Integrasikan perilaku nyata pilar ${kbcPillar} dalam interaksi belajar kelompok dan pemecahan masalah.
   - Terapkan DIFERENSIASI PEMBELAJARAN (Scaffolding): Tuliskan bantuan bertingkat guru bagi murid yang memerlukan bimbingan khusus vs murid yang siap mandiri/eksplorasi mendalam (berdasarkan data kesiapan murid).

3. Kegiatan Penutup:
   - Refleksi perasaan murid setelah belajar dan peninjauan ketercapaian Tujuan Pembelajaran (TP).
   - Penguatan dan internalisasi nilai ${kbcPillar} dari hasil temuan belajar.
   - Afirmasi positif dan apresiasi tulus dari guru kepada seluruh usaha murid.
   - Tindak lanjut, asesmen formatif mandiri, dan doa penutup penuh ketulusan.

CATATAN: Pastikan hanya Judul Poin A, B, C, dan D yang dibungkus tag <b>. Gunakan baris baru (\n) yang rapi.`;

    try {
      const rpp = await callGemini(prompt, systemPrompt);
      setGeneratedRPP(rpp);
      setActiveSubTab('rpp');
      setChatHistory([{ role: "assistant", text: `Halo Azkayra! 👋 Guru GEM siap mengajakmu belajar "${formData.topik}". RPP sudah siap, yuk kita mulai dari Kegiatan Awal ya!` }]);
    } catch (err) {
      alert("Gagal membuat RPP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generator Cerdas Bahan Pendukung yang Benar-Benar Mengacu ke RPP
  const buildTailoredSupportingMaterialsFallback = (rppText: string): SupportingMaterialsData => {
    const topik = formData.topik || "Materi Pembelajaran";
    const mapel = formData.mataPelajaran || "Mata Pelajaran";
    const kelas = formData.kelas || "1";
    const currentModel = formData.modelPembelajaran.tipe === 'otomatis' 
      ? (formData.modelPembelajaran.hasil || "Problem Based Learning") 
      : formData.modelPembelajaran.manual;

    const lowerTopic = (topik + " " + mapel + " " + currentModel + " " + rppText).toLowerCase();
    const isExampleNonExample = lowerTopic.includes("example") || lowerTopic.includes("non example") || lowerTopic.includes("contoh");
    const isShalatRawatib = lowerTopic.includes("rawatib") || lowerTopic.includes("shalat sunah") || lowerTopic.includes("salat");

    if (isExampleNonExample || isShalatRawatib) {
      return {
        rppTitle: topik,
        modelMetode: currentModel || "Example Non Example",
        ringkasanKebutuhan: `Bahan pendukung ini disusun khusus untuk langkah-langkah pembelajaran model ${currentModel || 'Example Non Example'} pada RPP "${topik}". Menyiapkan set gambar peraga 'Contoh' dan 'Bukan Contoh' yang dibutuhkan pada Kegiatan Inti untuk dianalisis dan dikelompokkan oleh siswa.`,
        items: [
          {
            id: "item-gambar-rawatib",
            kategori: "Media Gambar Peraga",
            judul: `Set Kartu Gambar Peraga: Contoh (Example) & Bukan Contoh (Non-Example) ${topik}`,
            tipe: "gambar",
            deskripsi: "Koleksi gambar peraga konkret untuk diamati siswa dalam mengidentifikasi ciri-ciri shalat rawatib vs shalat sunah lainnya.",
            instruksiPenggunaan: "Tampilkan di layar proyektor atau cetak dan bagikan set gambar ini kepada kelompok. Minta siswa mendiskusikan gambar mana yang merupakan shalat rawatib dan mana yang bukan.",
            langkahRPP: {
              tahap: "inti",
              namaLangkah: "Kegiatan Inti - Langkah 1 & 2: Orientasi Masalah & Pengamatan Gambar Contoh dan Bukan Contoh",
              alokasiWaktu: "15 Menit",
              peranGuru: "Guru menampilkan gambar peraga di papan tulis/proyektor dan mengarahkan siswa mencermati waktu dan tata cara pelaksanaannya."
            },
            daftarGambarKoleksi: [
              {
                id: "img-rawatib-1",
                nomor: 1,
                judul: "Shalat Sunah Qabliyah Subuh (2 Rakaat Sebelum Fardhu Subuh)",
                kategori: "contoh",
                labelBadge: "CONTOH (RAWATIB)",
                penjelasanKonsep: "Merupakan CONTOH shalat sunah rawatib karena dikerjakan 2 rakaat persis sebelum shalat fardhu Subuh. Hukumnya sunah mu'akkad (sangat dianjurkan).",
                deskripsiVisual: "Seorang anak muslim shalat sunah 2 rakaat sendirian di atas sajadah kamar rumah saat fajar sebelum adzan/shalat Subuh fardhu dimulai.",
                promptAi: "An educational children book illustration of a Muslim boy performing 2 rakaats sunnah prayer on prayer mat before dawn prayer, Islamic textbook style, clear lighting, calm serene ambience",
                pertanyaanPemantik: "Kapan shalat ini dikerjakan? Apakah dilakukan sebelum atau sesudah shalat fardhu?"
              },
              {
                id: "img-rawatib-2",
                nomor: 2,
                judul: "Shalat Sunah Ba'diyah Maghrib (2 Rakaat Sesudah Fardhu Maghrib)",
                kategori: "contoh",
                labelBadge: "CONTOH (RAWATIB)",
                penjelasanKonsep: "Merupakan CONTOH shalat sunah rawatib karena dikerjakan 2 rakaat persis sesudah menunaikan shalat fardhu Maghrib.",
                deskripsiVisual: "Siswa muslim shalat sunah 2 rakaat sendirian di shaf belakang masjid setelah jamaah shalat fardhu Maghrib dan wirid selesai.",
                promptAi: "Educational textbook illustration of a Muslim student praying 2 rakaats sunnah prayer alone inside a beautiful mosque after Maghrib prayer, soft evening ambient light",
                pertanyaanPemantik: "Mengapa shalat sesudah fardhu Maghrib ini disebut shalat rawatib ba'diyah?"
              },
              {
                id: "img-rawatib-3",
                nomor: 3,
                judul: "Shalat Hari Raya Idul Fitri (Berjamaah di Lapangan Terbuka)",
                kategori: "bukan_contoh",
                labelBadge: "BUKAN CONTOH (NON-RAWATIB)",
                penjelasanKonsep: "BUKAN shalat rawatib, karena shalat Idul Fitri dikerjakan setahun sekali berjamaah di lapangan pada pagi hari raya, tidak menyertai atau mengiringi shalat fardhu 5 waktu.",
                deskripsiVisual: "Masyarakat muslim beramai-ramai menggelar sajadah dan shalat berjamaah di lapangan rumput hijau luas di pagi hari cerah Idul Fitri.",
                promptAi: "Educational school illustration of a large crowd of Muslims praying Eid al-Fitr prayer together in a wide open green park field on a sunny morning, festive joyful atmosphere",
                pertanyaanPemantik: "Apakah shalat Idul Fitri mengiringi shalat fardhu 5 waktu? Mengapa ia bukan rawatib?"
              },
              {
                id: "img-rawatib-4",
                nomor: 4,
                judul: "Shalat Gerhana Matahari (Shalat Kusuf)",
                kategori: "bukan_contoh",
                labelBadge: "BUKAN CONTOH (NON-RAWATIB)",
                penjelasanKonsep: "BUKAN shalat rawatib, melainkan shalat sunah yang hanya dikerjakan apabila terjadi peristiwa alam gerhana matahari, tidak terikat dengan jadwal shalat fardhu 5 waktu.",
                deskripsiVisual: "Jamaah masjid melaksanakan shalat sunah gerhana dengan khusyuk saat langit meredup karena fenomena gerhana matahari cincin.",
                promptAi: "Didactic educational textbook illustration of people praying sunnah prayer in a mosque courtyard while a solar eclipse ring of fire occurs in the dim sky",
                pertanyaanPemantik: "Kapan shalat gerhana dilakukan? Mengapa berbeda dengan shalat rawatib?"
              }
            ]
          },
          {
            id: "item-lkpd-rawatib",
            kategori: "Lembar Kerja Siswa",
            judul: "LKPD Detektif Gambar: Mengkategorikan Contoh & Bukan Contoh Shalat Rawatib",
            tipe: "lkpd",
            deskripsi: "Lembar kerja kelompok untuk menganalisis 4 gambar peraga, mengelompokkannya ke tabel sortir, dan merumuskan kesimpulan pengertian shalat rawatib.",
            instruksiPenggunaan: "Bagikan 1 lembar LKPD ke setiap kelompok (3-4 siswa). Pandu siswa mengisi tabel kategorisasi berdasarkan hasil pengamatan gambar peraga.",
            langkahRPP: {
              tahap: "inti",
              namaLangkah: "Kegiatan Inti - Langkah 3: Penyelidikan Kelompok Menganalisis Gambar & Mengisi Lembar Kerja",
              alokasiWaktu: "20 Menit",
              peranGuru: "Guru memfasilitasi diskusi kelompok, memberikan bimbingan bagi yang bingung membedakan qabliyah/ba'diyah, dan memastikan kerjasama aktif."
            },
            kontenLKPD: {
              namaAktivitas: "Menganalisis Gambar Peraga & Menemukan Pengertian Shalat Sunah Rawatib",
              tujuan: `Siswa Kelas ${kelas} mampu membedakan shalat sunah rawatib dengan shalat sunah lainnya melalui analisis gambar dan merumuskan pengertiannya secara mandiri.`,
              petunjuk: [
                "Amati dengan cermat 4 Gambar Peraga yang telah disajikan di depan kelas.",
                "Diskusikan bersama teman kelompok: manakah shalat yang mengiringi shalat fardhu?",
                "Kelompokkan nomor gambar ke dalam Kolom Contoh (Rawatib) atau Bukan Contoh.",
                "Jawab pertanyaan diskusi dan tuliskan kesimpulan definisi shalat sunah rawatib!"
              ],
              langkahLangkah: [
                "Langkah 1: Tuliskan nama anggota kelompok pada kolom identitas.",
                "Langkah 2: Amati Gambar 1, 2, 3, dan 4 pada set kartu peraga.",
                "Langkah 3: Diskusikan ciri pembeda: Apakah shalat tersebut dikerjakan sebelum/sesudah shalat 5 waktu?",
                "Langkah 4: Tuliskan hasil analisis pada tabel pengelompokan di bawah.",
                "Langkah 5: Rumuskan 1 kalimat kesimpulan: 'Shalat sunah rawatib adalah...'"
              ],
              soalDiskusi: [
                {
                  nomor: 1,
                  pertanyaan: "Berdasarkan Gambar 1 dan 2, kapan waktu pelaksanaan shalat sunah tersebut dilakukan terhadap shalat fardhu?",
                  ruangJawaban: "Dikerjakan tepat sebelum shalat fardhu (Qabliyah Subuh) dan sesudah shalat fardhu (Ba'diyah Maghrib) untuk menyempurnakan shalat fardhu."
                },
                {
                  nomor: 2,
                  pertanyaan: "Mengapa Gambar 3 (Shalat Idul Fitri) dan Gambar 4 (Shalat Gerhana) dimasukkan ke dalam kelompok BUKAN CONTOH shalat rawatib? Jelaskan alasan kelompokmu!",
                  ruangJawaban: "Karena Shalat Idul Fitri dan Shalat Gerhana tidak mengiringi shalat fardhu 5 waktu, melainkan dikerjakan karena momen hari raya tahunan atau adanya peristiwa alam gerhana."
                },
                {
                  nomor: 3,
                  pertanyaan: "Berdasarkan perbedaan gambar contoh dan bukan contoh di atas, simpulkan dengan kata-katamu sendiri: Apakah pengertian Shalat Sunah Rawatib itu?",
                  ruangJawaban: "Shalat sunah rawatib adalah shalat sunah yang dikerjakan menyertai, mengiringi, atau mengitari shalat fardhu lima waktu, baik sebelum shalat fardhu (qabliyah) maupun sesudahnya (ba'diyah)."
                }
              ],
              refleksiSingkat: "Apa hikmah terbesar yang kamu rasakan setelah tahu keutamaan shalat sunah rawatib pengiring shalat fardhu ini?"
            }
          },
          {
            id: "item-rubrik-rawatib",
            kategori: "Instrumen Asesmen",
            judul: "Rubrik Penilaian Pengamatan Gambar & Diskusi Example Non Example",
            tipe: "rubrik",
            deskripsi: "Pedoman observasi guru dalam menilai ketepatan analisis gambar, nalar kritis, dan kerjasama kelompok.",
            instruksiPenggunaan: "Gunakan rubrik ini saat berkeliling memantau jalannya diskusi kelompok dan saat perwakilan kelompok mempresentasikan hasil tabel sortirnya.",
            langkahRPP: {
              tahap: "inti",
              namaLangkah: "Kegiatan Inti - Langkah 4 & 5: Penyajian Hasil Analisis Gambar & Evaluasi Pemahaman Konsep",
              alokasiWaktu: "15 Menit",
              peranGuru: "Guru memandu jalannya presentasi kelompok dan memberikan skor observasi berdasarkan rubrik."
            },
            rubrikPenilaian: {
              kriteria: [
                {
                  aspek: "Ketepatan Mengelompokkan Gambar",
                  kriteriaBagus: "Mampu memilah seluruh 4 gambar (Contoh vs Bukan Contoh) secara 100% tepat dan memberikan alasan yang benar.",
                  kriteriaBiasa: "Mampu memilah 2-3 gambar dengan tepat, namun alasan pembedanya masih ragu-ragu.",
                  kriteriaPerluBimbingan: "Belum tepat dalam memisahkan gambar contoh dan bukan contoh, butuh panduan guru."
                },
                {
                  aspek: "Kemampuan Menjelaskan Pengertian Rawatib",
                  kriteriaBagus: "Mampu merumuskan pengertian shalat rawatib secara utuh (shalat pengiring fardhu: qabliyah dan ba'diyah).",
                  kriteriaBiasa: "Menyebutkan pengertian shalat rawatib namun belum lengkap menyebut unsur qabliyah/ba'diyah.",
                  kriteriaPerluBimbingan: "Belum mampu mengemukakan pengertian shalat rawatib dengan kalimat sendiri."
                },
                {
                  aspek: "Kerjasama & Karakter Cinta Kasih",
                  kriteriaBagus: "Seluruh anggota kelompok aktif, saling menghargai pendapat, berbagi tugas menulis dan berbicara.",
                  kriteriaBiasa: "Hanya 1-2 anggota yang aktif, namun kelompok tetap bekerja rukun dan selesai tepat waktu.",
                  kriteriaPerluBimbingan: "Kurang fokus dalam berdiskusi atau mendominasi sendiri tanpa mendengarkan teman."
                }
              ],
              catatanGuru: "Fokuskan penilaian pada pemahaman esensial bahwa shalat rawatib adalah shalat pengiring shalat fardhu 5 waktu."
            }
          }
        ]
      };
    }

    // Default Fallback strictly mapped to RPP steps
    return {
      rppTitle: topik,
      modelMetode: currentModel,
      ringkasanKebutuhan: `Bahan pendukung ini dirancang khusus untuk memfasilitasi tahapan kegiatan pada RPP "${topik}" (Kelas ${kelas}) sesuai model ${currentModel}. Hanya menyediakan perangkat yang secara nyata dibutuhkan guru dan murid di kelas.`,
      items: [
        {
          id: "item-stimulus-visual",
          kategori: "Media Visual Peraga",
          judul: `Gambar Peraga Stimulus Konseptual: ${topik}`,
          tipe: "gambar",
          deskripsi: "Media gambar peraga pengamatan awal untuk membangkitkan rasa ingin tahu dan pemahaman konkret siswa.",
          instruksiPenggunaan: "Tampilkan di awal kegiatan inti sebagai pemantik pengamatan masalah kontekstual.",
          langkahRPP: {
            tahap: "inti",
            namaLangkah: "Kegiatan Inti - Langkah 1: Orientasi Siswa pada Masalah / Stimulus Visual",
            alokasiWaktu: "10 Menit",
            peranGuru: "Guru menampilkan gambar peraga dan mengajukan pertanyaan pemantik mengenai fenomena yang terlihat."
          },
          daftarGambarKoleksi: [
            {
              id: "img-stimulus-1",
              nomor: 1,
              judul: `Ilustrasi Inti Materi: ${topik}`,
              kategori: "stimulus",
              labelBadge: "STIMULUS PENGAMATAN",
              penjelasanKonsep: `Gambar ini memvisualisasikan penerapan konsep dasar ${topik} dalam kehidupan sehari-hari anak.`,
              deskripsiVisual: `Ilustrasi edukatif berwarna tentang ${topik} yang mudah dipahami oleh siswa kelas ${kelas}.`,
              promptAi: `A clean, didactic school textbook illustration about ${topik}, clear educational style for elementary school children, colorful and engaging`,
              pertanyaanPemantik: `Apa yang kalian amati dari gambar ini? Mengapa hal ini berkaitan dengan ${topik}?`
            }
          ]
        },
        {
          id: "item-lkpd-inti",
          kategori: "Lembar Kerja Siswa",
          judul: `LKPD Diskusi & Penyelidikan: ${topik}`,
          tipe: "lkpd",
          deskripsi: "Lembar aktivitas siswa memecahkan tantangan materi dan mendiskusikannya dalam kelompok.",
          instruksiPenggunaan: "Bagikan kepada setiap kelompok saat tahap penyelidikan dimulai.",
          langkahRPP: {
            tahap: "inti",
            namaLangkah: "Kegiatan Inti - Langkah 2 & 3: Penyelidikan Berkelompok & Penyelesaian Tugas",
            alokasiWaktu: "25 Menit",
            peranGuru: "Guru berkeliling memberikan scaffolding bagi siswa yang memerlukan bimbingan."
          },
          kontenLKPD: {
            namaAktivitas: `Eksplorasi Konsep & Pemecahan Masalah ${topik}`,
            tujuan: `Siswa mampu menganalisis konsep ${topik} dan menyelesaikan soal diskusi kelompok dengan tepat.`,
            petunjuk: [
              "Bekerjasamalah dengan teman satu kelompok dengan rukun dan saling menghargai.",
              "Diskusikan pertanyaan di bawah ini dengan mengaitkan materi yang telah dipelajari.",
              "Tuliskan jawaban kelompok dengan jelas dan rapi."
            ],
            langkahLangkah: [
              "Membaca bersama instruksi tugas.",
              "Berbagi peran mencari informasi pada bahan ajar.",
              "Merumuskan jawaban terbaik dan memeriksa kembali sebelum dipresentasikan."
            ],
            soalDiskusi: [
              {
                nomor: 1,
                pertanyaan: `Jelaskan apa yang kamu pahami tentang konsep dasar ${topik}!`,
                ruangJawaban: "Tuliskan penjelasan inti materi di sini..."
              },
              {
                nomor: 2,
                pertanyaan: `Berikan 2 contoh konkret bagaimana konsep ${topik} ini kita jumpai di sekitar kita!`,
                ruangJawaban: "Contoh 1: ... \nContoh 2: ..."
              }
            ],
            refleksiSingkat: "Apa hal baru yang paling berkesan dari diskusi kelompokmu hari ini?"
          }
        },
        {
          id: "item-rubrik-inti",
          kategori: "Instrumen Asesmen",
          judul: `Rubrik Penilaian Pembelajaran ${topik}`,
          tipe: "rubrik",
          deskripsi: "Rubrik penilaian formatif untuk mengukur ketercapaian tujuan pembelajaran pada kegiatan inti.",
          instruksiPenggunaan: "Gunakan saat mengamati diskusi dan presentasi siswa.",
          langkahRPP: {
            tahap: "inti",
            namaLangkah: "Kegiatan Inti - Langkah 4: Penyajian & Evaluasi Proses Belajar",
            alokasiWaktu: "10 Menit",
            peranGuru: "Guru mencatat capaian kompetensi siswa pada lembar rubrik."
          },
          rubrikPenilaian: {
            kriteria: [
              {
                aspek: "Pemahaman Konsep Materi",
                kriteriaBagus: "Menjelaskan konsep secara utuh, benar, dan mampu memberikan contoh nyata.",
                kriteriaBiasa: "Menjelaskan konsep dengan benar namun contoh yang diberikan masih terbatas.",
                kriteriaPerluBimbingan: "Belum mampu menjelaskan konsep materi, memerlukan bimbingan guru."
              },
              {
                aspek: "Keaktifan Diskusi & Kerjasama",
                kriteriaBagus: "Sangat aktif, mendengarkan teman, dan memberikan kontribusi positif dalam kelompok.",
                kriteriaBiasa: "Cukup aktif dalam kelompok meskipun sesekali pasif.",
                kriteriaPerluBimbingan: "Cenderung pasif atau mengabaikan instruksi kelompok."
              }
            ],
            catatanGuru: "Berikan apresiasi verbal pada setiap usaha siswa yang berani mengemukakan pendapat."
          }
        }
      ]
    };
  };

  // Helper untuk generate gambar peraga visual secara dinamis
  const handleGeneratePeragaImage = async (gambarId: string, promptText: string): Promise<string | null> => {
    try {
      const url = await generateAIImage(promptText);
      if (url && supportingMaterials) {
        setSupportingMaterials(prev => {
          if (!prev) return prev;
          const updatedItems = prev.items.map(item => {
            if (item.daftarGambarKoleksi) {
              const updatedKoleksi = item.daftarGambarKoleksi.map(g => {
                if (g.id === gambarId) {
                  return { ...g, urlGambar: url };
                }
                return g;
              });
              return { ...item, daftarGambarKoleksi: updatedKoleksi };
            }
            if (item.bahanGambar && item.id === gambarId) {
              return { ...item, bahanGambar: { ...item.bahanGambar, urlGambar: url } };
            }
            return item;
          });
          return { ...prev, items: updatedItems };
        });
        return url;
      }
      return url || null;
    } catch (e) {
      console.error("Gagal generate peraga image:", e);
      return null;
    }
  };

  const generateSupportingMaterials = async (rppContent?: string | null) => {
    const rppToUse = rppContent || generatedRPP;
    if (!rppToUse) {
      alert("Silakan buat RPP terlebih dahulu agar bahan pendukung dapat disesuaikan secara presisi dengan alur RPP Anda.");
      return;
    }
    if (!formData.topik) {
      alert("Silakan isi topik pembelajaran terlebih dahulu pada Konfigurasi RPP.");
      return;
    }
    setIsGeneratingSupporting(true);
    
    const currentModel = formData.modelPembelajaran.tipe === 'otomatis' 
      ? (formData.modelPembelajaran.hasil || "Problem Based Learning / Pembelajaran Aktif") 
      : formData.modelPembelajaran.manual;

    const systemPrompt = `Anda adalah Ahli Kurikulum & Pengembang Media Pembelajaran Kurikulum Merdeka di Indonesia.
TUGAS UTAMA:
Menganalisis DOKUMEN RPP di bawah ini dan menyusun Bahan Pendukung Pembelajaran yang HANYA SESUAI KEBUTUHAN LANGKAH-LANGKAH PEMBELAJARAN di RPP tersebut (Bagian D. Pengalaman Belajar).

ATURAN WAJIB & KETAT:
1. SESUAIKAN DENGAN KEBUTUHAN LANGKAH PEMBELAJARAN RPP:
   - JANGAN membuat bahan yang tidak ada gunanya atau tidak disebut di RPP.
   - Setiap item bahan pendukung WAJIB memiliki objek "langkahRPP":
     {
       "tahap": "awal" | "inti" | "penutup",
       "namaLangkah": "Nama fase/langkah di RPP tempat bahan ini dipakai (contoh: Kegiatan Inti - Langkah 2: Pengamatan Gambar Contoh & Bukan Contoh Shalat Rawatib)",
       "alokasiWaktu": "15 Menit",
       "peranGuru": "Instruksi apa yang dilakukan guru dengan bahan ini di kelas"
     }

2. JIKA RPP MEMBUTUHKAN MEDIA GAMBAR (Terutama Model Example Non Example, Picture and Picture, pengamatan gambar stimulus, sains, dll):
   - WAJIB menghasilkan item dengan "tipe": "gambar".
   - Untuk model "Example Non Example": Hasilkan "daftarGambarKoleksi" yang memuat 4-6 gambar peraga yang terbagi menjadi:
     * Gambar CONTOH ("kategori": "contoh", "labelBadge": "CONTOH (EXAMPLE)")
     * Gambar BUKAN CONTOH ("kategori": "bukan_contoh", "labelBadge": "BUKAN CONTOH (NON-EXAMPLE)")
     * Setiap gambar harus memiliki:
       - "nomor": number
       - "judul": string
       - "penjelasanKonsep": string (mengapa ini termasuk contoh / bukan contoh)
       - "deskripsiVisual": string (detail apa yang terlihat di gambar secara jelas)
       - "promptAi": string (prompt dalam bahasa Inggris/Indonesia untuk AI image generator melukis gambar tersebut)
       - "pertanyaanPemantik": string (pertanyaan ke siswa tentang gambar ini)
   - Disertai juga dengan LKPD Analisis Gambar (tipe "lkpd") tempat siswa mengelompokkan gambar tersebut ke tabel dan merumuskan kesimpulan.

3. Kembalikan HANYA format JSON murni tanpa markdown backtick (\`\`\`json) sesuai struktur berikut:
{
  "rppTitle": "${formData.topik}",
  "modelMetode": "${currentModel}",
  "ringkasanKebutuhan": "Rangkuman 2 kalimat bagaimana bahan pendukung ini mengacu secara presisi ke langkah-langkah di RPP.",
  "items": [
    {
      "id": "item-1",
      "kategori": "Media Gambar Peraga / LKPD / Rubrik",
      "judul": "Judul Bahan",
      "tipe": "gambar" | "lkpd" | "kartu" | "video" | "rubrik" | "media",
      "deskripsi": "Fungsi bahan sesuai alur langkah RPP.",
      "instruksiPenggunaan": "Instruksi cara guru memakainya di kelas.",
      "langkahRPP": {
        "tahap": "inti",
        "namaLangkah": "Kegiatan Inti - Langkah X: ...",
        "alokasiWaktu": "15 Menit",
        "peranGuru": "..."
      },
      "daftarGambarKoleksi": [
        {
          "id": "g-1",
          "nomor": 1,
          "judul": "...",
          "kategori": "contoh",
          "labelBadge": "CONTOH (EXAMPLE)",
          "penjelasanKonsep": "...",
          "deskripsiVisual": "...",
          "promptAi": "...",
          "pertanyaanPemantik": "..."
        }
      ],
      "kontenLKPD": { ... },
      "rubrikPenilaian": { ... }
    }
  ]
}`;

    const userPrompt = `Mata Pelajaran: ${formData.mataPelajaran}
Topik: ${formData.topik}
Kelas: ${formData.kelas}
Model Pembelajaran: ${currentModel}

DOKUMEN RPP LENGKAP:
${rppToUse}

Hasilkan Bahan Pendukung Pembelajaran yang dipetakan HANYA sesuai langkah-langkah pembelajaran di RPP di atas! Jika modelnya Example Non Example atau membutuhkan gambar, buatkan set gambar peraga lengkap (Contoh vs Bukan Contoh)! Kembalikan JSON murni!`;

    try {
      const resultStr = await callGemini(userPrompt, systemPrompt, false, null, [], true);
      const cleaned = resultStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && parsed.items && parsed.items.length > 0) {
        setSupportingMaterials(parsed);
      } else {
        setSupportingMaterials(buildTailoredSupportingMaterialsFallback(rppToUse));
      }
    } catch (err) {
      console.warn("AI busy / parsing error, using smart tailored fallback matching RPP:", err);
      // Seamless smart fallback ensures teacher never gets an error
      setSupportingMaterials(buildTailoredSupportingMaterialsFallback(rppToUse));
    } finally {
      setIsGeneratingSupporting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedAudio({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
    }
  };

  const handleSendMessage = async (directText?: string, isVoiceInput?: boolean, overrideAudio?: { name: string; size: string } | null) => {
    if (isSendingMsgRef.current) return;

    const userMsg = directText || chatInput;
    const currentAudio = overrideAudio || attachedAudio;
    if (!userMsg.trim() && !attachedImage && !attachedFile && !currentAudio) return;
    if (isLessonFinished) return;
    
    isSendingMsgRef.current = true;

    try {
      // Stop any ongoing speech narration when sending a new message
      stopAllSpeech();

      const currentImg = attachedImage;
      const currentFile = attachedFile;
      const currentHistory = [...chatHistory];
      const isVoice = isVoiceInput || wasVoiceUsedRef.current;
      wasVoiceUsedRef.current = false;
      
      setChatInput("");
      setAttachedImage(null);
      setAttachedFile(null);
      setAttachedAudio(null);
      
      const nextAssistantMsgIndex = currentHistory.length + 1;

      setChatHistory(prev => [...prev, { 
        role: "user", 
        text: userMsg, 
        image: currentImg,
        file: currentFile,
        audio: currentAudio
      }]);

      const systemPrompt = `Anda adalah Guru GEM, seorang Guru AI Madrasah yang sangat sabar, ramah, penuh perhatian, dan ahli pedagogi interaktif yang mengajar Azkayra secara langsung.
    
    PRINSIP UTAMA & STRATEGI PEMBELAJARAN TUNTAS (MASTERY LEARNING):
    1. TUNTASKAN POIN RPP TANPA TERBURU-BURU:
       Fokus mutlak pada bagian **D. PENGALAMAN BELAJAR** dari RPP berikut:
       ---
       ${generatedRPP}
       ---
       DILARANG KERAS terburu-buru meloncat ke poin/tahap berikutnya atau buru-buru menyelesaikan kelas sebelum yakin Azkayra benar-benar memahami konsep yang sedang dibahas secara utuh.

    2. ELEMEN PENGECEKAN PEMAHAMAN (COMPREHENSION CHECK):
       - Setiap kali menjelaskan konsep baru atau bagian penting RPP, lakukan pengecekan pemahaman secara bertahap (bukan hanya menanyakan "Apakah kamu paham?").
       - Berikan pertanyaan pemantik kecil, minta Azkayra menyebutkan contoh sederhana, atau ajak Azkayra bermain kuis/kartu interaktif.
       - Jika Azkayra menjawab ragu, hanya menjawab singkat ("iya/ok"), atau tampak belum yakin, berikan contoh tambahan, analogi kehidupan sehari-hari anak, atau bimbingan ekstra sebelum melangkah lebih jauh.

    3. DUKUNGAN BERTINGKAT (SCAFFOLDING) & KESABARAN PEDAGOGIS:
       - Jika Azkayra memberikan jawaban yang kurang tepat, "tidak tahu", atau "belum paham", JANGAN PERNAH menyalahkan atau langsung memberi tahu jawaban akhir begitu saja.
       - Berikan petunjuk bertahap (clue/scaffolding), ubah penjelasan menggunakan bahasa yang lebih sederhana, atau gunakan analogi konkret yang ada di sekitarnya.
       - Anda dapat mengarahkan/memicu media pendukung (seperti game kartu, gambar visual, atau kuis) untuk membantu memperjelas konsep tersebut.

    4. OTOMATISASI MEDIA INTERAKTIF SESUAI RPP & KEBUTUHAN SISWA:
       Anda WAJIB memicu media/game interaktif yang sesuai dengan langkah RPP atau saat dibutuhkan untuk memperjelas pemahaman siswa:
       - JIKA MEMBUTUHKAN PERMAINAN/MENCINTAI/KARTU ('Make a Match', 'Main Kartu', 'Jodohkan Kartu', 'Pasangkan'): Sertakan tag JSON:
         [GAME_MAKE_A_MATCH: {"title": "Judul Permainan Kartu", "pairs": [{"q": "Soal/Kartu 1", "a": "Pasangan 1"}, {"q": "Soal/Kartu 2", "a": "Pasangan 2"}, {"q": "Soal/Kartu 3", "a": "Pasangan 3"}]}]
       - JIKA MEMBUTUHKAN VIDEO/MENONTON ('Video', 'YouTube', 'Audio-Visual'): Sertakan tag:
         [EMBED_YOUTUBE: Judul atau topik materi video YouTube spesifik]
       - JIKA MEMBUTUHKAN KUIS/EVALUASI/UJI PEMAHAMAN ('Kuis', 'Tes', 'Check Point'): Sertakan tag:
         [GAME_QUIZ: {"title": "Kuis Singkat", "question": "Pertanyaan?", "options": ["A. Opsi 1", "B. Opsi 2", "C. Opsi 3"], "correctIndex": 0, "explanation": "Penjelasan"}]
       - JIKA MEMBUTUHKAN PILIHAN SKENARIO/ROLEPLAY ('Pilihan', 'Langkah Aksi'): Sertakan tag:
         [GAME_CHOICE: {"title": "Judul Skenario", "scenario": "Deskripsi situasi", "choices": ["Pilihan A", "Pilihan B"]}]
       - JIKA MEMBUTUHKAN TUGAS PROYEK/PRAKTIK/KARYA KREATIF ('Proyek', 'Praktik', 'Karya', 'Menggambar', 'Foto Karya'): Sertakan tag:
         [PROJECT_TASK: {"title": "Judul Tugas Proyek Kreatif", "description": "Deskripsi tugas proyek/karya yang perlu dibuat anak", "instruction": "Petunjuk membuat karya lalu foto & upload hasilnya di sini"}]
       - JIKA MEMBUTUHKAN GAMBAR VISUAL PENJELASAN, sertakan:
         [GENERATE_IMAGE: deskripsi gambar edukatif]

       PENTING FORMAT JSON: Tuliskan isi tag JSON [GAME_...: {...}] atau [PROJECT_TASK: {...}] secara utuh, menggunakan tanda kutip ganda (") yang valid, TANPA markdown codeblock backticks (\`\`\`json).

    5. DETEKSI PROGRES & KONTEKS CHAT:
       Periksa riwayat chat untuk mengetahui posisi pembelajaran terakhir. JANGAN mengulangi salam pembuka (Assalamualaykum) jika sudah diucapkan di awal kelas. Pertahankan fokus percakapan pada topik yang sedang berjalan.

    6. PENILAIAN FOTO PROYEK & APRESIASI TINGGI:
       Jika siswa mengirimkan foto hasil karya/proyek atau lembar kerja, berikan apresiasi tinggi, puji usahanya, dan berikan masukan edukatif yang sangat positif dan membangun.

    7. SYARAT PENUTUPAN "PEMBELAJARAN SELESAI":
       - Anda HANYA BOLEH mengakhiri pesan dengan kalimat "PEMBELAJARAN SELESAI." jika DAN HANYA JIKA:
         1) Seluruh tahapan RPP (Awal, Inti, Penutup) telah dilalui dengan tuntas.
         2) Azkayra telah membuktikan pemahaman utuh melalui refleksi akhir atau kuis singkat.
         3) Refleksi, apresiasi, dan doa penutup sudah disampaikan secara hangat.
         4) TIDAK ADA LAGI pertanyaan atau bagian materi yang belum dipahami oleh Azkayra.
       - Jika salah satu syarat di atas belum terpenuhi, JANGAN tuliskan "PEMBELAJARAN SELESAI.".

    8. BAHASA, GAYA BICARA & INTONASI (RAMAH, NATIVE INDONESIA & LISAN):
       - Bicara dengan gaya khas Guru Madrasah Indonesia yang sangat ramah, hangat, sabar, dan komunikatif (misal: "Wah, masyaAllah cerdas sekali Azkayra!", "Nah, coba bayangkan ya...", "Yuk, kita coba pelan-pelan ya anak pintar!").
       - Gunakan bahasa percakapan lisan yang luwes, alami, menyenangkan, dan tidak kaku/tidak terlampau formal seperti mesin.
       - Gunakan tanda baca (koma, titik, tanda tanya, tanda seru) secara tepat dan ekspresif agar saat dinarasikan dalam bentuk suara (TTS), intonasinya terdengar alami, merdu, tidak datar, dan mudah dipahami siswa.`;

      const aiResponse = await callGemini(userMsg, systemPrompt, false, currentImg, currentHistory);
      
      let finalAiText = aiResponse;
      let aiGeneratedImage: string | null = null;

      const imageMatch = aiResponse.match(/\[GENERATE_IMAGE:\s*(.*?)\]/);
      if (imageMatch) {
        const prompt = imageMatch[1];
        aiGeneratedImage = await generateAIImage(prompt);
        finalAiText = aiResponse.replace(imageMatch[0], "").trim();
      }

      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        text: finalAiText,
        aiImage: aiGeneratedImage
      }]);

      if (isVoice || learningMode === 'audio') {
        setTimeout(() => {
          playTTS(finalAiText, nextAssistantMsgIndex);
        }, 200);
      }
      
      if (aiResponse.includes("PEMBELAJARAN SELESAI")) {
        setIsLessonFinished(true);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "assistant", text: "Maaf Azkayra, sinyal Guru GEM sedang terganggu sebentar. Bisa diulangi?" }]);
    } finally {
      isSendingMsgRef.current = false;
    }
  };

  const generateAssessment = async () => {
    setIsGeneratingAssessment(true);
    setEvaluationResult(null);
    setStudentAnswers({});
    
    const chatTranscript = chatHistory
      .map(msg => `${msg.role === 'assistant' ? 'Guru GEM' : 'Azkayra'}: ${msg.text}`)
      .join("\n");

    const subjectStr = (formData.mataPelajaran || '').toLowerCase();
    const topicStr = (formData.topik || '').toLowerCase();
    const isMath = subjectStr.includes("matematika") || 
                   topicStr.includes("matematika") ||
                   topicStr.includes("hitung") ||
                   topicStr.includes("penjumlahan") ||
                   topicStr.includes("pengurangan") ||
                   topicStr.includes("perkalian") ||
                   topicStr.includes("pembagian");

    const questionCountInstruction = isMath
      ? `KHUSUS MATA PELAJARAN MATEMATIKA / BERHITUNG:
         Karena membutuhkan proses menghitung dan pemecahan masalah numerik, JUMLAH SOAL DIKURANGI secara proporsional agar siswa tidak kelelahan.
         Buat TOTAL 8 SOAL SAJA (BUKAN 15 SOAL) dengan rincian:
         - 3 Soal Pilihan Ganda [type: "pg"] (id: 1, 2, 3)
         - 3 Soal Isian Singkat [type: "isian"] (id: 4, 5, 6)
         - 2 Soal Uraian HOTS [type: "uraian"] (id: 7, 8)`
      : `UNTUK MATA PELAJARAN UMUM (NON-MATEMATIKA):
         Buat TOTAL 15 SOAL dengan rincian:
         - 5 Soal Pilihan Ganda [type: "pg"] (id: 1 s.d 5)
         - 5 Soal Isian Singkat [type: "isian"] (id: 6 s.d 10)
         - 5 Soal Uraian [type: "uraian"] (id: 11 s.d 15)`;

    const prompt = `Berdasarkan materi yang diajarkan dalam transkrip chat di bawah ini:
    ---
    ${chatTranscript}
    ---
    Tugas: Buatlah Asesmen Pembelajaran murni berbasis HOTS (Higher Order Thinking Skills) dengan Tingkatan Kesulitan: "${assessmentLevel.toUpperCase()}". 
    SASARAN SISWA: Kelas ${formData.kelas} di ${formData.namaSekolah}.
    MATA PELAJARAN: ${formData.mataPelajaran} (Topik: ${formData.topik})
    
    PEDOMAN KETAT:
    1. FOKUS MATERI INTI: Soal wajib merujuk PADA MATERI YANG SAMA dengan yang diajarkan di chat. Jika yang diajarkan adalah Jam, buat soal tentang Jam. JANGAN membuat soal tentang topik lain jika tidak ada dalam transkrip chat.
    2. KONTEKS HARIAN NYATA: Hubungkan pertanyaan dengan situasi nyata sehari-hari yang dialami siswa KELAS ${formData.kelas}. Gunakan kosa kata yang tepat untuk usia mereka.
    3. LARANGAN BAHASA META: JANGAN gunakan kalimat pembuka seperti "Berdasarkan chat...", "Dalam tahap orientasi tadi...", atau "Hubungkan konsep mengobrol...". Soal harus langsung pada pokok materi seolah-olah soal ujian resmi yang berdiri sendiri.
    4. LOGIKA & BAHASA: Gunakan bahasa Indonesia yang baik, benar, dan mudah dipahami sesuai tingkat perkembangan kognitif siswa di KELAS ${formData.kelas}.
    5. ATURAN JUMLAH SOAL:
       ${questionCountInstruction}

    TINGKATAN:
    - DASAR: Analisis (C4) sederhana menggunakan fakta nyata materi.
    - MENENGAH: Evaluasi (C5) kritis terhadap situasi nyata materi.
    - TINGGI: Kreasi (C6) atau pemecahan masalah kompleks dari materi.

    Format JSON murni:
    { "questions": [ { "id": 1, "type": "pg", "question": "...", "options": ["A", "B", "C", "D"] }, ... ] }`;
    
    try {
      const res = await callGemini(prompt, "Anda pakar evaluasi pendidikan kurikulum merdeka yang membuat soal HOTS logis, kontekstual, dan dinamis sesuai tingkatan kelas siswa tanpa embel-embel teks transkrip.", false, null, [], true);
      const parsed = JSON.parse(res);
      setAssessmentQuestions(parsed.questions || []);
      setShowAssessmentModal(true);
    } catch (err) {
      alert("Gagal memproses soal. Silakan coba lagi.");
    } finally {
      setIsGeneratingAssessment(false);
    }
  };

  const submitAssessment = async () => {
    setIsEvaluating(true);
    const prompt = `Berikut adalah data asesmen HOTS Azkayra:
    Daftar Soal: ${JSON.stringify(assessmentQuestions)}
    Jawaban Azkayra: ${JSON.stringify(studentAnswers)}

    TUGAS EVALUASI PROFESIONAL & OBYEKTIF:
    Evaluasi setiap nomor jawaban Azkayra dengan teliti, objektif, dan jujur. 

    ATURAN EVALUASI SANGAT PENTING:
    1. NILAI/SKOR OBJEKTIF (0 - 100): Hitung nilai secara presisi. Jika ada jawaban Azkayra yang SALAH, TIDAK DIISI, atau KURANG TEPAT, Anda WAJIB mengurangi nilainya. JANGAN memberi nilai 100 jika ada kesalahan!
    2. ULASAN BERAT PADA JAWABAN SALAH:
       - Untuk SETIAP soal yang dijawab SALAH / KURANG TEPAT, Anda WAJIB menjelaskan secara khusus: di mana letak kesalahannya, apa jawaban/konsep yang benar, dan berikan saran perbaikan ("improvementTip") agar anak paham.
    3. ULASAN JAWABAN BENAR: Apresiasi jawaban benar dan penalarannya.
    4. RINGKASAN KEKURANGAN: Dalam "summary.areasToImprove", daftarkan poin-poin materi/konsep yang masih salah atau perlu diperbaiki.

    Berikan hasil evaluasi dalam format JSON murni:
    {
      "score": 85,
      "rating": 4,
      "hots_analysis": "Analisis kognitif HOTS tingkat berpikir kritis siswa...",
      "motivation": "Pesan bimbingan dan motivasi hangat dari guru...",
      "feedback": {
        "pg": "Ulasan khusus pengerjaan soal Pilihan Ganda",
        "isian": "Ulasan khusus pengerjaan soal Isian",
        "uraian": "Ulasan khusus pengerjaan soal Uraian"
      },
      "summary": {
        "correctCount": 12,
        "incorrectCount": 3,
        "strengths": ["Mampu menganalisis...", "..."],
        "areasToImprove": ["Masih keliru pada pemahaman konsep X...", "Perlu lebih teliti dalam..."]
      },
      "item_evaluations": [
        {
          "id": 1,
          "status": "correct",
          "studentAnswer": "...",
          "correctAnswer": "...",
          "evaluation": "Ulasan rinci. Jika SALAH, sebutkan dengan jelas letak kesalahan dan konsep yang benar.",
          "improvementTip": "Saran perbaikan..."
        }
      ]
    }`;

    try {
      const res = await callGemini(prompt, "Anda pakar guru Madrasah yang memberikan penilaian obyektif, konstruktif, transparan, dan edukatif, serta mengulas dengan jelas jika ada jawaban siswa yang salah.", false, null, [], true);
      let parsed = JSON.parse(res);
      if (!parsed.item_evaluations) {
        parsed.item_evaluations = assessmentQuestions.map(q => ({
          id: q.id,
          status: studentAnswers[q.id] ? 'correct' : 'incorrect',
          studentAnswer: studentAnswers[q.id] || "(Tidak diisi)",
          correctAnswer: "Jawaban yang sesuai dengan materi RPP",
          evaluation: studentAnswers[q.id] ? "Jawaban sudah dijawab dengan baik." : "Jawaban tidak diisi, pelajari kembali materi terkait.",
          improvementTip: "Tingkatkan ketelitian dan pemahaman materi."
        }));
      }
      setEvaluationResult(parsed);
    } catch (err) {
      alert("Gagal memeriksa jawaban. Silakan coba lagi.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const exportToWord = () => {
    if (!generatedRPP || !rppContentRef.current) return;
    const content = rppContentRef.current.innerText;
    const signature = `
Mengetahui;
Kepala Madrasah                                 ${formData.titiMangsa.tempat}, ${formData.titiMangsa.tanggal}
                                                Guru Kelas


( ${formData.titiMangsa.kepala} )                ( ${formData.titiMangsa.guru} )
    `;
    const fullText = content + "\n\n" + signature;
    const blob = new Blob(['\ufeff', fullText], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RPP_${formData.topik || 'Pelajaran'}.doc`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const printAllMaterials = () => {
    setSingleItemToPrint(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const printSingleMaterial = (item: SupportingMaterialItem) => {
    setSingleItemToPrint(item);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const exportSupportingToWord = (item?: SupportingMaterialItem) => {
    if (!supportingMaterials) return;
    
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Bahan Pendukung RPP</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
        h1, h2, h3, h4 { margin: 0 0 10px 0; color: #111827; }
        .header-box { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 20px; }
        .school-name { font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; }
        .doc-title { font-size: 15pt; font-weight: 900; text-transform: uppercase; margin-top: 4px; }
        .meta-table { width: 100%; margin-bottom: 15px; font-size: 10.5pt; }
        .section-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 15px; background: #f8fafc; }
        .question-box { border: 1.5px dashed #94a3b8; border-radius: 6px; padding: 12px; margin-top: 8px; margin-bottom: 14px; min-height: 80px; }
        .card-box { border: 2px dashed #4f46e5; border-radius: 8px; padding: 14px; margin-bottom: 14px; background: #ffffff; }
        table.rubrik-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
        table.rubrik-table th, table.rubrik-table td { border: 1px solid #111827; padding: 8px 10px; font-size: 10pt; text-align: left; }
        table.rubrik-table th { background-color: #f1f5f9; font-weight: bold; }
        .signature-table { width: 100%; margin-top: 40px; }
        .page-break { page-break-before: always; }
      </style>
      </head>
      <body>
    `;

    const itemsToExport = item ? [item] : supportingMaterials.items;

    itemsToExport.forEach((mat, idx) => {
      if (idx > 0) {
        htmlContent += `<div class="page-break"></div>`;
      }

      htmlContent += `
        <div class="header-box">
          <div class="school-name">${formData.namaSekolah || "SEKOLAH / MADRASAH"}</div>
          <div class="doc-title">${mat.tipe === 'lkpd' ? 'LEMBAR KERJA PESERTA DIDIK (LKPD)' : mat.tipe === 'gambar' ? 'SET GAMBAR PERAGA PEMBELAJARAN' : mat.tipe === 'kartu' ? 'SET KARTU MEDIA & MASALAH PEMBELAJARAN' : mat.tipe === 'video' ? 'LEMBAR RUJUKAN VIDEO PEMBELAJARAN' : mat.tipe === 'rubrik' ? 'RUBRIK & LEMBAR PENILAIAN' : 'PANDUAN MEDIA ALAT PERAGA'}</div>
          <div style="font-size: 11pt; font-weight: bold; color: #4338ca; margin-top: 4px;">${mat.judul}</div>
        </div>

        <table class="meta-table">
          <tr>
            <td width="55%"><strong>Mata Pelajaran:</strong> ${formData.mataPelajaran || "-"}</td>
            <td><strong>Kelas / Fase:</strong> Kelas ${formData.kelas || "-"}</td>
          </tr>
          <tr>
            <td><strong>Topik:</strong> ${formData.topik || "-"}</td>
            <td><strong>Alokasi Waktu:</strong> ${formData.alokasiWaktu || "-"}</td>
          </tr>
        </table>

        ${mat.langkahRPP ? `
          <div style="background-color: #eef2ff; border-left: 4px solid #6366f1; padding: 8px 12px; margin-bottom: 15px; font-size: 10pt;">
            <strong>📍 Rujukan Langkah RPP:</strong> ${mat.langkahRPP.namaLangkah} ${mat.langkahRPP.alokasiWaktu ? `(${mat.langkahRPP.alokasiWaktu})` : ''}<br/>
            ${mat.langkahRPP.peranGuru ? `<em>Peran Guru: ${mat.langkahRPP.peranGuru}</em>` : ''}
          </div>
        ` : ''}
      `;

      if (mat.tipe === 'lkpd' && mat.kontenLKPD) {
        htmlContent += `
          <div class="section-box">
            <strong>🎯 TUJUAN PEMBELAJARAN / AKTIVITAS:</strong>
            <p style="margin-top: 4px;">${mat.kontenLKPD.tujuan || "-"}</p>
          </div>

          ${mat.kontenLKPD.petunjuk && mat.kontenLKPD.petunjuk.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <strong>📌 PETUNJUK PENGERJAAN:</strong>
              <ol style="margin-top: 4px; padding-left: 20px;">
                ${mat.kontenLKPD.petunjuk.map(p => `<li>${p}</li>`).join('')}
              </ol>
            </div>
          ` : ''}

          ${mat.kontenLKPD.langkahLangkah && mat.kontenLKPD.langkahLangkah.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <strong>🚀 LANGKAH-LANGKAH AKTIVITAS / DISKUSI:</strong>
              <ul style="margin-top: 4px; padding-left: 20px;">
                ${mat.kontenLKPD.langkahLangkah.map(l => `<li>${l}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${mat.kontenLKPD.soalDiskusi && mat.kontenLKPD.soalDiskusi.length > 0 ? `
            <div style="margin-top: 20px;">
              <strong>✍️ PERTANYAAN DISKUSI & LEMBAR KERJA SISWA:</strong>
              ${mat.kontenLKPD.soalDiskusi.map((s, sIdx) => `
                <div style="margin-top: 10px;">
                  <p><strong>${s.nomor || sIdx + 1}. ${s.pertanyaan}</strong></p>
                  <div class="question-box"><em>[ Ruang Jawaban / Catatan Siswa ]</em></div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${mat.kontenLKPD.refleksiSingkat ? `
            <div class="section-box" style="margin-top: 15px; border-left: 4px solid #f59e0b;">
              <strong>💡 REFLEKSI KELOMPOK:</strong>
              <p style="margin-top: 4px; font-style: italic;">"${mat.kontenLKPD.refleksiSingkat}"</p>
            </div>
          ` : ''}
        `;
      } else if (mat.tipe === 'gambar' || (mat.daftarGambarKoleksi && mat.daftarGambarKoleksi.length > 0)) {
        htmlContent += `
          <div style="margin-top: 15px;">
            <p style="font-size: 10pt; color: #4b5563; margin-bottom: 10px;"><em>🖼️ Set Lembar Gambar Peraga Pengamatan Siswa (Gunting atau Tampilkan di Layar):</em></p>
            ${(mat.daftarGambarKoleksi || []).map((img, iIdx) => `
              <div class="card-box" style="margin-bottom: 16px; border-left: 6px solid ${img.kategori === 'contoh' ? '#10b981' : '#f43f5e'};">
                <div style="font-weight: bold; font-size: 11pt; color: ${img.kategori === 'contoh' ? '#047857' : '#b91c1c'}; margin-bottom: 4px;">
                  ${img.labelBadge || (img.kategori === 'contoh' ? 'CONTOH (EXAMPLE)' : 'BUKAN CONTOH (NON-EXAMPLE)')} - GAMBAR ${iIdx + 1}
                </div>
                <h4 style="margin: 6px 0; font-size: 12pt; color: #1e1b4b;">${img.judul}</h4>
                <p style="margin: 6px 0; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px;">
                  <strong>Deskripsi Visual Gambar:</strong> ${img.deskripsiVisual}
                </p>
                <p style="margin: 6px 0; font-size: 10pt; color: #1e1b4b;">
                  <strong>💡 Penjelasan Konsep (${img.kategori === 'contoh' ? 'Kenapa Termasuk Contoh' : 'Kenapa Bukan Contoh'}):</strong> ${img.penjelasanKonsep}
                </p>
                ${img.pertanyaanPemantik ? `
                  <p style="margin: 6px 0; font-size: 10pt; color: #b45309;">
                    <strong>❓ Pertanyaan Panduan Siswa:</strong> "${img.pertanyaanPemantik}"
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `;
      } else if (mat.tipe === 'kartu' && mat.daftarKartu) {
        htmlContent += `
          <p style="font-size: 10pt; color: #4b5563; margin-bottom: 15px;"><em>✂️ Petunjuk: Gunting setiap kartu di bawah ini untuk digunakan dalam aktivitas pembelajaran kelompok atau permainan konsep.</em></p>
          ${mat.daftarKartu.map((kartu, kIdx) => `
            <div class="card-box">
              <div style="font-weight: bold; color: #4f46e5; font-size: 10pt;">${kartu.kode || `KARTU ${kIdx + 1}`} ${kartu.kategoriBadges ? `(${kartu.kategoriBadges})` : ''}</div>
              <h4 style="margin: 6px 0;">${kartu.judul}</h4>
              <p style="margin: 6px 0; background: #f8fafc; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">${kartu.isi}</p>
              ${kartu.pertanyaanPanduan ? `<p style="margin: 6px 0; font-size: 10pt; color: #1e1b4b;"><strong>❓ Pertanyaan Panduan:</strong> ${kartu.pertanyaanPanduan}</p>` : ''}
            </div>
          `).join('')}
        `;
      } else if (mat.tipe === 'video' && mat.videoInfo) {
        htmlContent += `
          <div class="section-box">
            <h4>${mat.videoInfo.judulVideo}</h4>
            <p><strong>Kata Kunci YouTube:</strong> ${mat.videoInfo.kataKunciPencarian}</p>
            <p><strong>Deskripsi Video:</strong> ${mat.videoInfo.deskripsiIsi}</p>
          </div>

          ${mat.videoInfo.pertanyaanPemantikVideo && mat.videoInfo.pertanyaanPemantikVideo.length > 0 ? `
            <div style="margin-top: 15px;">
              <strong>❓ PERTANYAAN PEMANTIK PENGAMATAN SISWA:</strong>
              <ul style="margin-top: 6px; padding-left: 20px;">
                ${mat.videoInfo.pertanyaanPemantikVideo.map(q => `<li>${q}</li>`).join('')}
              </ul>
              <div class="question-box" style="margin-top: 15px;">
                <em>[ Catatan Pengamatan Siswa ]</em>
              </div>
            </div>
          ` : ''}
        `;
      } else if (mat.tipe === 'rubrik' && mat.rubrikPenilaian) {
        htmlContent += `
          <table class="rubrik-table">
            <thead>
              <tr>
                <th width="25%">Aspek Penilaian</th>
                <th width="25%">Sangat Baik (Skor 4)</th>
                <th width="25%">Cukup (Skor 2-3)</th>
                <th width="25%">Perlu Bimbingan (Skor 1)</th>
              </tr>
            </thead>
            <tbody>
              ${mat.rubrikPenilaian.kriteria.map(k => `
                <tr>
                  <td><strong>${k.aspek}</strong></td>
                  <td>${k.kriteriaBagus}</td>
                  <td>${k.kriteriaBiasa}</td>
                  <td>${k.kriteriaPerluBimbingan}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${mat.rubrikPenilaian.catatanGuru ? `
            <p style="margin-top: 10px; font-style: italic;"><strong>Catatan Guru:</strong> ${mat.rubrikPenilaian.catatanGuru}</p>
          ` : ''}
        `;
      } else if (mat.mediaLainnya) {
        htmlContent += `
          <div class="section-box">
            <h4>${mat.mediaLainnya.tipeBahan}</h4>
            <p>${mat.mediaLainnya.panduanLengkap}</p>
          </div>
          ${mat.mediaLainnya.langkahPersiapan && mat.mediaLainnya.langkahPersiapan.length > 0 ? `
            <div style="margin-top: 15px;">
              <strong>Langkah Persiapan:</strong>
              <ul style="margin-top: 6px; padding-left: 20px;">
                ${mat.mediaLainnya.langkahPersiapan.map(lp => `<li>${lp}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        `;
      }

      htmlContent += `
        <table class="signature-table">
          <tr>
            <td width="50%" align="center">
              Mengetahui,<br>
              Kepala Madrasah / Sekolah<br><br><br><br>
              <strong>( ${formData.titiMangsa.kepala || "........................................"} )</strong>
            </td>
            <td width="50%" align="center">
              ${formData.titiMangsa.tempat || "Tempat"}, ${formData.titiMangsa.tanggal || "Tanggal"}<br>
              Guru Pengampu<br><br><br><br>
              <strong>( ${formData.titiMangsa.guru || "........................................"} )</strong>
            </td>
          </tr>
        </table>
      `;
    });

    htmlContent += `</body></html>`;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item 
      ? `Bahan_${item.tipe.toUpperCase()}_${formData.topik || 'Pelajaran'}.doc`
      : `Semua_Bahan_Pendukung_${formData.topik || 'Pelajaran'}.doc`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 sticky top-0 z-50 no-print">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight uppercase">SMART TUTOR</h1>
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">SCHOOL SYSTEM</p>
          </div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </header>

      {/* Left Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-all duration-300 no-print
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Section */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <GraduationCap size={22} />
            </div>
            {sidebarOpen && (
              <div className="transition-opacity duration-300">
                <h1 className="text-base font-black text-white tracking-tight uppercase leading-none">SMART TUTOR</h1>
                <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold rounded-full uppercase tracking-wider">
                  Belajar Sekolah
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex p-1.5 bg-slate-900 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all border border-slate-800 cursor-pointer"
            title={sidebarOpen ? "Ciutkan Sidebar" : "Perluas Sidebar"}
          >
            {sidebarOpen ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
          {/* Main Category */}
          <div>
            {sidebarOpen && (
              <p className="px-3 mb-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                MODUL UTAMA
              </p>
            )}
            
            {/* Menu Item: Kecerdasan Anak (Asah Otak) */}
            <div className="space-y-1 mb-2">
              <button
                onClick={() => {
                  setActiveMenu('kecerdasan-anak');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  activeMenu === 'kecerdasan-anak' 
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Brain size={18} className={`shrink-0 ${activeMenu === 'kecerdasan-anak' ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                {sidebarOpen && (
                  <div className="flex-1 text-left flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="uppercase tracking-wider font-extrabold text-sm">Kecerdasan Anak</span>
                      </div>
                      <span className="text-[10px] text-amber-400/90 font-medium">Asah Otak Cilik</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                      AKTIF
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* Menu Item: Belajar Sekolah (Standby/Pending) */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  if (activeMenu !== 'belajar-sekolah') {
                    setActiveMenu('belajar-sekolah');
                    setIsBelajarSekolahExpanded(true);
                  } else {
                    setIsBelajarSekolahExpanded(!isBelajarSekolahExpanded);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  activeMenu === 'belajar-sekolah' 
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BookOpen size={18} className="shrink-0 text-indigo-400" />
                {sidebarOpen && (
                  <div className="flex-1 text-left flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="uppercase tracking-wider font-extrabold text-sm">Belajar Sekolah</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded font-semibold">Pending</span>
                    </div>
                    <div className="text-slate-400 transition-transform">
                      {isBelajarSekolahExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>
                )}
              </button>

              {/* Sub-Items for Belajar Sekolah */}
              {activeMenu === 'belajar-sekolah' && isBelajarSekolahExpanded && (
                <div className={`mt-2 space-y-1 transition-all duration-300 ${sidebarOpen ? 'pl-4 border-l border-indigo-500/20 ml-4' : ''}`}>
                  {[
                    { id: 'overview', label: 'Ringkasan & Status', icon: <Layout size={14} /> },
                    { id: 'master-kurikulum', label: 'Master Kurikulum', icon: <BookOpen size={14} /> },
                    { id: 'setup', label: 'Konfigurasi RPP', icon: <Settings size={14} /> },
                    { id: 'rpp', label: 'Dokumen RPP', icon: <FileText size={14} />, badge: generatedRPP ? 'Ready' : null },
                    { id: 'panduan', label: 'Panduan Mengajar', icon: <GraduationCap size={14} />, badge: 'Detail Guru' },
                    { id: 'pendukung', label: 'Bahan Pendukung RPP', icon: <Layers size={14} />, badge: supportingMaterials ? 'Siap' : 'Auto AI' },
                    { id: 'interactive', label: 'Kelas Interaktif', icon: <BrainCircuit size={14} />, badge: 'AI Live' }
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveSubTab(sub.id as SubTab);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        activeSubTab === sub.id
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-extrabold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                      title={!sidebarOpen ? sub.label : undefined}
                    >
                      <span className="shrink-0">{sub.icon}</span>
                      {sidebarOpen && (
                        <div className="flex-1 text-left flex items-center justify-between">
                          <span className="truncate">{sub.label}</span>
                          {sub.badge && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase ${
                              sub.id === 'interactive' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {sub.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Future Expansion Placeholder Category */}
          {sidebarOpen && (
            <div className="pt-4 border-t border-slate-800/60">
              <p className="px-3 mb-2 text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center justify-between">
                <span>PENGEMBANGAN</span>
                <span className="text-[8px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">SOON</span>
              </p>
              <div className="space-y-1 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500">
                  <Users size={16} />
                  <span>Manajemen Siswa</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500">
                  <BarChart3 size={16} />
                  <span>Laporan Diagnostik</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info in sidebar */}
        {sidebarOpen && (
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xs shrink-0">
                MI
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">{formData.namaSekolah}</p>
                <p className="text-[10px] text-slate-500 truncate">{formData.titiMangsa.guru}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Dashboard Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        
        {/* Top Action Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 no-print">
          <div className="flex items-center gap-3">
            {activeMenu === 'kecerdasan-anak' ? (
              <>
                <div className="p-2 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-xl">
                  <Brain size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                    <span>Modul Utama</span>
                    <ChevronRight size={12} />
                    <span className="text-amber-400 font-bold">Kecerdasan Anak</span>
                    <ChevronRight size={12} />
                    <span className="text-slate-200 capitalize font-bold">
                      Taman Asah Otak & Logika Cilik
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                  <BookOpen size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                    <span>Modul Utama</span>
                    <ChevronRight size={12} />
                    <span className="text-indigo-400 font-bold">Belajar Sekolah (Pending)</span>
                    <ChevronRight size={12} />
                    <span className="text-slate-200 capitalize font-bold">
                      {activeSubTab === 'overview' && 'Ringkasan'}
                      {activeSubTab === 'master-kurikulum' && 'Master Kurikulum'}
                      {activeSubTab === 'setup' && 'Konfigurasi RPP'}
                      {activeSubTab === 'rpp' && 'Dokumen RPP'}
                      {activeSubTab === 'panduan' && 'Panduan Mengajar (Detail Alur)'}
                      {activeSubTab === 'pendukung' && 'Bahan Pendukung RPP'}
                      {activeSubTab === 'interactive' && 'Kelas Interaktif AI'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {formData.topik && (
              <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
                <Target size={14} className="text-amber-400" />
                <span className="text-xs font-bold text-slate-300">Topik: <span className="text-white">{formData.topik}</span></span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">System Ready</span>
            </div>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className={`flex-1 overflow-y-auto bg-slate-900/60 ${activeMenu === 'kecerdasan-anak' ? 'p-4 md:p-8' : (activeSubTab === 'interactive' ? 'p-1 sm:p-2 md:p-3' : 'p-4 md:p-8')}`}>
          
          {/* JIKA AKTIF MODUL KECERDASAN ANAK */}
          {activeMenu === 'kecerdasan-anak' ? (
            <KecerdasanAnak />
          ) : (
            <>
              {/* SUB-TAB 1: OVERVIEW / DASHBOARD RINGKASAN */}
              {activeSubTab === 'overview' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
              
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-500/30 p-8 shadow-2xl">
                <div className="absolute -right-10 -bottom-10 opacity-10 text-indigo-400 pointer-events-none">
                  <BrainCircuit size={320} />
                </div>
                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-widest">
                    <Sparkles size={14} /> Modul Belajar Sekolah
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    Smart Tutor School AI
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium">
                    Asisten Pembelajaran Interaktif berbasis AI untuk penyusunan RPP Kurikulum Merdeka, analisis kesiapan murid, integrasi Karakter Berbasis Cinta (KBC), dan bimbingan kelas interaktif secara real-time.
                  </p>
                  
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button 
                      onClick={() => setActiveSubTab('setup')}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      <Settings size={16} /> Atur Konfigurasi RPP
                    </button>
                    {generatedRPP ? (
                      <button 
                        onClick={() => setActiveSubTab('interactive')}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                      >
                        <BrainCircuit size={16} /> Masuk Kelas Interaktif
                      </button>
                    ) : (
                      <button 
                        onClick={() => setActiveSubTab('setup')}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                      >
                        <Plus size={16} /> Buat RPP Baru
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <School size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Madrasah / Sekolah</p>
                    <p className="text-sm font-black text-white truncate max-w-[150px]">{formData.namaSekolah}</p>
                    <p className="text-[10px] text-indigo-400 font-semibold">Kelas {formData.kelas}</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Target size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topik Materi</p>
                    <p className="text-sm font-black text-white truncate max-w-[150px]">{formData.topik || 'Belum diisi'}</p>
                    <p className="text-[10px] text-amber-400 font-semibold">{formData.mataPelajaran}</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <FileText size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Dokumen</p>
                    <p className="text-sm font-black text-white">{generatedRPP ? 'RPP Siap' : 'Belum Dibuat'}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold">{generatedRPP ? '1 Dokumen Aktif' : 'Konfigurasi dulu'}</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                    <Bot size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guru AI (GEM)</p>
                    <p className="text-sm font-black text-white">{chatHistory.length > 0 ? `${chatHistory.length} Pesan` : 'Siap Mulai'}</p>
                    <p className="text-[10px] text-purple-400 font-semibold">Tutor Interaktif</p>
                  </div>
                </div>
              </div>

              {/* Quick Workflow Stepper */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Layers size={18} className="text-indigo-400" /> Alur Kerja Belajar Sekolah
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div 
                    onClick={() => setActiveSubTab('setup')}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">1</span>
                      <Settings size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <h4 className="text-sm font-black text-white mb-1">Konfigurasi RPP</h4>
                    <p className="text-xs text-slate-400">Isi data sekolah, analisis murid, model pembelajaran, dan integrasi Karakter KBC.</p>
                  </div>

                  <div 
                    onClick={() => setActiveSubTab('rpp')}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">2</span>
                      <FileText size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <h4 className="text-sm font-black text-white mb-1">Dokumen RPP</h4>
                    <p className="text-xs text-slate-400">Pratinjau dokumen RPP Kurikulum Merdeka yang siap dicetak atau diexport ke Word.</p>
                  </div>

                  <div 
                    onClick={() => setActiveSubTab('panduan')}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-md">3</span>
                      <GraduationCap size={18} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <h4 className="text-sm font-black text-white mb-1">Panduan Mengajar</h4>
                    <p className="text-xs text-slate-400">Penjelasan detail kegiatan awal, inti, dan penutup dengan dialog guru nyata.</p>
                  </div>

                  <div 
                    onClick={() => setActiveSubTab('interactive')}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-md">4</span>
                      <BrainCircuit size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <h4 className="text-sm font-black text-white mb-1">Kelas Interaktif AI</h4>
                    <p className="text-xs text-slate-400">Simulasi mengajar AI Guru GEM bersama siswa Azkayra dengan soal HOTS & visualisasi.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SUB-TAB: MASTER KURIKULUM */}
          {activeSubTab === 'master-kurikulum' && (
            <MasterKurikulum 
              curriculumList={masterKurikulumList}
              onUpdateCurriculumList={updateMasterKurikulumList}
            />
          )}

          {/* SUB-TAB 2: KONFIGURASI RPP */}
          {activeSubTab === 'setup' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl font-black text-white tracking-tight">Konfigurasi RPP & Pembelajaran</h2>
                <p className="text-slate-400 text-xs max-w-lg mx-auto">Lengkapi data di bawah ini untuk menghasilkan RPP berkualitas tinggi berbasis AI.</p>
              </div>

              {/* Data Sekolah Section */}
              <section className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                    <School size={20}/>
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Data Dasar Madrasah</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Madrasah / Sekolah</label>
                    <input list="sekolah-opts" className="w-full p-3.5 bg-slate-900 rounded-2xl outline-none text-sm border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white font-semibold transition-all" placeholder="Input nama sekolah..." value={formData.namaSekolah} onChange={e => setFormData({...formData, namaSekolah: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mata Pelajaran</label>
                    <input list="mapel-opts" className="w-full p-3.5 bg-slate-900 rounded-2xl outline-none text-sm border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white font-semibold transition-all" placeholder="Pilih mapel..." value={formData.mataPelajaran} onChange={e => setFormData({...formData, mataPelajaran: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tingkat Kelas & Fase</label>
                    <select className="w-full p-3.5 bg-slate-900 rounded-2xl outline-none text-sm border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white font-semibold cursor-pointer transition-all" value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => {
                        let fase = n <= 2 ? "A" : n <= 4 ? "B" : n <= 6 ? "C" : n <= 9 ? "D" : n === 10 ? "E" : "F";
                        return <option key={n} value={n} className="bg-slate-900 text-white">Kelas {n} — Fase {fase}</option>;
                      })}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Semester</label>
                    <select className="w-full p-3.5 bg-slate-900 rounded-2xl outline-none text-sm border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white font-semibold cursor-pointer transition-all" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}>
                      <option value="Semester 1 (Ganjil)">Semester 1 (Ganjil)</option>
                      <option value="Semester 2 (Genap)">Semester 2 (Genap)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Alokasi Waktu</label>
                    <input className="w-full p-3.5 bg-slate-900 rounded-2xl outline-none text-sm border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white font-semibold transition-all" placeholder="Contoh: 2 x 35 Menit 1 x Pertemuan..." value={formData.alokasiWaktu} onChange={e => setFormData({...formData, alokasiWaktu: e.target.value})} />
                  </div>
                </div>

                {/* Active Filter Induk Tag */}
                <div className="flex flex-wrap items-center gap-2 bg-indigo-950/40 border border-indigo-500/20 px-3.5 py-2 rounded-2xl text-[11px] text-slate-300">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={13} className="text-indigo-400" /> Filter Induk Kurikulum:
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    Mapel: {formData.mataPelajaran || 'Belum dipilih'}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Fase: {getFaseFromKelas(formData.kelas)} (Kelas {formData.kelas})
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {formData.semester}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                      <Target size={14} className="text-indigo-400"/>
                      <span>Topik Pembelajaran Utama (Terkoneksi Master Kurikulum)</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 self-start sm:self-auto">
                      <Sparkles size={11} /> Otomatis Sinkron CP & TP dari Master
                    </span>
                  </div>

                  {/* Dropdown Topik dari Master Kurikulum */}
                  {(() => {
                    const activeFase = getFaseFromKelas(formData.kelas);
                    const activeMapel = formData.mataPelajaran.trim();
                    const semLabel = formData.semester ? formData.semester.split('(')[0].trim() : '';
                    const availableTopics = getFilteredCurriculum(formData.mataPelajaran, formData.kelas, formData.semester);

                    return (
                      <div className="space-y-1.5">
                        <div className="relative">
                          <select
                            onChange={e => {
                              const found = masterKurikulumList.find(i => i.id === e.target.value);
                              if (found) {
                                setSelectedAtpIds([found.id]);
                                setFormData(prev => ({
                                  ...prev,
                                  topik: found.topik,
                                  cp: {
                                    ...prev.cp,
                                    tipe: 'manual',
                                    manual: found.cp || prev.cp.manual || prev.cp.hasil,
                                    hasil: found.cp || prev.cp.hasil
                                  },
                                  tp: {
                                    ...prev.tp,
                                    tipe: 'manual',
                                    manual: found.rumusan || prev.tp.manual || prev.tp.hasil,
                                    hasil: found.rumusan || prev.tp.hasil
                                  }
                                }));
                              }
                            }}
                            className={`w-full p-3.5 bg-slate-900 rounded-2xl outline-none text-xs sm:text-sm border transition-all appearance-none pr-10 font-bold cursor-pointer ${
                              availableTopics.length > 0 
                                ? 'border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-indigo-200' 
                                : 'border-slate-800 text-slate-500'
                            }`}
                            value=""
                          >
                            <option value="" disabled className="text-slate-500">
                              {availableTopics.length > 0 
                                ? `-- Pilih Topik [${activeMapel} • ${activeFase} • ${semLabel}] (${availableTopics.length} materi) --`
                                : `-- Kosong: Belum ada materi untuk "${activeMapel || 'Mapel'}" (${activeFase} - ${semLabel}) di Master Kurikulum --`}
                            </option>
                            {availableTopics.map(item => (
                              <option key={item.id} value={item.id} className="bg-slate-900 text-white">
                                {item.topik} — ({item.kode})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={18} />
                        </div>
                        {availableTopics.length === 0 && (
                          <p className="text-[10px] text-amber-400/80 italic ml-1">
                            * Data topik kosong karena belum ada materi terdaftar untuk <strong>{activeMapel || 'Mata Pelajaran ini'}</strong> pada <strong>{activeFase} ({semLabel})</strong> di Master Kurikulum.
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Input Penyesuaian Topik */}
                  <div className="relative">
                    <input 
                      className="w-full p-3.5 pl-11 bg-slate-900/60 rounded-2xl outline-none text-sm border border-slate-800 focus:border-indigo-500 text-white font-bold transition-all placeholder:text-slate-500" 
                      placeholder="Atau sesuaikan / ketik manual topik pembelajaran di sini..." 
                      value={formData.topik} 
                      onChange={e => setFormData({...formData, topik: e.target.value})} 
                    />
                    <Sparkles className="absolute left-4 top-3.5 text-indigo-400" size={18} />
                  </div>
                </div>

                <datalist id="sekolah-opts"><option value="MI CIBUNGUR I"/><option value="MTs MASYARIQUL ANWAR"/></datalist>
                <datalist id="mapel-opts">{["Akidah Akhlaq", "Al-Quran Hadits", "Fiqih", "SKI", "Bahasa Arab", "Matematika", "IPAS", "PJOK", "SBDP", "Bahasa Sunda", "Bahasa Indonesia"].map(m => <option key={m} value={m}/>)}</datalist>
              </section>

              {/* Model Pembelajaran, CP & TP Section */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Model Pembelajaran */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20"><Layout size={18}/></div>
                      <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Model Pembelajaran</h3>
                    </div>
                    <button onClick={runModelAI} disabled={isGeneratingModel} className="flex items-center gap-2 text-[10px] text-white font-black bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50">
                      {isGeneratingModel ? <RefreshCw className="animate-spin" size={12}/> : <Cpu size={12}/>} GENERATE
                    </button>
                  </div>
                  
                  <div className="flex bg-slate-900 p-1 rounded-2xl mb-4 border border-slate-800">
                    <button onClick={() => setFormData({...formData, modelPembelajaran: {...formData.modelPembelajaran, tipe: 'otomatis'}})} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${formData.modelPembelajaran.tipe === 'otomatis' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>OTOMATIS (AI)</button>
                    <button onClick={() => setFormData({...formData, modelPembelajaran: {...formData.modelPembelajaran, tipe: 'manual'}})} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${formData.modelPembelajaran.tipe === 'manual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>MANUAL</button>
                  </div>

                  {formData.modelPembelajaran.tipe === 'manual' && (
                    <div className="mb-4 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Saran Model Efektif:</p>
                      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
                        {modelSuggestions.map((m, idx) => (
                          <button key={idx} onClick={() => setFormData({...formData, modelPembelajaran: {...formData.modelPembelajaran, manual: m.name}})} className="text-left p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-indigo-500/40 transition-all cursor-pointer">
                            <div className="text-[11px] font-black text-indigo-400 mb-1">{m.name}</div>
                            <p className="text-[9px] text-slate-400 italic">{m.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea className="w-full flex-1 p-3.5 text-sm bg-slate-900 border border-slate-800 rounded-2xl outline-none font-bold text-white placeholder:font-normal focus:border-indigo-500 transition-all min-h-[120px]" placeholder="Tentukan model pembelajaran..." value={formData.modelPembelajaran.tipe === 'manual' ? formData.modelPembelajaran.manual : formData.modelPembelajaran.hasil} onChange={e => setFormData({...formData, modelPembelajaran: {...formData.modelPembelajaran, [formData.modelPembelajaran.tipe === 'manual' ? 'manual' : 'hasil']: e.target.value}})} />
                </div>

                {/* CP Merdeka */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><ClipboardCheck size={18}/></div>
                      <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">CP Kurikulum Merdeka</h3>
                    </div>
                    <button onClick={runCPAI} disabled={isGeneratingCP} className="flex items-center gap-2 text-[10px] text-white font-black bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50">
                      {isGeneratingCP ? <RefreshCw className="animate-spin" size={12}/> : <Sparkles size={12}/>} RISET AI
                    </button>
                  </div>

                  {/* Dropdown CP dari Master Kurikulum */}
                  {(() => {
                    const activeFase = getFaseFromKelas(formData.kelas);
                    const activeMapel = formData.mataPelajaran.trim();
                    const semLabel = formData.semester ? formData.semester.split('(')[0].trim() : '';
                    const availableCPs = getFilteredCurriculum(formData.mataPelajaran, formData.kelas, formData.semester).filter(i => i.cp);

                    return (
                      <div className="space-y-1">
                        <label className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-between">
                          <span>Pilih CP Master ({activeMapel || 'Mapel'} • {activeFase} • {semLabel}):</span>
                          <span className="text-slate-400 font-normal">{availableCPs.length} CP</span>
                        </label>
                        <select 
                          onChange={e => {
                            if (e.target.value) {
                              setFormData(p => ({
                                ...p, 
                                cp: { ...p.cp, manual: e.target.value, hasil: e.target.value, tipe: 'manual' }
                              }));
                            }
                          }}
                          className={`w-full p-2.5 text-xs bg-slate-900 border rounded-xl font-medium outline-none transition-all cursor-pointer ${
                            availableCPs.length > 0 
                              ? 'border-emerald-500/40 text-emerald-300 focus:border-emerald-500' 
                              : 'border-slate-800 text-slate-500'
                          }`}
                          value=""
                        >
                          <option value="" disabled>
                            {availableCPs.length > 0
                              ? `-- Pilih CP [${activeMapel} • ${activeFase} • ${semLabel}] (${availableCPs.length}) --`
                              : `-- Kosong: Belum ada CP untuk "${activeMapel || 'Mapel'}" (${activeFase}) --`}
                          </option>
                          {availableCPs.map(item => (
                            <option key={item.id} value={item.cp} className="bg-slate-900 text-white">
                              {item.topik}: {item.cp.slice(0, 75)}...
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}

                  <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                    <button onClick={() => setFormData({...formData, cp: {...formData.cp, tipe: 'otomatis'}})} className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${formData.cp.tipe === 'otomatis' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>VALIDASI AI</button>
                    <button onClick={() => setFormData({...formData, cp: {...formData.cp, tipe: 'manual'}})} className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${formData.cp.tipe === 'manual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>MANUAL / MASTER</button>
                  </div>

                  <textarea className="w-full flex-1 p-3.5 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-2xl outline-none font-medium text-slate-200 leading-relaxed focus:border-indigo-500 transition-all min-h-[140px]" placeholder="CP akan otomatis terisi saat memilih Topik dari Master Kurikulum, atau ketik manual..." value={formData.cp.tipe === 'manual' ? formData.cp.manual : formData.cp.hasil} onChange={e => setFormData({...formData, cp: {...formData.cp, [formData.cp.tipe === 'manual' ? 'manual' : 'hasil']: e.target.value}})} />
                </div>

                {/* TP (Tujuan Pembelajaran / ATP) - Multi Select */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20"><Target size={18}/></div>
                      <div>
                        <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">ATP / TP (Alur Tujuan)</h3>
                        <p className="text-[9px] text-slate-500">Bisa centang lebih dari 1 ATP</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedAtpIds.length > 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {selectedAtpIds.length} Terpilih
                        </span>
                      )}
                      <button onClick={runTPAI} disabled={isGeneratingTP} className="flex items-center gap-1.5 text-[10px] text-white font-black bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50">
                        {isGeneratingTP ? <RefreshCw className="animate-spin" size={12}/> : <Sparkles size={12}/>} RISET AI
                      </button>
                    </div>
                  </div>

                  {/* Multi-Select ATP List dari Master Kurikulum */}
                  {(() => {
                    const activeFase = getFaseFromKelas(formData.kelas);
                    const activeMapel = formData.mataPelajaran.trim();
                    const semLabel = formData.semester ? formData.semester.split('(')[0].trim() : '';
                    const availableTPs = getFilteredCurriculum(formData.mataPelajaran, formData.kelas, formData.semester).filter(i => i.rumusan);

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
                          <span className="text-indigo-400">Pilih ATP ({activeMapel || 'Mapel'} • {activeFase} • {semLabel}):</span>
                          <div className="flex items-center gap-2">
                            {availableTPs.length > 0 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSelectAllAtp(availableTPs)}
                                  className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                                >
                                  Pilih Semua
                                </button>
                                {selectedAtpIds.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={handleClearAllAtp}
                                    className="text-slate-500 hover:text-rose-400 underline cursor-pointer"
                                  >
                                    Reset
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {availableTPs.length === 0 ? (
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500 italic text-center">
                            Belum ada data ATP untuk "{activeMapel || 'Mapel'}" ({activeFase} - {semLabel}) di Master Kurikulum.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                            {availableTPs.map(item => {
                              const isSelected = selectedAtpIds.includes(item.id);
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => handleToggleAtp(item)}
                                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                                    isSelected
                                      ? 'bg-indigo-950/70 border-indigo-500/70 text-white shadow-sm ring-1 ring-indigo-500/30'
                                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0 text-indigo-400">
                                    {isSelected ? <CheckSquare size={15} className="text-indigo-400" /> : <Square size={15} className="text-slate-600" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 uppercase">{item.kode || 'ATP'}</span>
                                      <span className="text-[10px] font-bold text-slate-300 truncate">{item.topik}</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-slate-300">{item.rumusan}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                    <button onClick={() => setFormData({...formData, tp: {...formData.tp, tipe: 'otomatis'}})} className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${formData.tp.tipe === 'otomatis' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>RUMUSAN AI</button>
                    <button onClick={() => setFormData({...formData, tp: {...formData.tp, tipe: 'manual'}})} className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${formData.tp.tipe === 'manual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>MANUAL / MASTER</button>
                  </div>

                  <textarea className="w-full flex-1 p-3.5 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-2xl outline-none font-medium text-slate-200 leading-relaxed focus:border-indigo-500 transition-all min-h-[140px]" placeholder="ATP terpilih otomatis tersusun di sini dengan penomoran rapi (1, 2, ...), atau ketik/edit manual..." value={formData.tp.tipe === 'manual' ? formData.tp.manual : formData.tp.hasil} onChange={e => setFormData({...formData, tp: {...formData.tp, [formData.tp.tipe === 'manual' ? 'manual' : 'hasil']: e.target.value}})} />
                </div>
              </section>

              {/* Analisis Kesiapan Murid */}
              <section className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
                      <Users size={20}/>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Analisis Kesiapan Murid</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Psikopedagogi & Profil Belajar</p>
                    </div>
                  </div>
                  <button onClick={() => setShowSurveyForm(!showSurveyForm)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${showSurveyForm ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
                    {showSurveyForm ? <X size={14}/> : <Plus size={14}/>} {showSurveyForm ? "TUTUP FORM" : "MULAI ANALISIS"}
                  </button>
                </div>

                {showSurveyForm && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-5 bg-slate-900/80 rounded-2xl border border-slate-800">
                    {['pengetahuan', 'fisik', 'mental', 'sosial', 'spiritual', 'asesmen'].map(field => {
                      const presets = readinessPresets[field] || [];
                      return (
                        <div key={field} className="space-y-1.5 flex flex-col">
                          <label className="block text-[10px] font-black text-indigo-400 uppercase ml-1">
                            {field === 'asesmen' ? 'Diagnostik / Hasil Asesmen' : field}
                          </label>
                          <select 
                            onChange={e => {
                              if (e.target.value) {
                                handleKesiapanChange(field, e.target.value);
                              }
                            }}
                            className="w-full p-2 text-[11px] bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-medium outline-none focus:border-indigo-500 cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>-- Pilih Opsi / Template {field} --</option>
                            {presets.map((opt, i) => (
                              <option key={i} value={opt} className="bg-slate-900 text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                          <textarea 
                            className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl h-24 outline-none text-white focus:border-indigo-500 transition-all placeholder:italic" 
                            value={formData.kesiapanMurid[field as keyof typeof formData.kesiapanMurid]} 
                            onChange={e => handleKesiapanChange(field, e.target.value)} 
                            placeholder={`Pilih opsi di atas atau ketik manual aspek ${field}...`} 
                          />
                        </div>
                      );
                    })}
                    <div className="lg:col-span-3 pt-2">
                      <button onClick={finalizeSurvey} disabled={isSurveying} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer">
                        {isSurveying ? <RefreshCw className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>} SIMPULKAN KONDISI & TINDAK LANJUT
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl min-h-[100px]">
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 flex items-center gap-1.5">
                    <AlertCircle size={14}/> Ringkasan Kondisi & Strategi Pembelajaran:
                  </p>
                  <div className="text-xs text-slate-300 leading-relaxed font-semibold italic whitespace-pre-wrap">
                    {formData.kesiapanMurid.hasilKesimpulan || "Gunakan tombol 'MULAI ANALISIS' untuk mendiagnosa kondisi murid Anda agar RPP lebih tepat sasaran."}
                  </div>
                </div>
              </section>

              {/* KBC & Pengesahan Section */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Karakter Berbasis Cinta */}
                <div className="lg:col-span-2 bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
                        <Heart size={18}/>
                      </div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Karakter Berbasis Cinta (KBC)</h3>
                    </div>
                    <button onClick={runKbcAI} disabled={isGeneratingKBC} className="flex items-center gap-2 text-[10px] text-white font-black bg-rose-600 hover:bg-rose-500 px-3.5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50">
                      {isGeneratingKBC ? <RefreshCw className="animate-spin" size={12}/> : <Sparkles size={12}/>} INTEGRASI AI
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                        <button onClick={() => setFormData({...formData, topikPancaCinta: {...formData.topikPancaCinta, tipe: 'otomatis'}})} className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${formData.topikPancaCinta.tipe === 'otomatis' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>AI REKOMENDASI</button>
                        <button onClick={() => setFormData({...formData, topikPancaCinta: {...formData.topikPancaCinta, tipe: 'manual'}})} className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${formData.topikPancaCinta.tipe === 'manual' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>PILIH MANUAL</button>
                      </div>
                      
                      <select className={`w-full p-3 text-xs border border-slate-800 rounded-xl font-bold bg-slate-900 text-white focus:border-rose-500 outline-none transition-all ${formData.topikPancaCinta.tipe === 'otomatis' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`} disabled={formData.topikPancaCinta.tipe === 'otomatis'} value={formData.topikPancaCinta.selected} onChange={e => setFormData({...formData, topikPancaCinta: {...formData.topikPancaCinta, selected: e.target.value}})}>
                        <option value="">Pilih Fokus Panca Cinta...</option>
                        {["Cinta Allah dan Rasul-Nya", "Cinta Ilmu", "Cinta Lingkungan", "Cinta Diri dan Sesama", "Cinta Tanah Air"].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <textarea className="w-full p-3 text-xs bg-slate-900 border border-slate-800 rounded-xl h-full min-h-[120px] outline-none font-bold italic text-rose-300 leading-relaxed focus:border-rose-500 transition-all" placeholder="Uraian integrasi nilai karakter..." value={formData.topikPancaCinta.tipe === 'manual' ? formData.materiIntegrasiKBC : (formData.topikPancaCinta.hasil || formData.materiIntegrasiKBC)} onChange={e => {
                      if(formData.topikPancaCinta.tipe === 'manual') setFormData({...formData, materiIntegrasiKBC: e.target.value});
                      else setFormData({...formData, topikPancaCinta: {...formData.topikPancaCinta, hasil: e.target.value}});
                    }} />
                  </div>
                </div>

                {/* Pengesahan */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                    <div className="p-2.5 bg-slate-800 text-white rounded-xl">
                      <Calendar size={18}/>
                    </div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Pengesahan</h3>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tempat</label>
                        <input className="w-full p-2.5 text-xs border border-slate-800 rounded-xl font-bold bg-slate-900 text-white outline-none focus:border-indigo-500" placeholder="Kota..." value={formData.titiMangsa.tempat} onChange={e => handleTitiMangsaChange('tempat', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tanggal</label>
                        <input className="w-full p-2.5 text-xs border border-slate-800 rounded-xl font-bold bg-slate-900 text-white outline-none focus:border-indigo-500" placeholder="Tanggal..." value={formData.titiMangsa.tanggal} onChange={e => handleTitiMangsaChange('tanggal', e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nama Guru Pengampu</label>
                      <input className="w-full p-2.5 text-xs border border-slate-800 rounded-xl font-bold bg-slate-900 text-white outline-none focus:border-indigo-500" placeholder="Input nama guru..." value={formData.titiMangsa.guru} onChange={e => handleTitiMangsaChange('guru', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Kepala Madrasah / Sekolah</label>
                      <input className="w-full p-2.5 text-xs border border-slate-800 rounded-xl font-bold bg-slate-900 text-white outline-none focus:border-indigo-500" placeholder="Input nama kepala..." value={formData.titiMangsa.kepala} onChange={(e) => handleTitiMangsaChange('kepala', e.target.value)} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Generate RPP Action Button */}
              <div className="pt-4">
                <button onClick={generateRPP} disabled={isLoading || !formData.topik} className="group relative w-full overflow-hidden py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black text-base tracking-widest shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className="relative flex items-center justify-center gap-3">
                    {isLoading ? <RefreshCw className="animate-spin" size={20}/> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform"/>}
                    {isLoading ? "ENGINE AI SEDANG BEKERJA..." : "GENERATE RPP & KELAS INTERAKTIF"}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: DOKUMEN RPP */}
          {activeSubTab === 'rpp' && (
            <div className="space-y-4 animate-in slide-in-from-bottom max-w-5xl mx-auto">
              {/* Document Toolbar */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-md flex flex-wrap gap-3 items-center justify-between no-print">
                <button 
                  onClick={() => setShowPageSetup(!showPageSetup)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-800 cursor-pointer"
                >
                  <Settings size={14} /> Page Setup
                </button>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setActiveSubTab('panduan')}
                    className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <GraduationCap size={14} /> Panduan Mengajar Guru
                  </button>
                  <button 
                    onClick={() => {
                      setActiveSubTab('pendukung');
                      if (!supportingMaterials && formData.topik) {
                        generateSupportingMaterials();
                      }
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <Layers size={14} /> Bahan Pendukung RPP
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-md cursor-pointer"
                  >
                    <FileDown size={14} /> Cetak / Export PDF
                  </button>
                  <button 
                    onClick={exportToWord}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all shadow-md cursor-pointer"
                  >
                    <Download size={14} /> Export Word
                  </button>
                </div>
              </div>

              {showPageSetup && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in no-print">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Ukuran Kertas</label>
                    <select 
                      className="w-full p-2.5 text-xs bg-slate-900 border border-slate-800 text-white rounded-xl outline-none cursor-pointer"
                      value={pageConfig.paperSize}
                      onChange={(e) => setPageConfig({...pageConfig, paperSize: e.target.value})}
                    >
                      <option value="A4">A4 (21 x 29.7 cm)</option>
                      <option value="F4">F4 / Legal (21.5 x 33 cm)</option>
                      <option value="Letter">Letter (21.5 x 27.9 cm)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Ukuran Huruf</label>
                    <select 
                      className="w-full p-2.5 text-xs bg-slate-900 border border-slate-800 text-white rounded-xl outline-none cursor-pointer"
                      value={pageConfig.fontSize}
                      onChange={(e) => setPageConfig({...pageConfig, fontSize: e.target.value})}
                    >
                      <option value="10pt">10 pt</option>
                      <option value="11pt">11 pt</option>
                      <option value="12pt">12 pt</option>
                      <option value="13pt">13 pt</option>
                      <option value="14pt">14 pt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Jenis Huruf</label>
                    <select 
                      className="w-full p-2.5 text-xs bg-slate-900 border border-slate-800 text-white rounded-xl outline-none cursor-pointer"
                      value={pageConfig.fontFamily}
                      onChange={(e) => setPageConfig({...pageConfig, fontFamily: e.target.value})}
                    >
                      <option value="serif">Times New Roman (Serif)</option>
                      <option value="sans-serif">Arial / Helvetica (Sans)</option>
                      <option value="Georgia, serif">Georgia</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Document Printable View */}
              <div 
                id="printable-rpp"
                className={`print-container bg-white shadow-2xl mx-auto border border-slate-300 rounded-2xl transition-all print:shadow-none print:border-none print:rounded-none`}
                style={{
                  width: pageConfig.paperSize === 'A4' ? '21cm' : '21.5cm',
                  minHeight: pageConfig.paperSize === 'A4' ? '29.7cm' : pageConfig.paperSize === 'F4' ? '33cm' : '27.9cm',
                  padding: '2.5cm',
                  fontSize: pageConfig.fontSize,
                  fontFamily: pageConfig.fontFamily,
                  color: '#1a1a1a'
                }}
              >
                <div className="flex justify-between items-center mb-6 border-b-2 border-slate-800 pb-2 export-header">
                  <span className="font-bold text-xs uppercase text-slate-800">HASIL GENERATE RPP - KURIKULUM MERDEKA</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 no-print">Pratinjau Cetak</span>
                </div>
                
                <div className="text-center mb-8 export-title">
                  <h1 
                    style={{ fontSize: (parseInt(pageConfig.fontSize) + 2) + 'pt' }}
                    className="font-bold uppercase text-slate-900 tracking-wide"
                  >
                    RENCANA PELAKSANAAN PEMBELAJARAN (RPP)
                  </h1>
                </div>
                
                <div 
                  ref={rppContentRef}
                  className="leading-relaxed text-justify whitespace-pre-wrap break-words text-slate-900"
                  style={{ fontSize: pageConfig.fontSize }}
                  dangerouslySetInnerHTML={{ __html: (generatedRPP || "RPP belum dibuat. Silakan kembali ke Konfigurasi RPP.").replace(/\n/g, '<br/>') }}
                >
                </div>

                {generatedRPP && (
                  <div className="mt-16 grid grid-cols-2 gap-4 w-full text-slate-900">
                    <div className="flex flex-col">
                      <p>Mengetahui;</p>
                      <p>Kepala Madrasah</p>
                      <div className="h-20"></div> 
                      <p className="font-bold underline uppercase">{formData.titiMangsa.kepala || '.........................'}</p>
                    </div>

                    <div className="flex flex-col items-end text-right">
                      <div>
                        <p>{formData.titiMangsa.tempat}, {formData.titiMangsa.tanggal}</p>
                        <p>Guru Kelas</p>
                        <div className="h-20"></div>
                        <p className="font-bold underline uppercase">{formData.titiMangsa.guru || '.........................'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB: PANDUAN MENGAJAR GURU (DETAIL PENGALAMAN BELAJAR) */}
          {activeSubTab === 'panduan' && (
            <PanduanMengajar
              generatedRPP={generatedRPP}
              formData={formData}
              onNavigateToRPPSetup={() => setActiveSubTab('setup')}
              onNavigateToRPPDocument={() => setActiveSubTab('rpp')}
              onNavigateToInteractiveClass={() => setActiveSubTab('interactive')}
              callGemini={callGemini}
            />
          )}

          {/* SUB-TAB: BAHAN PENDUKUNG RPP */}
          {activeSubTab === 'pendukung' && (
            <div className="space-y-6 animate-in slide-in-from-bottom max-w-6xl mx-auto">
              {/* Top Action Header Bar */}
              <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between no-print">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl">
                    <Layers size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-white uppercase tracking-wide">Bahan Pendukung RPP</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase">
                        Kurikulum Merdeka
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Perangkat & media ajar konseptual (LKPD, Kartu Masalah, Media Digital, Rubrik) khusus untuk RPP: <span className="text-white font-bold">{formData.topik || "Materi Pembelajaran"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => {
                      if (!generatedRPP) {
                        setActiveSubTab('setup');
                      } else {
                        generateSupportingMaterials();
                      }
                    }}
                    disabled={isGeneratingSupporting}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingSupporting ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    {isGeneratingSupporting 
                      ? "Menyusun Bahan AI..." 
                      : !generatedRPP 
                        ? "Buat RPP Terlebih Dahulu" 
                        : supportingMaterials 
                          ? "Generate Ulang Bahan" 
                          : "Generate Bahan Berdasarkan RPP"}
                  </button>

                  {supportingMaterials && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={printAllMaterials}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                        title="Cetak Seluruh Bahan Pendukung"
                      >
                        <FileDown size={14} className="text-indigo-400" /> Cetak Semua Bahan
                      </button>
                      <button
                        onClick={() => exportSupportingToWord()}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                        title="Download Dokumen Microsoft Word"
                      >
                        <FileText size={14} /> Export Word
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Loading Indicator */}
              {isGeneratingSupporting && (
                <div className="bg-slate-950/90 border border-indigo-500/30 rounded-3xl p-12 text-center space-y-4 shadow-2xl animate-pulse">
                  <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <Loader2 size={32} className="animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">AI Sedang Menyusun Bahan Pendukung RPP</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Menganalisis dokumen RPP topik <span className="text-indigo-300 font-bold">"{formData.topik}"</span> secara mendalam...
                    </p>
                  </div>
                </div>
              )}

              {/* State 1: RPP Belum Dibuat */}
              {!isGeneratingSupporting && !supportingMaterials && !generatedRPP && (
                <div className="bg-slate-950 p-8 md:p-12 rounded-3xl border border-amber-500/30 text-center space-y-6 shadow-xl">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <FileText size={40} />
                  </div>
                  <div className="max-w-xl mx-auto space-y-2">
                    <h3 className="text-xl font-black text-white">Dokumen RPP Belum Dibuat</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Bahan dan media pendukung bersifat dinamis dan diturunkan langsung dari alur aktivitas RPP. Silakan buat dokumen RPP terlebih dahulu agar AI dapat mendeteksi secara presisi perangkat apa yang benar-benar dibutuhkan.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveSubTab('setup')}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sparkles size={16} /> Ke Konfigurasi RPP
                  </button>
                </div>
              )}

              {/* State 2: RPP Sudah Dibuat, Bahan Belum Di-generate */}
              {!isGeneratingSupporting && !supportingMaterials && generatedRPP && (
                <div className="bg-slate-950 p-8 md:p-12 rounded-3xl border border-slate-800 text-center space-y-6 shadow-xl">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Layers size={40} />
                  </div>
                  <div className="max-w-xl mx-auto space-y-2">
                    <h3 className="text-xl font-black text-white">Bahan Pendukung Siap Disusun</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Dokumen RPP Anda sudah tersedia. Klik tombol di bawah agar AI menganalisis langkah-langkah pembelajaran RPP Anda dan menyusun perangkat pendukung yang sesuai (seperti LKPD, kartu kasus, media digital, panduan eksperimen, atau rubrik asesmen).
                    </p>
                  </div>

                  <button
                    onClick={() => generateSupportingMaterials()}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sparkles size={16} /> Susun Bahan Pendukung Berdasarkan RPP
                  </button>
                </div>
              )}

              {/* Generated Materials Content View */}
              {!isGeneratingSupporting && supportingMaterials && (
                <div className="space-y-6">
                  {/* Rationale & Info Banner */}
                  <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-slate-950 p-5 rounded-3xl border border-indigo-500/30 shadow-md space-y-2 no-print">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-black text-indigo-300 uppercase tracking-wide">
                          Bahan Pembelajaran Aktif ({supportingMaterials.modelMetode})
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                        Total {supportingMaterials.items.length} Perangkat Media
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{supportingMaterials.ringkasanKebutuhan}"
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-print">
                    {[
                      { id: 'all', label: 'Semua Bahan', count: supportingMaterials.items.length },
                      { id: 'gambar', label: '🖼️ Media Gambar', count: supportingMaterials.items.filter(i => i.tipe === 'gambar' || (i.daftarGambarKoleksi && i.daftarGambarKoleksi.length > 0)).length },
                      { id: 'lkpd', label: '📄 LKPD', count: supportingMaterials.items.filter(i => i.tipe === 'lkpd').length },
                      { id: 'kartu', label: '🎴 Kartu Media', count: supportingMaterials.items.filter(i => i.tipe === 'kartu').length },
                      { id: 'video', label: '🎥 Video Stimulus', count: supportingMaterials.items.filter(i => i.tipe === 'video').length },
                      { id: 'rubrik', label: '📊 Rubrik Penilaian', count: supportingMaterials.items.filter(i => i.tipe === 'rubrik').length },
                      { id: 'lainnya', label: '🧰 Media Lainnya', count: supportingMaterials.items.filter(i => i.tipe === 'lainnya' || i.tipe === 'media').length }
                    ].filter(tab => tab.id === 'all' || tab.count > 0).map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => setActivePendukungFilter(filter.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                          activePendukungFilter === filter.id
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold'
                            : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
                        }`}
                      >
                        <span>{filter.label}</span>
                        {filter.count > 0 && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                            activePendukungFilter === filter.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {filter.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Notice if single item is being printed */}
                  {singleItemToPrint && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-center justify-between no-print">
                      <span>Memilih cetak khusus: <strong>{singleItemToPrint.judul}</strong></span>
                      <button 
                        onClick={() => setSingleItemToPrint(null)}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Kembalikan ke Semua Bahan
                      </button>
                    </div>
                  )}

                  {/* Render Items List */}
                  <div className="space-y-8 print:space-y-0">
                    {(singleItemToPrint 
                      ? [singleItemToPrint] 
                      : supportingMaterials.items.filter(item => {
                          if (activePendukungFilter === 'all') return true;
                          if (activePendukungFilter === 'gambar') return item.tipe === 'gambar' || (item.daftarGambarKoleksi && item.daftarGambarKoleksi.length > 0);
                          if (activePendukungFilter === 'lainnya') return item.tipe === 'lainnya' || item.tipe === 'media';
                          return item.tipe === activePendukungFilter;
                        })
                    ).map((item, idx) => (
                      <div 
                        key={item.id || idx} 
                        className={`bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl transition-all hover:border-slate-700 print:bg-white print:text-black print:border-none print:shadow-none print:rounded-none ${
                          idx > 0 ? 'print-page-break print:pt-6' : ''
                        }`}
                      >
                        
                        {/* Item Header (Screen View) */}
                        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xs shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase">
                                {item.kategori || item.tipe.toUpperCase()}
                              </span>
                              <h3 className="text-sm font-black text-white mt-0.5">{item.judul}</h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => printSingleMaterial(item)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Cetak lembar ini saja"
                            >
                              <FileDown size={12} className="text-indigo-400" /> Cetak Item Ini
                            </button>
                            <button
                              onClick={() => exportSupportingToWord(item)}
                              className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded-xl text-[11px] font-bold border border-emerald-800/60 flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Export item ini ke Microsoft Word"
                            >
                              <FileText size={12} /> Word
                            </button>
                          </div>
                        </div>

                        {/* RPP Step Mapping Banner (Screen View) */}
                        {item.langkahRPP && (
                          <div className="px-6 py-2.5 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 text-xs text-indigo-200 flex flex-wrap items-center justify-between gap-2 no-print">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                                📍 Rujukan Langkah RPP
                              </span>
                              <span className="font-extrabold text-white">{item.langkahRPP.namaLangkah}</span>
                            </div>
                            {item.langkahRPP.alokasiWaktu && (
                              <span className="text-[11px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                ⏱️ {item.langkahRPP.alokasiWaktu}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Instruction Banner (Screen View) */}
                        {item.instruksiPenggunaan && (
                          <div className="px-6 py-2.5 bg-indigo-950/40 border-b border-slate-800 text-xs text-indigo-300 flex items-center gap-2 font-medium no-print">
                            <Sparkles size={14} className="shrink-0 text-amber-400" />
                            <span><strong>Panduan Guru:</strong> {item.instruksiPenggunaan}</span>
                          </div>
                        )}

                        {/* ========================================================= */}
                        {/* ITEM TYPE 0: MEDIA GAMBAR PERAGA (CONTOH & BUKAN CONTOH)   */}
                        {/* ========================================================= */}
                        {(item.tipe === 'gambar' || (item.daftarGambarKoleksi && item.daftarGambarKoleksi.length > 0)) && (
                          <BahanPeragaGambar
                            item={item}
                            onGenerateImage={handleGeneratePeragaImage}
                            onOpenModal={(gambar) => setFullScreenImageModal(gambar)}
                            topik={formData.topik}
                            mataPelajaran={formData.mataPelajaran}
                            kelas={formData.kelas}
                            namaSekolah={formData.namaSekolah}
                          />
                        )}

                        {/* ========================================================= */}
                        {/* ITEM TYPE 1: LKPD (LEMBAR KERJA PESERTA DIDIK)            */}
                        {/* ========================================================= */}
                        {item.tipe === 'lkpd' && item.kontenLKPD && (
                          <div className="p-6 md:p-8 space-y-6 bg-white text-slate-900 rounded-b-3xl print:p-0 print:text-black">
                            {/* Official Kop / Identity Header */}
                            <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{formData.namaSekolah || "SEKOLAH / MADRASAH"}</p>
                                <h2 className="text-lg font-black uppercase text-slate-900 tracking-tight">
                                  LEMBAR KERJA PESERTA DIDIK (LKPD)
                                </h2>
                                <p className="text-xs font-bold text-indigo-900 print:text-slate-800 mt-1">
                                  Aktivitas: {item.kontenLKPD.namaAktivitas || item.judul}
                                </p>
                              </div>
                              <div className="text-right text-[11px] font-semibold text-slate-700 print:text-black">
                                <p>Mata Pelajaran: <strong>{formData.mataPelajaran || "-"}</strong></p>
                                <p>Kelas: <strong>Kelas {formData.kelas || "-"}</strong></p>
                                <p>Topik: <strong>{formData.topik || "-"}</strong></p>
                              </div>
                            </div>

                            {/* Identitas Siswa */}
                            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-100 print:bg-white rounded-xl text-xs font-medium border border-slate-300 print:border-slate-800">
                              <div>
                                <p>Nama Kelompok / Siswa: ...............................................</p>
                              </div>
                              <div>
                                <p>Tanggal & Alokasi: {formData.titiMangsa.tanggal} ({formData.alokasiWaktu})</p>
                              </div>
                            </div>

                            {/* Tujuan & Petunjuk */}
                            <div className="space-y-3">
                              {item.kontenLKPD.tujuan && (
                                <div className="p-3 bg-indigo-50 print:bg-slate-50 border border-indigo-200 print:border-slate-400 rounded-xl text-xs">
                                  <strong className="text-indigo-900 print:text-black uppercase">🎯 Tujuan Pembelajaran / Aktivitas:</strong>
                                  <p className="mt-1 text-slate-800 print:text-black font-medium">{item.kontenLKPD.tujuan}</p>
                                </div>
                              )}

                              {item.kontenLKPD.petunjuk && item.kontenLKPD.petunjuk.length > 0 && (
                                <div className="text-xs space-y-1">
                                  <strong className="text-slate-900 print:text-black uppercase">📌 Petunjuk Pengerjaan:</strong>
                                  <ol className="list-decimal pl-5 space-y-1 text-slate-800 print:text-black">
                                    {item.kontenLKPD.petunjuk.map((p, pIdx) => (
                                      <li key={pIdx}>{p}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>

                            {/* Langkah Kegiatan */}
                            {item.kontenLKPD.langkahLangkah && item.kontenLKPD.langkahLangkah.length > 0 && (
                              <div className="text-xs space-y-1.5 border-t border-slate-200 pt-3">
                                <strong className="text-slate-900 print:text-black uppercase">🚀 Langkah-Langkah Penyelidikan / Diskusi:</strong>
                                <ul className="list-disc pl-5 space-y-1 text-slate-800 print:text-black">
                                  {item.kontenLKPD.langkahLangkah.map((l, lIdx) => (
                                    <li key={lIdx}>{l}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Soal Diskusi */}
                            {item.kontenLKPD.soalDiskusi && item.kontenLKPD.soalDiskusi.length > 0 && (
                              <div className="space-y-4 border-t border-slate-200 pt-4">
                                <strong className="text-xs text-slate-900 print:text-black uppercase block">✍️ Pertanyaan Diskusi & Hasil Kerja:</strong>
                                {item.kontenLKPD.soalDiskusi.map((soal, sIdx) => (
                                  <div key={sIdx} className="space-y-2 text-xs print-avoid-break">
                                    <p className="font-bold text-slate-900 print:text-black">{soal.nomor || sIdx + 1}. {soal.pertanyaan}</p>
                                    <div className="min-h-[90px] p-3 border-2 border-dashed border-slate-300 print:border-slate-500 rounded-xl bg-slate-50 print:bg-white text-slate-400 print:text-slate-500 italic">
                                      {soal.ruangJawaban || "[ Tuliskan jawaban / hasil kerja di sini ]"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Refleksi */}
                            {item.kontenLKPD.refleksiSingkat && (
                              <div className="pt-3 border-t border-slate-200 text-xs print-avoid-break">
                                <strong className="text-slate-900 print:text-black uppercase">💡 Refleksi Singkat Kelompok:</strong>
                                <p className="mt-1 italic text-slate-700 print:text-black bg-amber-50 print:bg-slate-50 p-3 rounded-xl border border-amber-200 print:border-slate-300">
                                  "{item.kontenLKPD.refleksiSingkat}"
                                </p>
                              </div>
                            )}

                            {/* Signatures on Print */}
                            <div className="hidden print:grid grid-cols-2 pt-6 mt-6 border-t border-slate-300 text-xs text-center">
                              <div>
                                <p>Mengetahui,</p>
                                <p className="font-bold">Guru Pengampu</p>
                                <div className="h-16"></div>
                                <p className="font-bold underline">( {formData.titiMangsa.guru || "........................................"} )</p>
                              </div>
                              <div>
                                <p>{formData.titiMangsa.tempat || "Tempat"}, {formData.titiMangsa.tanggal || "Tanggal"}</p>
                                <p className="font-bold">Perwakilan Kelompok / Siswa</p>
                                <div className="h-16"></div>
                                <p className="font-bold underline">( ........................................ )</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========================================================= */}
                        {/* ITEM TYPE 2: KARTU MEDIA / KARTU MASALAH / FLASHCARDS    */}
                        {/* ========================================================= */}
                        {item.tipe === 'kartu' && item.daftarKartu && (
                          <div className="p-6 md:p-8 space-y-6 print:p-0">
                            {/* Screen & Print Kop */}
                            <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{formData.namaSekolah || "SEKOLAH / MADRASAH"}</p>
                              <h2 className="text-base font-black uppercase text-slate-900">SET KARTU MEDIA & PERMASALAHAN PEMBELAJARAN</h2>
                              <p className="text-xs text-slate-700 mt-0.5">Topik: <strong>{formData.topik}</strong> | Mata Pelajaran: <strong>{formData.mataPelajaran}</strong> | Kelas: <strong>{formData.kelas}</strong></p>
                              <p className="text-[11px] text-slate-800 font-bold mt-1">✂️ Petunjuk: Gunting setiap kartu di bawah ini mengikuti garis putus-putus untuk digunakan dalam aktivitas pembelajaran kelompok.</p>
                            </div>

                            <div className="no-print space-y-1">
                              <p className="text-xs text-slate-300">{item.deskripsi}</p>
                              <p className="text-[11px] text-amber-400 font-bold">✂️ Petunjuk Cetak: Cetak halaman ini dan gunting mengikuti garis putus-putus kotak kartu di bawah ini.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4">
                              {item.daftarKartu.map((kartu, kIdx) => (
                                <div 
                                  key={kIdx} 
                                  className="bg-white text-slate-900 print:text-black p-5 rounded-2xl border-2 border-dashed border-indigo-400 print:border-slate-800 shadow-md print:shadow-none space-y-3 relative overflow-hidden flex flex-col justify-between print-avoid-break"
                                >
                                  <div className="flex items-center justify-between border-b border-slate-200 print:border-slate-400 pb-2">
                                    <span className="px-2.5 py-1 bg-indigo-600 print:bg-slate-900 text-white font-black text-[10px] rounded-lg uppercase tracking-wider">
                                      {kartu.kode || `KARTU ${kIdx + 1}`}
                                    </span>
                                    {kartu.kategoriBadges && (
                                      <span className="text-[10px] font-bold text-indigo-700 print:text-slate-800 uppercase">
                                        {kartu.kategoriBadges}
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-2 flex-1">
                                    <h4 className="font-black text-sm text-slate-900 print:text-black">{kartu.judul}</h4>
                                    <p className="text-xs text-slate-800 print:text-black leading-relaxed font-medium bg-slate-50 print:bg-transparent p-3 print:p-0 rounded-xl border border-slate-200 print:border-none">
                                      {kartu.isi}
                                    </p>
                                  </div>

                                  {kartu.pertanyaanPanduan && (
                                    <div className="pt-2 border-t border-slate-200 print:border-slate-400 text-[11px] text-indigo-900 print:text-black font-bold">
                                      ❓ Pertanyaan: {kartu.pertanyaanPanduan}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ========================================================= */}
                        {/* ITEM TYPE 3: VIDEO PEMBELAJARAN (DIGITAL LINK & STIMULUS) */}
                        {/* ========================================================= */}
                        {item.tipe === 'video' && item.videoInfo && (
                          <div className="p-6 space-y-5 print:p-0">
                            {/* Screen description */}
                            <p className="text-xs text-slate-300 no-print">{item.deskripsi}</p>
                            
                            {/* Document Header on Print */}
                            <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{formData.namaSekolah || "SEKOLAH / MADRASAH"}</p>
                              <h2 className="text-base font-black uppercase text-slate-900">LEMBAR PENGAMATAN & RUJUKAN VIDEO PEMBELAJARAN</h2>
                              <p className="text-xs text-slate-700 mt-0.5">Mata Pelajaran: <strong>{formData.mataPelajaran}</strong> | Topik: <strong>{formData.topik}</strong> | Kelas: <strong>{formData.kelas}</strong></p>
                            </div>

                            <div className="bg-slate-900 print:bg-white print:text-black border border-slate-800 print:border-slate-400 rounded-2xl p-5 space-y-4">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 print:border-slate-300 pb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-3 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30 no-print">
                                    <Youtube size={24} />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-black text-white print:text-black">{item.videoInfo.judulVideo}</h4>
                                    <p className="text-[11px] text-slate-400 print:text-slate-800">Kata Kunci YouTube: <code className="text-amber-300 print:text-black bg-slate-950 print:bg-slate-100 px-2 py-0.5 rounded font-mono border print:border-slate-300">{item.videoInfo.kataKunciPencarian}</code></p>
                                  </div>
                                </div>

                                <a 
                                  href={item.videoInfo.youtubeSearchUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(item.videoInfo.kataKunciPencarian)}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 no-print"
                                >
                                  <Youtube size={16} /> Buka Pencarian YouTube
                                </a>
                              </div>

                              {/* Embedded YouTube preview component (Screen only) */}
                              <div className="my-3 no-print">
                                <EmbeddedYouTube searchTopic={`${formData.mataPelajaran} ${formData.topik} ${item.videoInfo.kataKunciPencarian}`} />
                              </div>

                              <div className="space-y-2 text-xs">
                                <strong className="text-slate-200 print:text-black uppercase text-[10px] tracking-wider">Deskripsi Isi Video:</strong>
                                <p className="text-slate-300 print:text-black bg-slate-950 print:bg-slate-50 p-3 rounded-xl border border-slate-800 print:border-slate-300 leading-relaxed">{item.videoInfo.deskripsiIsi}</p>
                              </div>

                              {item.videoInfo.pertanyaanPemantikVideo && item.videoInfo.pertanyaanPemantikVideo.length > 0 && (
                                <div className="space-y-1.5 text-xs pt-2">
                                  <strong className="text-indigo-400 print:text-black uppercase text-[10px] tracking-wider">❓ Pertanyaan Pemantik Setelah Menonton Video:</strong>
                                  <ul className="list-disc pl-5 space-y-1 text-slate-300 print:text-black">
                                    {item.videoInfo.pertanyaanPemantikVideo.map((q, qIdx) => (
                                      <li key={qIdx}>{q}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Student Notes space in print view */}
                              <div className="hidden print:block pt-3 border-t border-slate-300 space-y-2 text-xs print-avoid-break">
                                <strong className="uppercase text-[10px] tracking-wider text-black">✍️ Catatan Hasil Simakan / Penemuan Siswa:</strong>
                                <div className="min-h-[100px] p-3 border-2 border-dashed border-slate-400 rounded-xl bg-slate-50 italic text-slate-500">
                                  [ Tuliskan ringkasan poin-poin penting yang didapatkan dari video di sini ]
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========================================================= */}
                        {/* ITEM TYPE 4: RUBRIK & LEMBAR PENILAIAN                    */}
                        {/* ========================================================= */}
                        {item.tipe === 'rubrik' && item.rubrikPenilaian && (
                          <div className="p-6 space-y-4 print:p-0">
                            <p className="text-xs text-slate-300 no-print">{item.deskripsi}</p>
                            
                            {/* Document Header on Print */}
                            <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{formData.namaSekolah || "SEKOLAH / MADRASAH"}</p>
                              <h2 className="text-base font-black uppercase text-slate-900">RUBRIK & INSTRUMEN PENILAIAN PEMBELAJARAN</h2>
                              <p className="text-xs text-slate-700 mt-0.5">Mata Pelajaran: <strong>{formData.mataPelajaran}</strong> | Topik: <strong>{formData.topik}</strong> | Kelas: <strong>{formData.kelas}</strong></p>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-slate-900 bg-slate-900 print:bg-white">
                              <table className="w-full text-left text-xs text-slate-300 print:text-black border-collapse">
                                <thead className="bg-slate-950 print:bg-slate-100 text-indigo-400 print:text-black uppercase text-[10px] border-b border-slate-800 print:border-slate-900">
                                  <tr>
                                    <th className="p-3 border print:border-slate-900 font-bold">Aspek Penilaian</th>
                                    <th className="p-3 border print:border-slate-900 font-bold">Sangat Baik (Skor 4)</th>
                                    <th className="p-3 border print:border-slate-900 font-bold">Cukup (Skor 2-3)</th>
                                    <th className="p-3 border print:border-slate-900 font-bold">Perlu Bimbingan (Skor 1)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 print:divide-slate-900">
                                  {item.rubrikPenilaian.kriteria.map((k, kIdx) => (
                                    <tr key={kIdx} className="hover:bg-slate-850/50 print:hover:bg-transparent">
                                      <td className="p-3 font-bold text-white print:text-black border print:border-slate-900 align-top">{k.aspek}</td>
                                      <td className="p-3 text-emerald-300 print:text-black border print:border-slate-900 align-top">{k.kriteriaBagus}</td>
                                      <td className="p-3 text-amber-300 print:text-black border print:border-slate-900 align-top">{k.kriteriaBiasa}</td>
                                      <td className="p-3 text-rose-300 print:text-black border print:border-slate-900 align-top">{k.kriteriaPerluBimbingan}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {item.rubrikPenilaian.catatanGuru && (
                              <p className="text-xs text-slate-400 print:text-black italic bg-slate-900 print:bg-slate-50 p-3 rounded-xl border border-slate-800 print:border-slate-300">
                                <strong>Catatan Guru:</strong> {item.rubrikPenilaian.catatanGuru}
                              </p>
                            )}

                            {/* Signatures on Print */}
                            <div className="hidden print:grid grid-cols-2 pt-6 mt-6 border-t border-slate-300 text-xs text-center print-avoid-break">
                              <div>
                                <p>Mengetahui,</p>
                                <p className="font-bold">Kepala Madrasah / Sekolah</p>
                                <div className="h-16"></div>
                                <p className="font-bold underline">( {formData.titiMangsa.kepala || "........................................"} )</p>
                              </div>
                              <div>
                                <p>{formData.titiMangsa.tempat || "Tempat"}, {formData.titiMangsa.tanggal || "Tanggal"}</p>
                                <p className="font-bold">Guru Pengampu</p>
                                <div className="h-16"></div>
                                <p className="font-bold underline">( {formData.titiMangsa.guru || "........................................"} )</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========================================================= */}
                        {/* ITEM TYPE 5: MEDIA LAINNYA / PANDUAN EKSPERIMEN           */}
                        {/* ========================================================= */}
                        {(item.tipe === 'media' || item.tipe === 'lainnya') && (
                          <div className="p-6 space-y-4 print:p-0">
                            <p className="text-xs text-slate-300 no-print">{item.deskripsi}</p>
                            
                            {/* Document Header on Print */}
                            <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{formData.namaSekolah || "SEKOLAH / MADRASAH"}</p>
                              <h2 className="text-base font-black uppercase text-slate-900">PANDUAN ALAT PERAGA & EKSPERIMEN PEMBELAJARAN</h2>
                              <p className="text-xs text-slate-700 mt-0.5">Topik: <strong>{formData.topik}</strong> | Mata Pelajaran: <strong>{formData.mataPelajaran}</strong></p>
                            </div>

                            {item.mediaLainnya && (
                              <div className="bg-slate-900 print:bg-white print:text-black p-5 rounded-2xl border border-slate-800 print:border-slate-300 space-y-3 text-xs">
                                <h4 className="font-bold text-indigo-400 print:text-black uppercase">{item.mediaLainnya.tipeBahan}</h4>
                                <p className="text-slate-200 print:text-black leading-relaxed">{item.mediaLainnya.panduanLengkap}</p>

                                {item.mediaLainnya.langkahPersiapan && item.mediaLainnya.langkahPersiapan.length > 0 && (
                                  <div className="pt-2">
                                    <strong className="text-slate-400 print:text-black uppercase text-[10px]">Langkah Persiapan:</strong>
                                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-300 print:text-black">
                                      {item.mediaLainnya.langkahPersiapan.map((lp, lpIdx) => (
                                        <li key={lpIdx}>{lp}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 4: KELAS INTERAKTIF AI */}
          {activeSubTab === 'interactive' && (
            <div className="relative min-h-[600px] h-[calc(100vh-85px)] flex flex-col rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl animate-in fade-in duration-500">
              
              {/* Assessment Modal */}
              {showAssessmentModal && (
                <div className="absolute inset-0 z-[60] bg-slate-950/80 backdrop-blur-md animate-in fade-in p-4 flex items-center justify-center">
                  <div className="w-full max-w-5xl h-full max-h-[95%] bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-2xl">
                          <BrainCircuit size={24}/>
                        </div>
                        <div>
                          <h2 className="text-base font-black uppercase tracking-tight">Asesmen Kognitif HOTS</h2>
                          <p className="text-[10px] font-bold text-indigo-300 uppercase flex items-center gap-2 flex-wrap">
                            <span>{formData.namaSekolah} | {formData.topik || formData.mataPelajaran} | Level {assessmentLevel.toUpperCase()}</span>
                            {((formData.mataPelajaran || '').toLowerCase().includes("matematika") || (formData.topik || '').toLowerCase().includes("matematika") || (formData.topik || '').toLowerCase().includes("hitung")) && (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md font-extrabold text-[9px]">
                                📐 Matematika: 8 Soal Ringkas (Dioperasionalkan)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!evaluationResult && (
                          <button 
                            onClick={generateAssessment} 
                            disabled={isGeneratingAssessment}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <RefreshCw size={12} className={isGeneratingAssessment ? 'animate-spin' : ''}/> Generate Ulang
                          </button>
                        )}
                        <button onClick={() => setShowAssessmentModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition-all cursor-pointer"><X size={20}/></button>
                      </div>
                    </div>
                    
                    <div className="bg-slate-950 px-6 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
                      <div className="flex-1 mr-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500 rounded-full" style={{ width: `${(Object.keys(studentAnswers).length / assessmentQuestions.length) * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase">Progress: {Object.keys(studentAnswers).length}/{assessmentQuestions.length} Soal</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50">
                      {!evaluationResult ? (
                        <div className="space-y-6 w-full max-w-4xl mx-auto">
                          {assessmentQuestions.map((q, idx) => (
                            <div key={q.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">{idx + 1}</span>
                                <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase">
                                  LEVEL: {q.type === 'pg' ? 'Analis (C4)' : q.type === 'isian' ? 'Evaluasi (C5)' : 'Kreasi (C6)'}
                                </span>
                              </div>
                              
                              <p className="text-slate-200 text-sm font-bold leading-relaxed">{q.question}</p>
                              
                              {q.type === 'pg' && q.options && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {q.options.map((opt, i) => (
                                    <button key={i} onClick={() => setStudentAnswers(prev => ({...prev, [q.id]: opt}))} className={`text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${studentAnswers[q.id] === opt ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-indigo-500/40'}`}>
                                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${studentAnswers[q.id] === opt ? 'bg-white/20' : 'bg-slate-800 text-slate-400'}`}>{String.fromCharCode(65 + i)}</span>
                                      <span className="font-semibold text-xs">{opt}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {(q.type === 'isian' || q.type === 'uraian') && (
                                <textarea className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-200 font-medium text-xs" placeholder="Tuliskan jawaban Anda di sini..." rows={q.type === 'uraian' ? 4 : 2} value={studentAnswers[q.id] || ""} onChange={(e) => setStudentAnswers(prev => ({...prev, [q.id]: e.target.value}))} />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6 animate-in slide-in-from-bottom duration-500 w-full max-w-4xl mx-auto pb-6">
                          {/* Header Summary Banner */}
                          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                              <Award size={180} className="text-amber-400" />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                              <div className="text-center md:text-left space-y-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                                  <Award size={12} /> Hasil Evaluasi Asesmen HOTS
                                </span>
                                <h2 className="text-2xl font-black text-white tracking-tight">
                                  Laporan Kemampuan Belajar Azkayra
                                </h2>
                                <p className="text-xs text-indigo-200 font-medium max-w-xl leading-relaxed">
                                  "{evaluationResult.hots_analysis}"
                                </p>
                              </div>

                              <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 rounded-2xl border border-indigo-500/30 min-w-[140px]">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor Akhir</span>
                                <span className="text-5xl font-black text-amber-400 my-1">{evaluationResult.score}</span>
                                <span className="text-[10px] font-bold text-indigo-300">Dari 100 Poin</span>
                              </div>
                            </div>

                            {/* Metric Quick Stats */}
                            {evaluationResult.summary && (
                              <div className="mt-6 pt-6 border-t border-indigo-500/20 grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/30 flex items-center gap-3">
                                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                    <CheckCircle2 size={18} />
                                  </div>
                                  <div>
                                    <div className="text-xs font-black text-emerald-400">
                                      {evaluationResult.summary.correctCount ?? '-'} Soal
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Jawaban Benar</div>
                                  </div>
                                </div>

                                <div className="p-3 bg-slate-900/80 rounded-xl border border-rose-500/30 flex items-center gap-3">
                                  <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                                    <AlertCircle size={18} />
                                  </div>
                                  <div>
                                    <div className="text-xs font-black text-rose-400">
                                      {evaluationResult.summary.incorrectCount ?? '-'} Soal
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Salah / Perlu Perbaikan</div>
                                  </div>
                                </div>

                                <div className="col-span-2 md:col-span-1 p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 flex items-center gap-3">
                                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                                    <Sparkles size={18} />
                                  </div>
                                  <div>
                                    <div className="text-xs font-black text-amber-400">
                                      {evaluationResult.rating ? `Rating ${evaluationResult.rating}/5` : 'Lulus Asesmen'}
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Tingkat Pencapaian</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Motivation Box */}
                          {evaluationResult.motivation && (
                            <div className="p-4 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl flex items-start gap-3">
                              <div className="p-2 bg-indigo-600/30 text-indigo-300 rounded-xl shrink-0 mt-0.5">
                                <Sparkles size={18} />
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider mb-1">Pesan Motivasi Guru GEM:</h4>
                                <p className="text-xs text-slate-200 font-medium leading-relaxed">{evaluationResult.motivation}</p>
                              </div>
                            </div>
                          )}

                          {/* Strengths & Areas to Improve Cards */}
                          {evaluationResult.summary && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Strengths Card */}
                              <div className="p-5 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                                  <CheckCircle2 size={16} /> Kelebihan & Penguasaan Materi
                                </div>
                                <ul className="space-y-2">
                                  {evaluationResult.summary.strengths && evaluationResult.summary.strengths.length > 0 ? (
                                    evaluationResult.summary.strengths.map((str, i) => (
                                      <li key={i} className="text-xs text-slate-300 font-medium flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                                        <span className="text-emerald-400 font-bold shrink-0">✓</span> {str}
                                      </li>
                                    ))
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">Siswa telah mengikuti pengerjaan dengan baik.</p>
                                  )}
                                </ul>
                              </div>

                              {/* Areas To Improve (Ulasan Jawaban Salah) Card */}
                              <div className="p-5 bg-slate-950 border border-rose-500/30 rounded-2xl space-y-3">
                                <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
                                  <AlertCircle size={16} /> Catatan Kekurangan & Ulasan Jawaban Salah
                                </div>
                                <ul className="space-y-2">
                                  {evaluationResult.summary.areasToImprove && evaluationResult.summary.areasToImprove.length > 0 ? (
                                    evaluationResult.summary.areasToImprove.map((item, i) => (
                                      <li key={i} className="text-xs text-rose-200 font-medium flex items-start gap-2 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/20">
                                        <span className="text-rose-400 font-bold shrink-0">⚠️</span> {item}
                                      </li>
                                    ))
                                  ) : (
                                    <p className="text-xs text-emerald-300 font-semibold p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-500/20">
                                      🎉 Tidak ada jawaban salah yang signifikan. Semua jawaban dijawab dengan sangat baik!
                                    </p>
                                  )}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Detailed Itemized Evaluation Review */}
                          <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                                <Target size={16} className="text-indigo-400" /> Ulasan Rinci Per Nomor Soal & Jawaban
                              </h3>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">
                                {assessmentQuestions.length} Soal Dievaluasi
                              </span>
                            </div>

                            <div className="space-y-4">
                              {assessmentQuestions.map((q, idx) => {
                                const itemEval = evaluationResult.item_evaluations?.find(e => e.id === q.id);
                                const studentAns = studentAnswers[q.id] || "(Tidak diisi)";
                                const isIncorrect = itemEval ? (itemEval.status === 'incorrect' || itemEval.status === 'partial') : false;

                                return (
                                  <div 
                                    key={q.id} 
                                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                                      isIncorrect 
                                        ? 'bg-rose-950/20 border-rose-500/40' 
                                        : 'bg-slate-950 border-slate-800'
                                    }`}
                                  >
                                    {/* Header Soal */}
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-center gap-2.5">
                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                          isIncorrect ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
                                        }`}>
                                          {idx + 1}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-indigo-400 text-[10px] font-bold uppercase">
                                          {q.type.toUpperCase()}
                                        </span>
                                      </div>

                                      {/* Status Badge */}
                                      <div className="shrink-0">
                                        {isIncorrect ? (
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-[10px] font-black uppercase">
                                            <AlertCircle size={12} /> Jawaban Salah / Kurang Tepat
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase">
                                            <CheckCircle2 size={12} /> Jawaban Benar
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Pertanyaan */}
                                    <p className="text-xs text-slate-200 font-bold leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                                      {q.question}
                                    </p>

                                    {/* Jawaban Siswa vs Jawaban Benar */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                      <div className={`p-3 rounded-xl border ${isIncorrect ? 'bg-rose-950/40 border-rose-500/30 text-rose-100' : 'bg-slate-900 border-slate-800 text-slate-200'}`}>
                                        <span className="text-[9px] font-black uppercase tracking-wider block mb-1 text-slate-400">
                                          Jawaban Azkayra:
                                        </span>
                                        <p className="font-semibold">{studentAns}</p>
                                      </div>

                                      {itemEval?.correctAnswer && (
                                        <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-100">
                                          <span className="text-[9px] font-black uppercase tracking-wider block mb-1 text-emerald-400">
                                            Konsep / Jawaban Yang Benar:
                                          </span>
                                          <p className="font-semibold">{itemEval.correctAnswer}</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Ulasan & Feedback Guru GEM */}
                                    {itemEval?.evaluation && (
                                      <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                                        isIncorrect 
                                          ? 'bg-rose-900/30 border-rose-500/30 text-rose-200' 
                                          : 'bg-indigo-950/40 border-indigo-500/20 text-slate-200'
                                      }`}>
                                        <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wider">
                                          {isIncorrect ? (
                                            <span className="text-rose-400 flex items-center gap-1">
                                              <AlertCircle size={14} /> Ulasan Korektif & Penjelasan Kesalahan:
                                            </span>
                                          ) : (
                                            <span className="text-indigo-300 flex items-center gap-1">
                                              <Sparkles size={14} /> Ulasan Guru GEM:
                                            </span>
                                          )}
                                        </div>
                                        <p className="font-medium">{itemEval.evaluation}</p>

                                        {itemEval.improvementTip && (
                                          <div className="mt-2 pt-2 border-t border-rose-500/20 text-[11px] font-semibold text-amber-300 flex items-start gap-1.5">
                                            <span className="shrink-0">📌</span>
                                            <span><strong>Saran Perbaikan:</strong> {itemEval.improvementTip}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Overall Category Feedback (PG, Isian, Uraian) */}
                          {evaluationResult.feedback && (
                            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                              <h4 className="text-xs font-black uppercase tracking-wider text-white">Ringkasan Feedback Per Bentuk Soal:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                {evaluationResult.feedback.pg && (
                                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">Pilihan Ganda (PG)</span>
                                    <p className="text-slate-300 font-medium text-[11px]">{evaluationResult.feedback.pg}</p>
                                  </div>
                                )}
                                {evaluationResult.feedback.isian && (
                                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">Soal Isian</span>
                                    <p className="text-slate-300 font-medium text-[11px]">{evaluationResult.feedback.isian}</p>
                                  </div>
                                )}
                                {evaluationResult.feedback.uraian && (
                                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">Soal Uraian</span>
                                    <p className="text-slate-300 font-medium text-[11px]">{evaluationResult.feedback.uraian}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button 
                              onClick={() => setEvaluationResult(null)} 
                              className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
                            >
                              <RefreshCw size={14} /> Ulangi Pengerjaan Asesmen
                            </button>
                            <button 
                              onClick={() => setShowAssessmentModal(false)} 
                              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                            >
                              Kembali Ke Kelas Utama
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {!evaluationResult && (
                      <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
                        <button onClick={submitAssessment} disabled={isEvaluating || Object.keys(studentAnswers).length < assessmentQuestions.length} className="w-full max-w-md mx-auto py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider text-xs cursor-pointer">
                          {isEvaluating ? <RefreshCw className="animate-spin" size={16}/> : <Send size={16}/>} Submit Jawaban HOTS
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chat Header */}
              <div className="bg-slate-900 py-3 px-6 text-white font-black flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
                    <Bot size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs tracking-widest uppercase text-white">GURU AI: GEM TUTOR</h3>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                      <CheckCircle2 size={10} className="text-emerald-400" /> Sesi Aktif: {formData.topik || 'Sesi Pembelajaran'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      if (!showBlackboard && !blackboardSummary) {
                        generateBlackboardSummary();
                      } else {
                        setShowBlackboard(!showBlackboard);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer border ${
                      showBlackboard 
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20' 
                        : 'bg-slate-950 text-amber-300 border-amber-500/30 hover:bg-slate-800'
                    }`}
                  >
                    <LayoutList size={12} /> 📋 PAPAN TULIS KELAS
                  </button>

                  <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button onClick={() => setLearningMode('text')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${learningMode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><Type size={12}/> TEKS</button>
                    <button onClick={() => setLearningMode('audio')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${learningMode === 'audio' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><Headphones size={12}/> AUDIO</button>
                  </div>
                </div>
              </div>

              {/* Classroom Interactive Blackboard Drawer/Card */}
              {showBlackboard && (
                <div className="bg-slate-900 border-b border-amber-500/30 p-4 shadow-2xl animate-in slide-in-from-top duration-300 shrink-0">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                      <Sparkles size={16} /> Catatan Papan Tulis Kelas (Rangkuman Pembelajaran)
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={generateBlackboardSummary}
                        disabled={isGeneratingBlackboard}
                        className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <RefreshCw size={10} className={isGeneratingBlackboard ? "animate-spin" : ""} /> Perbarui Catatan
                      </button>
                      <button 
                        onClick={() => setShowBlackboard(false)}
                        className="text-slate-400 hover:text-white cursor-pointer p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {isGeneratingBlackboard ? (
                    <div className="p-6 text-center text-slate-400 font-bold text-xs animate-pulse flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-amber-400" />
                      <span>Guru GEM sedang menulis rangkuman di Papan Tulis Kelas...</span>
                    </div>
                  ) : blackboardSummary ? (
                    <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 text-slate-200 text-xs font-medium leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-sans">
                      {blackboardSummary}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-slate-400 text-xs font-medium">
                      Belum ada catatan. Klik <span className="text-amber-400 font-bold">"Perbarui Catatan"</span> untuk merangkum poin penting pembelajaran saat ini.
                    </div>
                  )}
                </div>
              )}
              
              {/* Chat History Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-slate-950/40">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <div className="p-8 bg-slate-900 rounded-full border border-slate-800 animate-pulse">
                      <MessageSquare size={48} className="text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-black uppercase tracking-wider text-slate-300">Menunggu Guru GEM...</p>
                      <p className="text-xs font-bold text-slate-500">Lakukan Konfigurasi & Generate RPP untuk mulai kelas interaktif.</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-5xl md:max-w-6xl mx-auto space-y-6 pb-6">
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className="flex items-center gap-2 mb-1 px-2">
                          {msg.role === 'assistant' && <div className="p-1 bg-indigo-600 text-white rounded-lg"><Bot size={10}/></div>}
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            {msg.role === 'user' ? 'Jawaban Azkayra' : 'Instruksi Guru GEM'}
                          </span>
                          {msg.role === 'user' && <div className="p-1 bg-slate-800 text-white rounded-lg"><User size={10}/></div>}
                        </div>

                        <div className={`relative w-full ${msg.role === 'user' ? 'max-w-[85%] md:max-w-[75%]' : 'max-w-[100%] md:max-w-[98%]'} p-4 md:p-6 rounded-2xl border transition-all ${
                          msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-500' 
                          : 'bg-slate-900 text-slate-100 rounded-tl-none border-slate-800 shadow-xl'
                        }`}>
                          {msg.image && (
                            <div className="mb-3 rounded-xl overflow-hidden border border-white/20">
                               <img src={msg.image} alt="Lampiran" className="max-h-60 w-full object-cover" />
                            </div>
                          )}
                          {msg.file && (
                            <div className="mb-3 p-2.5 bg-indigo-950/50 rounded-xl border border-indigo-500/30 flex items-center gap-2">
                               <FileIcon size={18} className="text-indigo-400"/>
                               <div className="overflow-hidden"><p className="text-xs font-bold truncate">{msg.file.name}</p></div>
                            </div>
                          )}
                          {msg.audio && (
                            <div className="mb-3 p-2.5 bg-emerald-950/50 rounded-xl border border-emerald-500/30 flex items-center gap-2">
                               <Music size={18} className="text-emerald-400"/>
                               <div className="overflow-hidden"><p className="text-xs font-bold truncate">{msg.audio.name}</p></div>
                            </div>
                          )}
                          {msg.aiImage && (
                            <div className="mb-4 rounded-xl overflow-hidden border border-indigo-500/30 bg-slate-950 p-2">
                              <span className="text-[9px] font-black text-indigo-400 uppercase p-1.5 block text-center tracking-wider">Media Visual Pembelajaran</span>
                              <img src={msg.aiImage} alt="AI Art" className="max-h-80 w-full object-contain rounded-lg" />
                            </div>
                          )}
                          
                          {(() => {
                            let text = msg.text;
                            let makeAMatchData: any = null;
                            let quizData: any = null;
                            let choiceData: any = null;
                            let projectTaskData: any = null;
                            let youtubeData: string | null = null;

                            const tryParse = (str: string) => {
                              if (!str) return null;
                              try {
                                return JSON.parse(str);
                              } catch (e1) {
                                try {
                                  const cleaned = str
                                    .replace(/[\u201C\u201D]/g, '"')
                                    .replace(/[\u2018\u2019]/g, "'")
                                    .replace(/,\s*([}\]])/g, '$1')
                                    .replace(/[\r\n]+/g, ' ');
                                  return JSON.parse(cleaned);
                                } catch (e2) {
                                  console.error("Parse JSON tag error:", e2, str);
                                  return null;
                                }
                              }
                            };

                            const extractTag = (tagName: string) => {
                              const startPattern = `[${tagName}:`;
                              const startIdx = text.indexOf(startPattern);
                              if (startIdx === -1) return null;

                              let bracketCount = 0;
                              let endIdx = -1;
                              for (let i = startIdx; i < text.length; i++) {
                                if (text[i] === '[') bracketCount++;
                                else if (text[i] === ']') {
                                  bracketCount--;
                                  if (bracketCount === 0) {
                                    endIdx = i;
                                    break;
                                  }
                                }
                              }

                              if (endIdx === -1) {
                                endIdx = text.indexOf(']', startIdx);
                              }

                              if (endIdx !== -1) {
                                const fullTag = text.substring(startIdx, endIdx + 1);
                                const innerStr = text.substring(startIdx + startPattern.length, endIdx).trim();
                                text = text.replace(fullTag, '').trim();
                                return innerStr;
                              }

                              return null;
                            };

                            const matchStr = extractTag('GAME_MAKE_A_MATCH');
                            if (matchStr) makeAMatchData = tryParse(matchStr);

                            const quizStr = extractTag('GAME_QUIZ');
                            if (quizStr) quizData = tryParse(quizStr);

                            const choiceStr = extractTag('GAME_CHOICE');
                            if (choiceStr) choiceData = tryParse(choiceStr);

                            const projStr = extractTag('PROJECT_TASK');
                            if (projStr) projectTaskData = tryParse(projStr);

                            const ytStr = extractTag('EMBED_YOUTUBE');
                            if (ytStr) youtubeData = ytStr;

                            return (
                              <div className="space-y-3">
                                {text && (
                                  <div className="whitespace-pre-wrap leading-relaxed text-sm font-medium">
                                    {text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
                                      if (part.match(/https?:\/\/[^\s]+/)) {
                                        const isYoutube = part.includes('youtube') || part.includes('youtu.be');
                                        return (
                                          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all my-1 border ${
                                            msg.role === 'user' ? 'bg-white/20 border-white/20 text-white' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30'
                                          }`}>
                                            {isYoutube ? <Youtube size={14}/> : <Music size={14}/>} 
                                            {isYoutube ? 'Tonton Video' : 'Dengarkan Audio'}
                                          </a>
                                        );
                                      }
                                      return part;
                                    })}
                                  </div>
                                )}

                                {makeAMatchData && makeAMatchData.pairs && (
                                  <MakeAMatchGame 
                                    title={makeAMatchData.title} 
                                    pairs={makeAMatchData.pairs} 
                                    onComplete={(res) => handleSendMessage(res)} 
                                  />
                                )}

                                {quizData && (
                                  <InteractiveQuiz 
                                    title={quizData.title}
                                    question={quizData.question}
                                    options={quizData.options || []}
                                    correctIndex={quizData.correctIndex}
                                    explanation={quizData.explanation}
                                    onSelectOption={(ans) => handleSendMessage(ans)}
                                  />
                                )}

                                {choiceData && (
                                  <ChoiceGame
                                    title={choiceData.title}
                                    scenario={choiceData.scenario}
                                    choices={choiceData.choices || []}
                                    onSelectChoice={(choice) => handleSendMessage(choice)}
                                  />
                                )}

                                {projectTaskData && (
                                  <ProjectTask
                                    title={projectTaskData.title}
                                    description={projectTaskData.description}
                                    instruction={projectTaskData.instruction}
                                    onTriggerUpload={() => fileInputRef.current?.click()}
                                  />
                                )}

                                {youtubeData && (
                                  <EmbeddedYouTube queryOrUrl={youtubeData} />
                                )}
                              </div>
                            );
                          })()}

                          {msg.role === 'assistant' && (
                            <button onClick={() => playTTS(msg.text, idx)} disabled={isSpeaking !== null && isSpeaking !== idx} className="mt-2 text-slate-400 hover:text-indigo-400 transition-all flex items-center gap-1.5 font-bold text-[10px] uppercase cursor-pointer">
                              {isSpeaking === idx ? <Loader2 size={14} className="animate-spin"/> : <Volume2 size={14}/>} 
                              {isSpeaking === idx ? "Menarasikan..." : "Dengarkan AI"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}


                    {isGeneratingMedia && (
                      <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-800 text-indigo-400 animate-pulse">
                        <Sparkles size={20}/>
                        <span className="text-xs font-black uppercase tracking-wider italic">Guru GEM sedang menyiapkan media visual...</span>
                      </div>
                    )}

                    {isLessonFinished && (
                      <div className="mt-12 mb-4 flex flex-col items-center animate-in zoom-in duration-500">
                        <div className="bg-emerald-950/60 border border-emerald-500/30 p-6 rounded-3xl text-center shadow-xl mb-4 max-w-md">
                          <Award size={48} className="text-emerald-400 mx-auto mb-3"/>
                          <h3 className="text-xl font-black text-emerald-300 tracking-tight mb-1 uppercase">Pembelajaran Tuntas!</h3>
                          <p className="text-xs text-slate-300 font-medium">Seluruh materi RPP telah disampaikan. Mari uji pemahaman dengan soal HOTS!</p>
                        </div>

                        <div className="mb-4 flex flex-col items-center space-y-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tingkatan Asesmen</span>
                          <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                            {(['dasar', 'menengah', 'tinggi'] as const).map(lvl => (
                              <button 
                                key={lvl} 
                                onClick={() => setAssessmentLevel(lvl)} 
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase cursor-pointer ${assessmentLevel === lvl ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button onClick={generateAssessment} disabled={isGeneratingAssessment} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl transition-all flex items-center gap-3 uppercase tracking-wider text-xs cursor-pointer">
                          {isGeneratingAssessment ? <RefreshCw className="animate-spin" size={18}/> : <FileQuestion size={18}/>}
                          <span>{isGeneratingAssessment ? "MENYIAPKAN SOAL..." : `MULAI ASESMEN ${assessmentLevel.toUpperCase()}`}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3 no-print shrink-0">
                {generatedRPP && !isLessonFinished && (
                  <div className="space-y-2 border-b border-slate-800/80 pb-2">
                    {/* Collapsible Header Toggle Bar */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowToolsPanel(!showToolsPanel)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 transition-all cursor-pointer shadow-sm text-[11px] font-extrabold"
                      >
                        <Sparkles size={13} className="text-amber-400" />
                        <span>Tool & Bantuan Belajar</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 text-indigo-400 ${showToolsPanel ? 'rotate-180' : ''}`} />
                      </button>

                      <span className="text-[10px] text-slate-400 font-medium italic hidden sm:inline">
                        {showToolsPanel ? '⚡ Layar interaktif siap' : '💡 Klik untuk membuka tombol bantuan & media'}
                      </span>
                    </div>

                    {/* Collapsible Content */}
                    {showToolsPanel && (
                      <div className="space-y-2.5 pt-1 animate-in slide-in-from-top-2 duration-300">
                        {/* Media & Interactive Games Bar */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide text-[10px] font-bold">
                          <button 
                            type="button"
                            onClick={() => handleSendMessage("Guru GEM, tolong buatkan permainan Make a Match (jodohkan kartu) untuk topik materi yang sedang kita bahas ini!")}
                            className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                          >
                            <Sparkles size={12} className="text-amber-400" /> 🎮 Main Kartu
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleSendMessage("Guru GEM, buatkan kuis interaktif cepat pilihan ganda tentang materi ini!")}
                            className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/30 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                          >
                            <Award size={12} className="text-amber-400" /> ❓ Kuis Interaktif
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleSendMessage("Guru GEM, tampilkan video YouTube pembelajaran yang menarik terkait topik ini!")}
                            className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/30 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                          >
                            <Youtube size={12} className="text-red-400" /> 📹 Video YouTube
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleSendMessage("Guru GEM, buatkan gambar visual pembelajaran untuk topik ini!")}
                            className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                          >
                            <ImageIcon size={12} className="text-emerald-400" /> 🖼️ Gambar Visual
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleSendMessage("Guru GEM, berikan tugas proyek kreatif atau praktek sederhana untuk topik materi ini agar anak bisa membuat karya lalu mengupload fotonya di sini!")}
                            className="px-3 py-1.5 bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-500/30 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                          >
                            <Sparkles size={12} className="text-teal-400" /> 🎨 Tugas Proyek
                          </button>
                        </div>

                        {/* Student Assistance Quick Actions (Fitur Bantuan & Minta Penjelasan Ulang) */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide text-[10px] font-bold border-t border-slate-800/80 pt-2 items-center">
                          <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                            💡 BANTUAN SISWA:
                          </span>
                          
                          <button 
                            type="button"
                            onClick={() => handleSendMessage("Guru GEM, tolong jelaskan materi tadi dengan bahasa yang lebih sederhana dan mudah dipahami anak-anak!")}
                            className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                          >
                            💡 Jelaskan Lebih Sederhana
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleSendMessage("Guru GEM, bisakah berikan contoh nyata dalam kehidupan sehari-hari untuk materi ini?")}
                            className="px-3 py-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/30 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                          >
                            📌 Beri Contoh Sehari-hari
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleSendMessage("Guru GEM, saya masih belum paham bagian ini. Bisakah diterangkan ulang pelan-pelan?")}
                            className="px-3 py-1.5 bg-fuchsia-950/80 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                          >
                            🔁 Minta Penjelasan Ulang
                          </button>

                          <button 
                            type="button"
                            onClick={() => {
                              handleSendMessage("Guru GEM, tolong rangkum poin-poin utama materi kita ke dalam Papan Tulis Kelas!");
                              generateBlackboardSummary();
                            }}
                            className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/30 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                          >
                            📋 Rangkum ke Papan Tulis
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Live Mic Recording Status & Error Info Banners */}
                {isListening && (
                  <div className="flex items-center justify-between px-3 py-2 bg-rose-950/90 border border-rose-500/50 text-rose-200 rounded-xl text-xs font-bold animate-pulse shadow-lg">
                    <div className="flex items-center gap-2">
                      <Mic size={16} className="text-rose-400 animate-bounce shrink-0" />
                      <span>{mediaRecorder ? "🔴 Merekam audio... Silakan bicara! Klik 'Kirim & Selesai' jika sudah." : "🎙️ Mendengarkan suara Azkayra... Silakan bicara! Pesan terkirim otomatis setelah selesai."}</span>
                    </div>
                    <button
                      type="button"
                      onClick={stopVoiceRecognition}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] uppercase font-black tracking-wider cursor-pointer shadow shrink-0"
                    >
                      Kirim & Selesai
                    </button>
                  </div>
                )}

                {micErrorMsg && (
                  <div className="flex items-center justify-between px-3 py-2 bg-amber-950/90 border border-amber-500/50 text-amber-200 rounded-xl text-xs font-medium shadow-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="text-amber-400 shrink-0" />
                      <span className="leading-snug">{micErrorMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMicErrorMsg(null)}
                      className="text-amber-400 hover:text-white p-1 cursor-pointer shrink-0"
                      title="Tutup"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex gap-3 px-2">

                  {attachedImage && (
                    <div className="relative">
                      <img src={attachedImage} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-slate-700" />
                      <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 cursor-pointer"><X size={12} /></button>
                    </div>
                  )}
                  {attachedFile && (
                    <div className="relative p-2 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-2">
                      <FileIcon size={16} className="text-indigo-400"/>
                      <span className="text-[10px] font-bold text-slate-200 truncate max-w-[100px]">{attachedFile.name}</span>
                      <button onClick={() => setAttachedFile(null)} className="text-rose-400 hover:text-rose-300 cursor-pointer ml-1"><X size={12} /></button>
                    </div>
                  )}
                  {attachedAudio && (
                    <div className="relative p-2 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-2">
                      <Music size={16} className="text-emerald-400"/>
                      <span className="text-[10px] font-bold text-slate-200 truncate max-w-[100px]">{attachedAudio.name}</span>
                      <button onClick={() => setAttachedAudio(null)} className="text-rose-400 hover:text-rose-300 cursor-pointer ml-1"><X size={12} /></button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 items-end">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <input type="file" ref={fileDocInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileDocUpload} />
                  <input type="file" ref={audioInputRef} className="hidden" accept=".mp3,.wav" onChange={handleAudioUpload} />
                  
                  <div className="flex gap-1.5">
                    <button onClick={() => fileInputRef.current?.click()} disabled={isLessonFinished} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer" title="Foto"><ImageIcon size={18}/></button>
                    <button onClick={() => fileDocInputRef.current?.click()} disabled={isLessonFinished} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer" title="Dokumen"><FileIcon size={18}/></button>
                    <button onClick={() => audioInputRef.current?.click()} disabled={isLessonFinished} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer" title="Audio"><Music size={18}/></button>
                    <button 
                      onClick={startVoiceRecognition} 
                      disabled={isLessonFinished} 
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${isListening ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-lg shadow-rose-600/30' : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'}`} 
                      title={isListening ? "Klik untuk menghentikan rekaman suara" : "Suara / Dikte (Bicara)"}
                    >
                      <Mic size={18}/>
                    </button>
                  </div>

                  <div className="flex-1 relative">
                    <textarea 
                      className="w-full bg-slate-950 text-white p-3.5 pl-4 pr-12 rounded-2xl outline-none text-sm border border-slate-800 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-500 scrollbar-hide resize-none min-h-[48px] max-h-28 py-3"
                      rows={1} 
                      placeholder={isLessonFinished ? "Sesi Selesai." : (isListening ? "Mendengarkan..." : (generatedRPP ? "Ketik pesan untuk Guru GEM..." : "Lengkapi Konfigurasi dulu..."))} 
                      value={chatInput} 
                      disabled={!generatedRPP || isLessonFinished} 
                      onChange={e => { setChatInput(e.target.value); e.target.style.height = 'inherit'; e.target.style.height = `${e.target.scrollHeight}px`; }} 
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} 
                    />
                    <button onClick={() => handleSendMessage()} disabled={!generatedRPP || isLessonFinished || (!chatInput.trim() && !attachedImage && !attachedFile && !attachedAudio)} className="absolute right-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-30 cursor-pointer"><Send size={16}/></button>
                  </div>
                </div>
              </div>
            </div>
          )}
            </>
          )}

          {/* MODAL FULLSCREEN PRESENTATION UNTUK GAMBAR PERAGA */}
          {fullScreenImageModal && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in no-print">
              <div className="bg-slate-950 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                      fullScreenImageModal.kategori === 'contoh'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : fullScreenImageModal.kategori === 'bukan_contoh'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {fullScreenImageModal.labelBadge || "GAMBAR PERAGA KELAS"}
                    </span>
                    <h3 className="text-sm font-black text-white truncate max-w-md">
                      {fullScreenImageModal.judul}
                    </h3>
                  </div>
                  <button
                    onClick={() => setFullScreenImageModal(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                  {fullScreenImageModal.urlGambar ? (
                    <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 max-h-[50vh]">
                      <img
                        src={fullScreenImageModal.urlGambar}
                        alt={fullScreenImageModal.judul}
                        referrerPolicy="no-referrer"
                        className="max-h-[50vh] w-auto object-contain rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-sm font-bold text-slate-200">
                        "{fullScreenImageModal.deskripsiVisual}"
                      </p>
                      <p className="text-xs text-slate-400">
                        Gambar visual edukatif dapat digenerate secara langsung menggunakan tombol di lembar bahan pendukung.
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                    <p className="text-xs font-black uppercase text-indigo-400">
                      💡 Penjelasan Konsep untuk Siswa:
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {fullScreenImageModal.penjelasanKonsep}
                    </p>
                    {fullScreenImageModal.pertanyaanPemantik && (
                      <p className="text-xs text-amber-300 font-bold italic pt-1">
                        ❓ Pertanyaan Pemantik: "{fullScreenImageModal.pertanyaanPemantik}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setFullScreenImageModal(null)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Tutup Tampilan Proyektor
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <style>{`
        @media print {
          body { visibility: hidden !important; background: white !important; color: black !important; margin: 0 !important; }
          .no-print, header, aside, button, nav { display: none !important; }
          .print-container { visibility: visible !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: auto !important; margin: 0 !important; padding: 1.5cm !important; border: none !important; box-shadow: none !important; display: block !important; }
          .print-container * { visibility: visible !important; color: black !important; }
          .export-header { display: flex !important; border-bottom: 2px solid black !important; }
          .export-title { display: block !important; margin-bottom: 2rem !important; }
          @page { margin: 1cm; size: auto; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
