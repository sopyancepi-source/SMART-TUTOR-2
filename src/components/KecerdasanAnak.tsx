import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Sparkles,
  Award,
  Trophy,
  Star,
  RefreshCw,
  Printer,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Compass,
  Zap,
  BookOpen,
  ChevronRight,
  Smile,
  Heart,
  Lightbulb,
  FileText,
  Target,
  ArrowRight,
  RotateCcw,
  Sparkle,
  Eye,
  Puzzle,
  Download,
  Flame,
  Check,
  Play
} from 'lucide-react';

export type AgeGroup = 'paud' | 'sd-awal' | 'sd-atas';
export type IntelligenceCategory = 'logika' | 'matematika' | 'bahasa' | 'visual' | 'emosi' | 'fokus';

export interface ChallengeItem {
  id: string;
  category: IntelligenceCategory;
  ageGroup: AgeGroup;
  title: string;
  instruction: string;
  storyPrompt?: string;
  question: string;
  visualHint?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
  funFact?: string;
}

// Data tantangan bawaan berjenjang (Offline Ready & Instan)
const BUILT_IN_CHALLENGES: ChallengeItem[] = [
  // 1. LOGIKA - PAUD
  {
    id: 'log-paud-1',
    category: 'logika',
    ageGroup: 'paud',
    title: 'Pola Buah Berulang',
    instruction: 'Amati urutan buah di bawah ini!',
    storyPrompt: 'Kelinci sedang menata buah di keranjang.',
    question: 'Apel 🍎, Pisang 🍌, Apel 🍎, Pisang 🍌, lalu buah apa berikutnya?',
    visualHint: '🍎 🍌 🍎 🍌 ❓',
    options: ['Apel 🍎', 'Jeruk 🍊', 'Semangka 🍉', 'Anggur 🍇'],
    correctIndex: 0,
    explanation: 'Hebat! Polanya adalah bergantian satu Apel lalu satu Pisang. Setelah Pisang, kembali ke Apel!',
    points: 10,
    funFact: 'Pola adalah rahasia otak cerdas untuk menebak urutan dengan tepat!'
  },
  // 2. LOGIKA - SD AWAL
  {
    id: 'log-awal-1',
    category: 'logika',
    ageGroup: 'sd-awal',
    title: 'Teka-Teki Siapa Paling Tinggi?',
    instruction: 'Bacalah petunjuk logika berikut dengan cermat!',
    question: 'Budi lebih tinggi dari Cici. Denis lebih tinggi dari Budi. Siapakah yang paling tinggi di antara ketiganya?',
    options: ['Cici', 'Budi', 'Denis', 'Semua sama tinggi'],
    correctIndex: 2,
    explanation: 'Tepat sekali! Denis > Budi > Cici. Jadi Denis adalah yang paling tinggi.',
    points: 15,
    funFact: 'Menyusun urutan di pikiran melatih kemampuan logika deduktifmu!'
  },
  // 3. LOGIKA - SD ATAS
  {
    id: 'log-atas-1',
    category: 'logika',
    ageGroup: 'sd-atas',
    title: 'Misteri Sakelar Lampu di Luar Ruangan',
    instruction: 'Gunakan penalaran sebab-akibat kritis!',
    storyPrompt: 'Kamu berada di luar ruangan tertutup dengan 3 sakelar (A, B, C). Hanya satu sakelar yang menyalakan bohlam lampu pijar di dalam ruangan. Kamu hanya boleh masuk ke dalam ruangan SATU kali saja.',
    question: 'Bagaimana cara memastikan sakelar yang tepat?',
    options: [
      'Nyalakan sakelar A beberapa menit lalu matikan, nyalakan sakelar B, lalu masuk dan raba kehangatan bohlam',
      'Tekan semua sakelar sekaligus lalu langsung masuk',
      'Pilih secara acak sakelar C tanpa menyalakan yang lain',
      'Nyalakan sakelar A sebentar lalu tebak sakelar B'
    ],
    correctIndex: 0,
    explanation: 'Luar biasa analitis! Jika lampu menyala = sakelar B. Jika mati tapi bohlam hangat = sakelar A. Jika mati dan dingin = sakelar C!',
    points: 25,
    funFact: 'Penalaran lateral ini sering digunakan oleh para ilmuwan dan detektif hebat dunia!'
  },
  // 4. MATEMATIKA VISUAL - PAUD
  {
    id: 'mat-paud-1',
    category: 'matematika',
    ageGroup: 'paud',
    title: 'Menghitung Teman Kucing',
    instruction: 'Hitung jumlah anak kucing yang lucu!',
    question: 'Ada 3 anak kucing sedang bermain bola, lalu datang lagi 2 anak kucing ikut bermain. Berapa jumlah semua anak kucing sekarang?',
    visualHint: '🐱 🐱 🐱  +  🐱 🐱 = ❓',
    options: ['4 Ekor', '5 Ekor', '6 Ekor', '3 Ekor'],
    correctIndex: 1,
    explanation: 'Benar sekali! 3 kucing ditambah 2 kucing hasilnya adalah 5 kucing!',
    points: 10,
    funFact: 'Kucing bisa mendengar suara 4 kali lebih jauh daripada manusia!'
  },
  // 5. MATEMATIKA - SD AWAL
  {
    id: 'mat-awal-1',
    category: 'matematika',
    ageGroup: 'sd-awal',
    title: 'Timbangan Hewan Cerdik',
    instruction: 'Lihat keseimbangan timbangan hewan!',
    question: '1 Gajah beratnya sama dengan 2 Kuda Nil. 1 Kuda Nil beratnya sama dengan 3 Kambing. Maka 1 Gajah sama beratnya dengan berapa Kambing?',
    visualHint: '1 Gajah = 2 Kuda Nil | 1 Kuda Nil = 3 Kambing',
    options: ['5 Kambing', '6 Kambing', '8 Kambing', '4 Kambing'],
    correctIndex: 1,
    explanation: 'Keren! 1 Gajah = 2 Kuda Nil. Karena 1 Kuda Nil = 3 Kambing, maka 2 × 3 = 6 Kambing!',
    points: 15,
    funFact: 'Kemampuan substitusi ini adalah dasar aljabar matematika yang dipelajari astronot!'
  },
  // 6. BAHASA - SD AWAL
  {
    id: 'bah-awal-1',
    category: 'bahasa',
    ageGroup: 'sd-awal',
    title: 'Teka-Teki Benda Misterius',
    instruction: 'Tebak aku siapakah aku!',
    question: 'Aku punya leher tapi tidak punya kepala. Aku punya badan dan bisa diisi air hangat maupun dingin. Siapakah aku?',
    options: ['Baju Kaos', 'Botol Minum', 'Jam Dinding', 'Sepatu'],
    correctIndex: 1,
    explanation: 'Tepat sekali! Botol memiliki bagian leher (bottle neck) dan badan untuk menampung air.',
    points: 15,
    funFact: 'Teka-teki analogi kata merangsang bagian kiri dan kanan otak bekerja bersamaan!'
  },
  // 7. VISUAL & SPASIAL - PAUD
  {
    id: 'vis-paud-1',
    category: 'visual',
    ageGroup: 'paud',
    title: 'Mencari Pasangan Bayangan',
    instruction: 'Benda apa yang bentuknya bundar seperti bola?',
    question: 'Benda mana di bawah ini yang bentuknya sama dengan Matahari di langit?',
    options: ['Jeruk manis 🍊', 'Buku tulis 📘', 'Kotak pensil 📦', 'Penggaris segitiga 📐'],
    correctIndex: 0,
    explanation: 'Hebat! Jeruk manis berbentuk bulat lingkaran, persis seperti Matahari!',
    points: 10,
    funFact: 'Mengenal bentuk geometri di alam sekitar melatih imajinasi spasial anak sejak dini.'
  },
  // 8. EMOSIONAL & EQ - SD AWAL & SEMUA
  {
    id: 'emo-awal-1',
    category: 'emosi',
    ageGroup: 'sd-awal',
    title: 'Sahabat yang Sedang Bersedih',
    instruction: 'Pilihlah tindakan terbaik yang penuh empati dan kasih sayang.',
    storyPrompt: 'Saat jam istirahat, kamu melihat teman sekelasmu duduk sendirian di sudut dan menunduk karena bekal makanannya jatuh tidak sengaja.',
    question: 'Sikap cerdas dan bijak apa yang sebaiknya kamu lakukan?',
    options: [
      'Menertawakannya bersama teman-teman yang lain',
      'Mendekatinya, menghibur, dan membagikan sedikit bekal makananmu kepadanya',
      'Pura-pura tidak melihat dan langsung pergi bermain bola',
      'Memarahinya karena kurang berhati-hati saat memegang bekal'
    ],
    correctIndex: 1,
    explanation: 'Hati yang mulia! Anak yang cerdas emosional (EQ tinggi) tahu cara peduli dan berbagi kebahagiaan kepada sesama teman.',
    points: 20,
    funFact: 'Kecerdasan emosional (EQ) terbukti 80% menentukan kesuksesan hidup seseorang di masa depan!'
  },
  // 9. FOKUS & KONSENTRASI - SD ATAS
  {
    id: 'fok-atas-1',
    category: 'fokus',
    ageGroup: 'sd-atas',
    title: 'Tantangan Fokus Kata & Warna',
    instruction: 'Konsentrasi penuh! Bacalah pertanyaannya dengan sangat teliti!',
    question: 'Berapa banyak huruf "A" dalam kalimat: "AZKAYRA ANAK PINTAR DAN CERDAS JUARA KELAS"?',
    options: ['8 huruf', '9 huruf', '10 huruf', '7 huruf'],
    correctIndex: 1,
    explanation: 'Luar biasa teliti! Mari kita hitung bersama: AzkAyra (2) AnAk (2) PintAr (1) dAn (1) CerdAs (1) JuArA (2) = Total ada 9 huruf A!',
    points: 20,
    funFact: 'Latihan menghitung fokus huruf meningkatkan kecepatan membaca dan konsentrasi (working memory)!'
  }
];

// Memory Game Cards
interface MemoryCard {
  id: number;
  symbol: string;
  label: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export const KecerdasanAnak: React.FC = () => {
  // State Profile & Filter
  const [childName, setChildName] = useState<string>('Azkayra');
  const [selectedAge, setSelectedAge] = useState<AgeGroup>('sd-awal');
  const [selectedCategory, setSelectedCategory] = useState<IntelligenceCategory | 'semua'>('semua');
  const [activeTab, setActiveTab] = useState<'latihan' | 'memory-game' | 'generator-ai' | 'worksheet' | 'sertifikat'>('latihan');

  // Interactive Challenges State
  const [challenges, setChallenges] = useState<ChallengeItem[]>(BUILT_IN_CHALLENGES);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);

  // Memory Game State
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState<number>(0);
  const [memoryMatches, setMemoryMatches] = useState<number>(0);
  const [isMemoryWon, setIsMemoryWon] = useState<boolean>(false);

  // AI Generator Custom Topic
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Filtered challenges list
  const filteredChallenges = challenges.filter(c => {
    const matchAge = c.ageGroup === selectedAge;
    const matchCat = selectedCategory === 'semua' ? true : c.category === selectedCategory;
    return matchAge && matchCat;
  });

  const activeChallenge = filteredChallenges[currentIdx % (filteredChallenges.length || 1)] || challenges[0];

  // Inisialisasi Memory Cards saat beralih ke tab memory
  const initMemoryGame = () => {
    const rawPairs = [
      { symbol: '🦁', label: 'Singa Berani' },
      { symbol: '🚀', label: 'Roket Angkasa' },
      { symbol: '🌟', label: 'Bintang Emas' },
      { symbol: '🐬', label: 'Lumba-lumba' },
      { symbol: '🎨', label: 'Kuas Seni' },
      { symbol: '🧩', label: 'Puzzle Otak' },
    ];

    const cards: MemoryCard[] = [];
    rawPairs.forEach((item, idx) => {
      // Pasangan 1
      cards.push({
        id: idx * 2,
        symbol: item.symbol,
        label: item.label,
        pairId: idx,
        isFlipped: false,
        isMatched: false
      });
      // Pasangan 2
      cards.push({
        id: idx * 2 + 1,
        symbol: item.symbol,
        label: item.label,
        pairId: idx,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle acak
    cards.sort(() => Math.random() - 0.5);
    setMemoryCards(cards);
    setFlippedCardIds([]);
    setMemoryMoves(0);
    setMemoryMatches(0);
    setIsMemoryWon(false);
  };

  useEffect(() => {
    if (activeTab === 'memory-game') {
      initMemoryGame();
    }
  }, [activeTab]);

  // Handle Memory Card Click
  const handleCardClick = (cardId: number) => {
    if (flippedCardIds.length >= 2) return;
    const clickedCard = memoryCards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip card
    const updatedCards = memoryCards.map(c => c.id === cardId ? { ...c, isFlipped: true } : c);
    const newFlipped = [...flippedCardIds, cardId];
    setMemoryCards(updatedCards);
    setFlippedCardIds(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const card1 = updatedCards.find(c => c.id === newFlipped[0]);
      const card2 = updatedCards.find(c => c.id === newFlipped[1]);

      if (card1 && card2 && card1.pairId === card2.pairId) {
        // Cocok!
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c => 
            c.pairId === card1.pairId ? { ...c, isMatched: true } : c
          ));
          setMemoryMatches(prev => {
            const nextMatch = prev + 1;
            if (nextMatch === 6) {
              setIsMemoryWon(true);
              setTotalScore(s => s + 50);
              setStars(st => st + 3);
            }
            return nextMatch;
          });
          setFlippedCardIds([]);
        }, 500);
      } else {
        // Tidak cocok, tutup kembali
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c => 
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCardIds([]);
        }, 1000);
      }
    }
  };

  // Text-To-Speech Narasi Suara Ramah Anak
  const speakText = (text: string) => {
    if (!isVoiceActive || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/gi, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95; // Kecepatan bicara pas dan ramah
      utterance.pitch = 1.1; // Nada ceria bersahabat
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS gagal:", e);
    }
  };

  // Kirim Jawaban Soal
  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    setShowExplanation(true);

    const isCorrect = selectedAnswer === activeChallenge.correctIndex;
    if (isCorrect) {
      setTotalScore(prev => prev + activeChallenge.points);
      setStars(prev => prev + 1);
      setStreak(prev => prev + 1);
      speakText(`Hebat sekali ${childName}! Jawabanmu benar! ` + activeChallenge.explanation);
    } else {
      setStreak(0);
      speakText(`Kurang tepat sedikit, ${childName}. Tapi tidak apa-apa! ` + activeChallenge.explanation);
    }
  };

  const handleNextChallenge = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setShowExplanation(false);
    setCurrentIdx(prev => prev + 1);
  };

  // Helper untuk membuat tantangan tematik cerdas secara instan jika offline atau server AI sedang antre
  const createThematicChallenges = (topic: string, age: AgeGroup): ChallengeItem[] => {
    const cleanTopic = topic.trim() || 'Petualangan & Teka-Teki Cilik';
    const lower = cleanTopic.toLowerCase();

    if (lower.includes('detektif') || lower.includes('misteri')) {
      return [
        {
          id: `detektif-${Date.now()}-1`,
          category: 'logika',
          ageGroup: age,
          title: 'Misteri Jejak Kaki di Taman Rahasia',
          instruction: 'Gunakan ketelitianmu sebagai detektif cilik!',
          storyPrompt: 'Detektif cilik menemukan 3 jejak kaki di dekat pagar: Jejak Kucing (kecil bulat), Jejak Burung (tiga cakar tipis), dan Jejak Sepatu Bot.',
          question: 'Jika tidak ada lumpur yang terinjak bot, tapi ada bulu halus terjatuh di rumput, siapakah yang baru saja lewat?',
          visualHint: '🐾 👣 🪶 ❓',
          options: ['Kucing Berbulu Lembut', 'Burung Merpati', 'Orang bersepatu bot', 'Robot mainan'],
          correctIndex: 0,
          explanation: 'Analisis cerdik! Jejak kucing dan bulu halus membuktikan kucinglah yang lewat dengan langkah lembut tanpa suara.',
          points: 20,
          funFact: 'Kucing berjalan dengan cara menginjakkan kaki belakang tepat di bekas jejak kaki depannya!'
        },
        {
          id: `detektif-${Date.now()}-2`,
          category: 'matematika',
          ageGroup: age,
          title: 'Membuka Kode Brankas Rahasia',
          instruction: 'Pecahkan deret angka sandi rahasia!',
          storyPrompt: 'Di pintu brankas tertera petunjuk angka: 2, 4, 6, 8, lalu angka berapa untuk membuka gembok?',
          question: 'Angka berapakah yang tepat untuk membuka gembok brankas detektif?',
          visualHint: '2 ➔ 4 ➔ 6 ➔ 8 ➔ ❓',
          options: ['9', '10', '11', '12'],
          correctIndex: 1,
          explanation: 'Tepat sekali! Polanya adalah melompat +2 (angka genap). Setelah 8 adalah 10!',
          points: 20,
          funFact: 'Pola angka genap adalah salah satu sandi enkripsi tertua di dunia yang dipelajari detektif!'
        },
        {
          id: `detektif-${Date.now()}-3`,
          category: 'visual',
          ageGroup: age,
          title: 'Kaca Pembesar & Bayangan Kunci',
          instruction: 'Perhatikan ciri-ciri kunci emas rahasia!',
          question: 'Kunci manakah yang memiliki 3 gerigi di ujung dan lingkaran bundar di pangkalnya?',
          options: [
            'Kunci A: Ujung bergigi 3 & pegangan bundar',
            'Kunci B: Ujung bergigi 2 & pegangan segitiga',
            'Kunci C: Ujung lurus tanpa gigi & pegangan kotak',
            'Kunci D: Kunci plastik mainan tanpa gerigi'
          ],
          correctIndex: 0,
          explanation: 'Mata elang yang jeli! Kunci A memiliki ciri gerigi 3 dan bentuk bundar persis sesuai petunjuk.',
          points: 20,
          funFact: 'Setiap lekukan kunci di dunia memiliki kombinasi unik layaknya sidik jari manusia!'
        },
        {
          id: `detektif-${Date.now()}-4`,
          category: 'emosi',
          ageGroup: age,
          title: 'Kejujuran Sang Detektif Cilik',
          instruction: 'Detektif sejati selalu menjunjung tinggi kejujuran dan kebaikan.',
          storyPrompt: 'Saat mencari jejak, kamu tidak sengaja menemukan dompet temanmu yang tertinggal di bawah pohon berisi uang saku dan kartu nama.',
          question: 'Apa tindakan terbaik yang mencerminkan detektif berintegritas tinggi?',
          options: [
            'Mengambil uangnya lalu membuang dompetnya ke semak',
            'Segera mengembalikan dompet secara utuh kepada teman dan memberitahunya dengan sopan',
            'Menyimpannya diam-diam di saku celana',
            'Pura-pura tidak tahu dan meninggalkan dompet begitu saja'
          ],
          correctIndex: 1,
          explanation: 'Luar biasa mulia! Kejujuran dan empati adalah kualitas terpenting seorang penyelidik sejati.',
          points: 25,
          funFact: 'Anak yang jujur dan dapat dipercaya disukai banyak sahabat dan selalu menjadi pemimpin teladan!'
        }
      ];
    } else if (lower.includes('dino')) {
      return [
        {
          id: `dino-${Date.now()}-1`,
          category: 'logika',
          ageGroup: age,
          title: 'Teka-Teki Makanan Dinosaurus',
          instruction: 'Tebak jenis dinosaurus dari makanannya!',
          question: 'Brachiosaurus memiliki leher sangat panjang setinggi pohon kelapa. Makanan apa yang paling mudah dijangkaunya?',
          visualHint: '🦕 🌳 🍃',
          options: ['Daun pucuk pohon tinggi 🌿', 'Ikan di dasar samudera 🐟', 'Cacing di bawah tanah', 'Es kutub utara ❄️'],
          correctIndex: 0,
          explanation: 'Tepat sekali! Leher panjang Brachiosaurus berevolusi khusus untuk memakan pucuk daun di pohon-pohon purba yang tinggi.',
          points: 20,
          funFact: 'Panjang leher Brachiosaurus bisa mencapai 9 meter lebih panjang dari bus sekolah!'
        },
        {
          id: `dino-${Date.now()}-2`,
          category: 'matematika',
          ageGroup: age,
          title: 'Menghitung Jejak Fosil Dinosaurus',
          instruction: 'Hitung jejak kaki di sarang purba!',
          question: 'Ada 2 ekor Triceratops sedang berjalan. Setiap Triceratops memiliki 4 kaki. Berapa total jejak kaki mereka?',
          visualHint: '4 Kaki + 4 Kaki = ❓',
          options: ['6 Kaki', '8 Kaki', '10 Kaki', '12 Kaki'],
          correctIndex: 1,
          explanation: 'Cerdas! 2 ekor Triceratops × 4 kaki = 8 jejak kaki.',
          points: 20,
          funFact: 'Triceratops memiliki tiga tanduk kuat di kepalanya untuk melindungi diri dari T-Rex!'
        },
        {
          id: `dino-${Date.now()}-3`,
          category: 'fokus',
          ageGroup: age,
          title: 'Mengamati Fosil Tersembunyi',
          instruction: 'Fokuskan pandanganmu!',
          question: 'Dinosaurus manakah yang memiliki sirip lempeng seperti tameng di sepanjang punggungnya?',
          options: ['Stegosaurus 🦖', 'Pterodactyl (Pterosaurus)', 'Megalodon', 'Velociraptor'],
          correctIndex: 0,
          explanation: 'Benar! Stegosaurus terkenal dengan deretan lempeng tulang segi lima di sepanjang tulang belakangnya.',
          points: 20,
          funFact: 'Meskipun bertubuh raksasa seberat gajah, otak Stegosaurus hanya seukuran buah kenari kecil!'
        },
        {
          id: `dino-${Date.now()}-4`,
          category: 'emosi',
          ageGroup: age,
          title: 'Merawat Alam & Hewan Purba',
          instruction: 'Belajar dari kepunahan dinosaurus di masa lalu.',
          question: 'Bagaimana cara kita sebagai manusia menjaga hewan-hewan yang hidup di bumi saat ini agar tidak punah seperti dinosaurus?',
          options: [
            'Menjaga kelestarian hutan, tidak merusak alam, dan menyayangi binatang 🌳🐾',
            'Menebangi semua pohon di bumi',
            'Membuang sampah plastik ke laut dan sungai',
            'Memburu hewan langka sembarangan'
          ],
          correctIndex: 0,
          explanation: 'Sikap yang bijaksana! Menjaga kelestarian alam adalah tanggung jawab kita agar bumi tetap hijau dan hewan terlindungi.',
          points: 25,
          funFact: 'Burung-burung modern yang kita lihat hari ini adalah keturunan terdekat dari dinosaurus pemakan daging!'
        }
      ];
    } else {
      // Template umum cerdas adaptif
      return [
        {
          id: `kustom-${Date.now()}-1`,
          category: 'logika',
          ageGroup: age,
          title: `Teka-Teki Logika: ${cleanTopic}`,
          instruction: `Pecahkan teka-teki bertema ${cleanTopic} ini dengan nalar cerdas!`,
          storyPrompt: `Di dunia petualangan ${cleanTopic}, kamu menghadapi sebuah pintu rintangan yang membutuhkan kunci logika.`,
          question: `Jika kamu ingin menjelajahi ${cleanTopic} dengan sukses, hal terpenting apa yang harus kamu siapkan terlebih dahulu?`,
          visualHint: `✨ 🧭 💡 🎯`,
          options: [
            'Rencana yang matang, fokus, dan rasa ingin tahu 💡',
            'Bermalas-malasan tanpa persiapan apa pun',
            'Menyerah sebelum mencoba',
            'Menutup mata dan berjalan sembarangan'
          ],
          correctIndex: 0,
          explanation: `Luar biasa, ${childName}! Pikiran yang fokus dan penuh rasa ingin tahu adalah kunci menaklukkan ${cleanTopic}.`,
          points: 20,
          funFact: `Otak kita membuat jalur neuron baru setiap kali kita mempelajari topik baru seperti ${cleanTopic}!`
        },
        {
          id: `kustom-${Date.now()}-2`,
          category: 'matematika',
          ageGroup: age,
          title: `Hitung Cepat ${cleanTopic}`,
          instruction: 'Latih kemampuan berhitung dan estimasi cepatmu!',
          question: `Kamu mengumpulkan 5 bintang energi di level pertama, lalu mendapat 3 bintang lagi di level kedua. Berapa total bintang energimu sekarang?`,
          visualHint: '⭐ ⭐ ⭐ ⭐ ⭐  +  ⭐ ⭐ ⭐ = ❓',
          options: ['7 Bintang', '8 Bintang', '9 Bintang', '10 Bintang'],
          correctIndex: 1,
          explanation: 'Hebat! 5 ditambah 3 adalah 8. Kamu mengumpulkan 8 bintang energi berkilau!',
          points: 20,
          funFact: 'Anak yang sering berlatih penjumlahan visual memiliki kemampuan problem-solving 40% lebih cepat!'
        },
        {
          id: `kustom-${Date.now()}-3`,
          category: 'bahasa',
          ageGroup: age,
          title: `Riddle & Tebak Kata: ${cleanTopic}`,
          instruction: 'Tebak arti dan kosakata misterius berikut!',
          question: `Kata manakah di bawah ini yang memiliki arti paling dekat dengan kata "CERDAS"?`,
          options: ['Pintar dan Cerdik 🧠', 'Lambat dan Mengantuk', 'Bingung dan Ragu', 'Takut mencoba'],
          correctIndex: 0,
          explanation: 'Tepat sekali! Cerdas berarti pandai, cerdik, tajam pikiran, dan bersemangat memecahkan masalah.',
          points: 20,
          funFact: 'Kecerdasan bukanlah hal yang tetap, melainkan otot pikiran yang semakin kuat jika terus dilatih!'
        },
        {
          id: `kustom-${Date.now()}-4`,
          category: 'emosi',
          ageGroup: age,
          title: `Karakter Tangguh dalam ${cleanTopic}`,
          instruction: 'Pilihlah sikap terbaik seorang juara sejati!',
          question: `Ketika kamu mencoba tantangan sulit dalam ${cleanTopic} dan belum berhasil pada percobaan pertama, apa yang sebaiknya kamu lakukan?`,
          options: [
            'Tersenyum, belajar dari kesalahan, dan mencoba lagi dengan semangat baru! 💪✨',
            'Menangis dan melempar buku',
            'Marah-marah kepada teman',
            'Berhenti belajar selamanya'
          ],
          correctIndex: 0,
          explanation: 'Itulah mental juara sejati! Kesalahan adalah tangga menuju kepintaran yang lebih tinggi.',
          points: 25,
          funFact: 'Thomas Alva Edison mencoba lebih dari 1.000 kali sebelum akhirnya berhasil menyalakan bola lampu pertama di dunia!'
        }
      ];
    }
  };

  // Generate Tantangan Baru dengan AI Gemini + Auto Fallback Cerdas
  const handleGenerateAiChallenges = async (forceInstant = false) => {
    setIsGeneratingAi(true);
    setAiError(null);

    // Jika dipaksa instan atau pengguna klik tombol offline
    if (forceInstant) {
      const instantItems = createThematicChallenges(customTopic, selectedAge);
      setChallenges(prev => [...instantItems, ...prev]);
      setActiveTab('latihan');
      setCurrentIdx(0);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setIsGeneratingAi(false);
      speakText(`Hore! Paket tantangan cerdas untuk topik ${customTopic || 'Asah Otak'} sudah siap untuk ${childName}! Mari kita coba!`);
      return;
    }

    const promptText = `Anda adalah Spesialis Pendidikan Anak, Psikolog Anak, dan Master Game Asah Otak Kecerdasan Anak.
Buatkan 4 tantangan asah otak interaktif untuk anak berusia tingkat ${selectedAge} (${selectedAge === 'paud' ? 'usia 3-6 tahun, sangat visual, sederhana, ceria' : selectedAge === 'sd-awal' ? 'usia 7-9 tahun, logika dasar, hitung seru, teka-teki' : 'usia 10-12 tahun, penalaran kritis, problem solving HOTS'}).
${customTopic ? `Topik Khusus yang disukai anak: "${customTopic}".` : 'Campuran topik alam, petualangan, hewan, dan kehidupan sehari-hari.'}

Berikan output HANYA dalam format JSON valid (tanpa markdown tambahan, tanpa komentar) dengan struktur:
[
  {
    "id": "ai-${Date.now()}-1",
    "category": "logika",
    "ageGroup": "${selectedAge}",
    "title": "Judul Menarik",
    "instruction": "Instruksi seru bagi anak",
    "storyPrompt": "Cerita pengantar pendek (opsional)",
    "question": "Pertanyaan tantangan",
    "visualHint": "Emoji atau simbol visual petunjuk",
    "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
    "correctIndex": 0,
    "explanation": "Penjelasan mengapa jawaban tersebut benar dengan bahasa hangat & memotivasi anak",
    "points": 20,
    "funFact": "Fakta unik menyenangkan yang menambah wawasan anak"
  }
]`;

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          systemPrompt: 'Berikan respon dalam JSON murni yang valid tanpa format markdown penutup ```.',
          isJson: true
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Server AI sedang ramai');
      }

      let parsed: ChallengeItem[] = [];
      const cleanJson = (data.text || '').replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setChallenges(prev => [...parsed, ...prev]);
        setActiveTab('latihan');
        setCurrentIdx(0);
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        speakText(`Hore! Guru AI sudah membuatkan tantangan baru spesial untuk ${childName}! Mari kita coba!`);
      } else {
        throw new Error("Format respon AI belum sesuai");
      }
    } catch (err: any) {
      console.warn("AI generation failed or high demand. Providing smart fallback:", err);
      // Format pesan ramah
      const errMsg = err?.message || '';
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('lonjakan')) {
        setAiError('Server Google AI sedang mengalami antrean padat sementara.');
      } else {
        setAiError('Koneksi ke server AI terganggu.');
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Cetak Worksheet atau Sertifikat
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 text-slate-100">
      
      {/* 1. HERO HEADER: ARENA KECERDASAN ANAK */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 p-6 md:p-8 text-white shadow-2xl no-print">
        <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
          <Brain size={260} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} className="text-yellow-200 animate-spin" />
              <span>Modul Khusus: Asah Otak & Kecerdasan Anak</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm">
              Taman Asah Otak & Logika Cilik 🧠✨
            </h1>
            
            <p className="text-orange-50 text-sm font-medium leading-relaxed">
              Melatih logika deduktif, memori visual, pemecahan masalah (HOTS), matematika seru, dan kecerdasan emosional anak dengan metode bermain interaktif.
            </p>

            {/* Input Nama Anak & Badge Skor */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20">
                <Smile size={16} className="text-amber-200" />
                <span className="text-xs font-bold text-amber-100">Nama Juara:</span>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value || 'Juara')}
                  placeholder="Nama Anak..."
                  className="bg-white/20 text-white font-black text-xs px-2 py-1 rounded-lg outline-none w-28 border border-white/30 focus:border-white"
                />
              </div>

              <div className="flex items-center gap-3 bg-black/25 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/20 text-xs font-black">
                <div className="flex items-center gap-1 text-yellow-300">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span>{stars} Bintang</span>
                </div>
                <div className="h-3 w-px bg-white/30"></div>
                <div className="flex items-center gap-1 text-amber-200">
                  <Trophy size={16} className="text-yellow-300" />
                  <span>{totalScore} Poin</span>
                </div>
                {streak > 1 && (
                  <>
                    <div className="h-3 w-px bg-white/30"></div>
                    <div className="flex items-center gap-1 text-rose-200">
                      <Flame size={16} className="text-yellow-300 fill-yellow-300" />
                      <span>{streak}x Beruntun!</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pengaturan Cepat Suara & Mode Usia */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 space-y-2">
              <p className="text-[11px] font-black uppercase text-amber-200 tracking-wider">Pilih Kelompok Usia:</p>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                <button
                  onClick={() => { setSelectedAge('paud'); setCurrentIdx(0); }}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    selectedAge === 'paud'
                      ? 'bg-white text-orange-600 shadow-md font-black scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  🐣 3-6 Thn
                </button>
                <button
                  onClick={() => { setSelectedAge('sd-awal'); setCurrentIdx(0); }}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    selectedAge === 'sd-awal'
                      ? 'bg-white text-orange-600 shadow-md font-black scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  🚀 7-9 Thn
                </button>
                <button
                  onClick={() => { setSelectedAge('sd-atas'); setCurrentIdx(0); }}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    selectedAge === 'sd-atas'
                      ? 'bg-white text-orange-600 shadow-md font-black scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  🏆 10-12 Thn
                </button>
              </div>

              {/* Toggle Audio Speech */}
              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="font-semibold text-white/90">Suara Narasi AI:</span>
                <button
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  className={`p-1.5 rounded-xl flex items-center gap-1 font-bold text-[11px] transition-all cursor-pointer ${
                    isVoiceActive ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white/70'
                  }`}
                >
                  {isVoiceActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span>{isVoiceActive ? 'Aktif' : 'Mati'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGASI MODUL KECERDASAN */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-print">
        {[
          { id: 'latihan', label: 'Tantangan Interaktif', icon: <Play size={16} /> },
          { id: 'memory-game', label: 'Game Memori Kartu', icon: <Puzzle size={16} />, badge: 'Game Seru' },
          { id: 'generator-ai', label: 'Tantangan Baru (AI)', icon: <Sparkles size={16} />, badge: 'Gemini AI' },
          { id: 'worksheet', label: 'Worksheet Cetak (A4)', icon: <Printer size={16} /> },
          { id: 'sertifikat', label: 'Sertifikat Prestasi', icon: <Award size={16} />, badge: 'Penghargaan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                activeTab === tab.id ? 'bg-black/30 text-yellow-200' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TANTANGAN INTERAKTIF DI LAYAR                                      */}
      {/* ========================================================================= */}
      {activeTab === 'latihan' && (
        <div className="space-y-5">
          {/* Filter Kategori Kecerdasan */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide text-xs font-bold no-print">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 mr-1">Fokus Asah:</span>
            {[
              { id: 'semua', label: 'Semua Kategori', icon: '🌈' },
              { id: 'logika', label: 'Logika & Masalah', icon: '🧩' },
              { id: 'matematika', label: 'Matematika Visual', icon: '🔢' },
              { id: 'bahasa', label: 'Bahasa & Kata', icon: '💬' },
              { id: 'visual', label: 'Visual & Spasial', icon: '👁️' },
              { id: 'emosi', label: 'Empati & EQ', icon: '💖' },
              { id: 'fokus', label: 'Fokus & Memori', icon: '⚡' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id as any); setCurrentIdx(0); }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Kartu Soal Interaktif */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Top Bar Kartu */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                  #{(currentIdx % (filteredChallenges.length || 1)) + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase">
                      Kategori: {activeChallenge.category.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      Tingkat: {activeChallenge.ageGroup === 'paud' ? 'PAUD/TK' : activeChallenge.ageGroup === 'sd-awal' ? 'SD Kelas 1-3' : 'SD Kelas 4-6'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">{activeChallenge.title}</h3>
                </div>
              </div>

              {/* Tombol Suara Soal */}
              <button
                onClick={() => speakText(`${activeChallenge.title}. ${activeChallenge.storyPrompt || ''} ${activeChallenge.question}`)}
                className="p-3 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-2xl border border-slate-800 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shadow"
                title="Dengarkan soal dibacakan"
              >
                <Volume2 size={16} />
                <span className="hidden sm:inline">Bacakan Soal</span>
              </button>
            </div>

            {/* Story Prompt & Visual Hint */}
            {activeChallenge.storyPrompt && (
              <div className="p-4 bg-gradient-to-r from-amber-950/30 to-slate-900 rounded-2xl border border-amber-500/20 text-amber-200 text-xs font-medium flex items-start gap-3">
                <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed"><strong>Kisah:</strong> {activeChallenge.storyPrompt}</p>
              </div>
            )}

            {/* Visual Hint Box */}
            {activeChallenge.visualHint && (
              <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Petunjuk Visual:</p>
                <div className="text-3xl md:text-4xl tracking-widest font-black py-2">
                  {activeChallenge.visualHint}
                </div>
              </div>
            )}

            {/* Main Question */}
            <div className="space-y-2">
              <p className="text-xs text-indigo-400 uppercase font-black tracking-wider">Pertanyaan:</p>
              <h2 className="text-lg md:text-xl font-black text-white leading-snug">
                {activeChallenge.question}
              </h2>
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {activeChallenge.options.map((option, oIdx) => {
                const isSelected = selectedAnswer === oIdx;
                const isCorrectOption = oIdx === activeChallenge.correctIndex;
                
                let btnStyle = 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-800';
                if (isSelected && !isAnswerSubmitted) {
                  btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/30 font-black';
                } else if (isAnswerSubmitted) {
                  if (isCorrectOption) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 font-black';
                  } else if (isSelected && !isCorrectOption) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30 font-black';
                  } else {
                    btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    disabled={isAnswerSubmitted}
                    className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer shadow-sm ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs shrink-0 text-slate-300">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswerSubmitted && isCorrectOption && (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrectOption && (
                      <XCircle size={18} className="text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions: Submit or Next */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span>Hadiah Tantangan: <strong className="text-amber-400">+{activeChallenge.points} Poin</strong> & ⭐ 1 Bintang</span>
              </div>

              <div className="flex items-center gap-3">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <Check size={16} /> Kunci Jawaban
                  </button>
                ) : (
                  <button
                    onClick={handleNextChallenge}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider animate-bounce"
                  >
                    <span>Lanjut Tantangan Berikutnya</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Explanation & Fun Fact Banner */}
            {showExplanation && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  {selectedAnswer === activeChallenge.correctIndex ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                      <Sparkles size={18} />
                      <span>KERJA BAGUS SEKALI, {childName.toUpperCase()}! 🎉</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                      <HelpCircle size={18} />
                      <span>PANTANG MENYERAH! INI DIA RAHASIANYA:</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {activeChallenge.explanation}
                </p>

                {activeChallenge.funFact && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 flex items-start gap-2">
                    <Lightbulb size={14} className="shrink-0 mt-0.5 text-amber-400" />
                    <span><strong>Tahukah Kamu?</strong> {activeChallenge.funFact}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GAME MEMORI KARTU VISUAL                                           */}
      {/* ========================================================================= */}
      {activeTab === 'memory-game' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                    <Puzzle size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-white">Permainan Memori & Fokus Visual</h3>
                    <p className="text-xs text-slate-400">Balik dan pasangkan 2 kartu dengan gambar yang sama!</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Langkah: <strong className="text-amber-300">{memoryMoves}</strong></p>
                  <p className="text-xs font-black text-emerald-400">Cocok: {memoryMatches} / 6 Pasang</p>
                </div>
                <button
                  onClick={initMemoryGame}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} /> Kocok Ulang
                </button>
              </div>
            </div>

            {/* Victory Banner */}
            {isMemoryWon && (
              <div className="p-6 bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border border-emerald-500/50 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
                <Trophy size={48} className="mx-auto text-yellow-300 animate-bounce" />
                <h3 className="text-xl font-black text-white">SELAMAT {childName.toUpperCase()}! MEMORIMU SANGAT TAJAM! 🎉</h3>
                <p className="text-xs text-emerald-200">Kamu berhasil menemukan semua pasangan kartu hanya dalam {memoryMoves} langkah. +50 Poin & ⭐ 3 Bintang ditambahkan!</p>
                <button
                  onClick={initMemoryGame}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw size={14} /> Main Sekali Lagi!
                </button>
              </div>
            )}

            {/* Card Grid 4x3 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
              {memoryCards.map((card) => {
                const isRevealed = card.isFlipped || card.isMatched;

                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    disabled={card.isMatched || card.isFlipped}
                    className={`aspect-square rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-2 cursor-pointer select-none shadow-md ${
                      card.isMatched
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 scale-95 opacity-80'
                        : isRevealed
                        ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border-amber-400 text-white shadow-amber-400/20 shadow-lg scale-105'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-700 hover:border-slate-500 text-slate-400'
                    }`}
                  >
                    {isRevealed ? (
                      <div className="text-center space-y-1 animate-in zoom-in-50 duration-200">
                        <span className="text-3xl md:text-4xl block">{card.symbol}</span>
                        <span className="text-[9px] font-bold block truncate max-w-[70px] text-amber-200">
                          {card.label}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <Brain size={24} className="mx-auto text-slate-600" />
                        <span className="text-[10px] font-black text-slate-500 tracking-wider">OTAK</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GENERATOR TANTANGAN KECERDASAN BARU DENGAN AI GEMINI               */}
      {/* ========================================================================= */}
      {activeTab === 'generator-ai' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase">
                <Sparkles size={14} className="text-amber-400" />
                <span>Gemini AI Engine Khusus Anak</span>
              </div>
              <h3 className="text-xl font-black text-white">Generate Teka-Teki & Asah Otak Kustom</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Ingin teka-teki logika tentang Dinosaurus, Luar Angkasa, Petualangan Hewan, atau Sains? Masukkan topik kesukaan anak, dan AI akan merancang tantangan seru secara instan!
              </p>
            </div>

            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Topik Favorit Anak (Opsional):
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Contoh: Petualangan Antariksa, Dinosaurus T-Rex, Laut Dalam, Detektif Rahasia..."
                  className="w-full bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-700 outline-none text-xs focus:border-amber-500 transition-all font-medium placeholder:text-slate-500"
                />
              </div>

              {/* Pilihan Cepat Topik Populer */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-400">Ide Cepat:</span>
                {[
                  '🦕 Dinosaurus & Fosil',
                  '🚀 Astronot & Tata Surya',
                  '🦁 Hewan Rimba Tropis',
                  '🕵️ Misteri Detektif Cilik',
                  '🍫 Kue & Masakan Seru',
                  '⚽ Olahraga & Ketangkasan'
                ].map((tag, tIdx) => (
                  <button
                    key={tIdx}
                    onClick={() => setCustomTopic(tag.substring(2).trim())}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {aiError && (
                <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-200 text-xs space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Sparkles size={16} className="text-yellow-400" />
                    <span>{aiError}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Jangan khawatir! Kamu tetap bisa langsung bermain dengan <strong>Paket Tantangan Logika Cerdas</strong> yang telah dirancang khusus untuk topik <em>"{customTopic || 'Misteri & Petualangan Cilik'}"</em> tanpa perlu menunggu antrean server.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleGenerateAiChallenges(true)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                    >
                      <Zap size={14} /> Mainkan Paket Cerdas Ini Sekarang
                    </button>
                    <button
                      onClick={() => handleGenerateAiChallenges(false)}
                      disabled={isGeneratingAi}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw size={14} className={isGeneratingAi ? 'animate-spin' : ''} /> Coba Hubungi AI Sekali Lagi
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleGenerateAiChallenges(false)}
                  disabled={isGeneratingAi}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <RefreshCw size={16} className={isGeneratingAi ? 'animate-spin' : ''} />
                  <span>{isGeneratingAi ? 'Guru AI Sedang Merancang Teka-teki...' : '✨ Buat 4 Tantangan Baru dengan AI'}</span>
                </button>

                <button
                  onClick={() => handleGenerateAiChallenges(true)}
                  disabled={isGeneratingAi}
                  className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-black text-xs rounded-2xl transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                  title="Langsung hasilkan paket teka-teki logika kustom tanpa menunggu antrean AI"
                >
                  <Zap size={15} className="text-yellow-400" />
                  <span>Buat Instan (Anti-Macet)</span>
                </button>
              </div>
            </div>

            {/* Penjelasan Edukatif Untuk Orang Tua / Guru */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                <p className="font-bold text-amber-400">💡 Bebas Frustrasi</p>
                <p className="text-slate-400 leading-relaxed">Tingkat kesulitan diatur sesuai usia, dilengkapi petunjuk visual dan penjelasan ramah.</p>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                <p className="font-bold text-emerald-400">🎯 HOTS Terintegrasi</p>
                <p className="text-slate-400 leading-relaxed">Merangsang berpikir kritis tingkat tinggi (C4-C6) sejak usia dini tanpa terasa menggurui.</p>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                <p className="font-bold text-indigo-400">🌟 Penguatan Positif</p>
                <p className="text-slate-400 leading-relaxed">Sistem reward bintang, poin, dan fun-fact memicu rasa penasaran alami anak.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WORKSHEET & LEMBAR KERJA CETAK (A4 READY)                          */}
      {/* ========================================================================= */}
      {activeTab === 'worksheet' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-slate-950 p-5 rounded-2xl border border-slate-800 no-print">
            <div>
              <h3 className="text-sm font-black text-white">Lembar Kerja Asah Otak Siap Cetak (A4)</h3>
              <p className="text-xs text-slate-400">Dapat diprint langsung untuk latihan mandiri anak di rumah atau kelas.</p>
            </div>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Printer size={16} /> Cetak Lembar Ini
            </button>
          </div>

          {/* Printable Worksheet Body */}
          <div className="bg-white text-black p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0 space-y-6">
            {/* Header Kop */}
            <div className="border-b-2 border-black pb-4 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">SMART TUTOR - MODUL KECERDASAN ANAK</p>
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-950">
                  LEMBAR LATIHAN & ASAH LOGIKA CILIK
                </h1>
                <p className="text-xs font-bold text-indigo-900 mt-1">
                  Kategori: Logika, Matematika Visual, Bahasa & Konsentrasi
                </p>
              </div>
              <div className="text-right text-xs font-semibold text-slate-800">
                <p>Tingkat: <strong>{selectedAge === 'paud' ? 'PAUD / TK (3-6 Thn)' : selectedAge === 'sd-awal' ? 'SD Kelas 1-3' : 'SD Kelas 4-6'}</strong></p>
                <p>Tanggal Latihan: <strong>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
              </div>
            </div>

            {/* Identitas Siswa Box */}
            <div className="grid grid-cols-2 gap-4 p-3 border-2 border-dashed border-slate-400 rounded-xl text-xs font-semibold">
              <p>Nama Lengkap Anak: <strong>{childName}</strong></p>
              <p>Nilai / Bintang Guru: ⭐⭐⭐⭐⭐</p>
            </div>

            {/* Petunjuk Pengerjaan */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs space-y-1">
              <strong className="text-slate-900 uppercase">📌 Petunjuk untuk Ayah/Bunda/Guru:</strong>
              <p className="text-slate-700">Ajak anak membaca soal secara santai dan ceria. Biarkan anak berpikir mandiri sebelum memberikan petunjuk.</p>
            </div>

            {/* Soal-Soal Lembar Kerja */}
            <div className="space-y-6 pt-2">
              {filteredChallenges.slice(0, 6).map((item, idx) => (
                <div key={item.id} className="p-4 border border-slate-300 rounded-2xl space-y-3 print-avoid-break">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-xs uppercase px-2.5 py-0.5 bg-slate-100 rounded-md">
                      Tantangan {idx + 1}: {item.title}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">
                      Kategori: {item.category}
                    </span>
                  </div>

                  {item.storyPrompt && (
                    <p className="text-xs italic text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                      "{item.storyPrompt}"
                    </p>
                  )}

                  {item.visualHint && (
                    <div className="p-2.5 text-center bg-slate-50 rounded-xl font-bold text-base tracking-widest border border-slate-200">
                      {item.visualHint}
                    </div>
                  )}

                  <p className="text-sm font-black text-slate-900">{item.question}</p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    {item.options.map((opt, oIdx) => (
                      <div key={oIdx} className="p-2 border border-slate-300 rounded-xl flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center font-bold text-[10px]">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="font-medium text-slate-800">{opt}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-[10px] text-slate-500 flex justify-between">
                    <span>Ruang Catatan Anak / Coretan: ..............................................................</span>
                    <span>Paraf Orang Tua: ( ____________ )</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Signature Bottom */}
            <div className="hidden print:grid grid-cols-2 pt-8 text-center text-xs">
              <div>
                <p>Orang Tua / Wali,</p>
                <div className="h-16"></div>
                <p className="font-bold underline">( ........................................ )</p>
              </div>
              <div>
                <p>Anak Juara Logika,</p>
                <div className="h-16"></div>
                <p className="font-bold underline">( {childName} )</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SERTIFIKAT PRESTASI BINTANG KECERDASAN (PRINTABLE)                 */}
      {/* ========================================================================= */}
      {activeTab === 'sertifikat' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-950 p-5 rounded-2xl border border-slate-800 no-print">
            <div>
              <h3 className="text-sm font-black text-white">Sertifikat Penghargaan Anak Cerdas</h3>
              <p className="text-xs text-slate-400">Berikan apresiasi dan motivasi nyata untuk kebanggaan anak atas prestasinya.</p>
            </div>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Printer size={16} /> Cetak Sertifikat Emas
            </button>
          </div>

          {/* Sertifikat Visual Emas */}
          <div className="p-8 md:p-14 bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-3xl border-8 border-double border-amber-600 text-slate-900 shadow-2xl text-center space-y-6 relative overflow-hidden print:m-0 print:border-8">
            <div className="absolute top-4 left-4 text-amber-500 opacity-20"><Brain size={120} /></div>
            <div className="absolute bottom-4 right-4 text-amber-500 opacity-20"><Trophy size={120} /></div>

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-black uppercase tracking-widest">
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <span>SERTIFIKAT PENGHARGAAN RESMI</span>
                <Star size={16} className="fill-amber-500 text-amber-500" />
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-black tracking-wide text-amber-900 uppercase">
                BINTANG KECERDASAN CILIK
              </h1>

              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">DIBERIKAN DENGAN BANGGA KEPADA:</p>

              <div className="py-2">
                <h2 className="text-2xl md:text-4xl font-black text-indigo-950 underline decoration-amber-500 decoration-wavy uppercase tracking-wide">
                  {childName || "JUARA KEBANGGAAN"}
                </h2>
              </div>

              <p className="text-sm md:text-base font-medium text-slate-700 max-w-xl mx-auto leading-relaxed">
                Atas dedikasi, ketajaman logika, rasa ingin tahu yang tinggi, serta keberhasilan menyelesaikan rangkaian tantangan asah otak dan pemecahan masalah dengan pencapaian gemilang.
              </p>

              {/* Box Skor */}
              <div className="flex justify-center items-center gap-6 py-4">
                <div className="px-6 py-2 bg-amber-100 rounded-2xl border border-amber-300">
                  <p className="text-[10px] font-black uppercase text-amber-800">Total Bintang</p>
                  <p className="text-2xl font-black text-amber-900">⭐ {stars > 0 ? stars : 5} Bintang</p>
                </div>
                <div className="px-6 py-2 bg-indigo-50 rounded-2xl border border-indigo-200">
                  <p className="text-[10px] font-black uppercase text-indigo-800">Skor Prestasi</p>
                  <p className="text-2xl font-black text-indigo-950">{totalScore > 0 ? totalScore : 100} Poin</p>
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 pt-8 text-xs font-semibold">
                <div>
                  <p>Diberikan pada tanggal:</p>
                  <p className="font-bold mt-1">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <div className="h-14"></div>
                  <p className="font-black text-slate-900 underline">( Pembina Edukasi AI )</p>
                </div>
                <div>
                  <p>Mengetahui & Membanggakan:</p>
                  <p className="font-bold mt-1">Orang Tua / Pendidik</p>
                  <div className="h-14"></div>
                  <p className="font-black text-slate-900 underline">( ........................................ )</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
