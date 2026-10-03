import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  Clock,
  MessageCircle,
  Users,
  Target,
  FileDown,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Layers,
  HelpCircle,
  Sparkle,
  RefreshCw,
  Copy,
  Check,
  Compass,
  Smile,
  ShieldCheck,
  BrainCircuit,
  Settings
} from 'lucide-react';

export interface TeachingStep {
  id: string;
  nomorUrut: number;
  judulFase: string;
  alokasiMenit: string;
  tujuanLangkah: string;
  aksiGuru: string[];
  skripDialogGuru: string;
  aktivitasSiswa: string[];
  mediaDanAlat: string[];
  tipsDiferensiasi: {
    siswaButuhBimbingan: string;
    siswaMahir: string;
  };
  pertanyaanPemantikGuru: string[];
  antisipasiMasalah: {
    kendala: string;
    solusiPraktis: string;
  };
}

export interface TeachingGuideData {
  topik: string;
  mataPelajaran: string;
  kelas: string;
  modelPembelajaran: string;
  alokasiWaktuTotal: string;
  ringkasanStrategi: string;
  
  kegiatanAwal: {
    alokasiWaktu: string;
    tujuan: string;
    langkahDetail: Array<{
      tahap: string;
      skripGuru: string;
      aktivitasSiswa: string;
      tipsManajemen: string;
    }>;
    iceBreakingSingkat?: {
      nama: string;
      instruksi: string;
      manfaat: string;
    };
    internalisasiKBC: string;
  };
  
  kegiatanInti: {
    namaModel: string;
    alokasiWaktu: string;
    penjelasanSintaks: string;
    faseLangkah: TeachingStep[];
  };
  
  kegiatanPenutup: {
    alokasiWaktu: string;
    tujuan: string;
    langkahDetail: Array<{
      tahap: string;
      skripGuru: string;
      aktivitasSiswa: string;
      panduanRefleksi: string[];
    }>;
    pesanInspiratif: string;
  };

  checklistKesiapanGuru: string[];
  tipsGuruSpesial: string[];
}

interface PanduanMengajarProps {
  generatedRPP: string | null;
  formData: {
    namaSekolah: string;
    mataPelajaran: string;
    kelas: string;
    topik: string;
    alokasiWaktu: string;
    modelPembelajaran: { tipe: string; manual: string; hasil: string };
    cp: { tipe: string; manual: string; hasil: string };
    tp: { tipe: string; manual: string; hasil: string };
    kesiapanMurid: {
      pengetahuan: string;
      fisik: string;
      mental: string;
      sosial: string;
      spiritual: string;
      asesmen: string;
      hasilKesimpulan: string;
    };
    dimensiProfil: { tipe: string; selected: string[] };
    topikPancaCinta: { tipe: string; selected: string; hasil: string };
    materiIntegrasiKBC: string;
    titiMangsa: {
      tempat: string;
      tanggal: string;
      guru: string;
      kepala: string;
    };
  };
  onNavigateToRPPSetup: () => void;
  onNavigateToRPPDocument: () => void;
  onNavigateToInteractiveClass: () => void;
  callGemini: (
    prompt: string, 
    systemPrompt?: string, 
    useSearch?: boolean, 
    imageData?: string | null, 
    history?: any[], 
    isJson?: boolean
  ) => Promise<string>;
}

export const PanduanMengajar: React.FC<PanduanMengajarProps> = ({
  generatedRPP,
  formData,
  onNavigateToRPPSetup,
  onNavigateToRPPDocument,
  onNavigateToInteractiveClass,
  callGemini
}) => {
  const [guideData, setGuideData] = useState<TeachingGuideData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'awal' | 'inti' | 'penutup' | 'tips'>('all');
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
    'awal': true,
    'step-1': true,
    'step-2': true,
    'step-3': true,
    'step-4': true,
    'step-5': true,
    'penutup': true,
    'tips': true
  });
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [aiIdeaPrompt, setAiIdeaPrompt] = useState<string | null>(null);
  const [aiIdeaResult, setAiIdeaResult] = useState<string | null>(null);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

  // Model name resolver
  const getModelName = () => {
    if (formData.modelPembelajaran.tipe === 'otomatis') {
      return formData.modelPembelajaran.hasil || "Problem Based Learning (PBL)";
    }
    return formData.modelPembelajaran.manual || "Pembelajaran Aktif & Berdiferensiasi";
  };

  // Helper copy to clipboard
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptId(id);
    setTimeout(() => setCopiedScriptId(null), 2000);
  };

  const toggleStep = (id: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // PARSER CERDAS RPP: Membaca skenario konkret yang sudah dirumuskan AI di dokumen RPP
  interface ParsedPhase {
    num: number;
    title: string;
    description: string;
    quotes: string[];
    guruActivities: string[];
    muridActivities: string[];
  }

  interface ParsedRPPData {
    tpList: string[];
    apersepsiRaw: string;
    apersepsiAction: string;
    apersepsiQuestion: string;
    kbcConnection: string;
    intiPhases: ParsedPhase[];
    allQuotes: string[];
    penutupRefleksi: string;
    penutupKbc: string;
  }

  const parseRPPContent = (rppText: string | null): ParsedRPPData | null => {
    if (!rppText) return null;
    const clean = rppText.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');

    // 1. Ekstrak Butir-Butir TP Operasional
    const tpList: string[] = [];
    const tpMatch = clean.match(/(?:Tujuan Pembelajaran|TP|ATP)[^:\n]*:([\s\S]*?)(?=(?:\d+\.\s*Kerangka|Kerangka Pembelajaran|<b>|\n[A-Z]\.|$))/i);
    if (tpMatch) {
      const lines = tpMatch[1].split('\n').map(l => l.trim()).filter(l => l.length > 0);
      for (const line of lines) {
        if (/^\d+[\.\)]\s*/.test(line)) {
          tpList.push(line.replace(/^\d+[\.\)]\s*/, '').trim());
        } else if (/^[-*•]\s*/.test(line)) {
          tpList.push(line.replace(/^[-*•]\s*/, '').trim());
        } else if (line.length > 10 && !line.startsWith('3.') && !line.startsWith('C.') && !line.startsWith('4.')) {
          tpList.push(line);
        }
      }
    }

    // Ekstrak semua kutipan berharga dalam dokumen (misal: "Surat Cinta untuk Pohon")
    const allQuotes: string[] = [];
    const qReg = /"([^"]+)"/g;
    let qM;
    while ((qM = qReg.exec(clean)) !== null) {
      if (!allQuotes.includes(qM[1])) allQuotes.push(qM[1]);
    }

    // 2. Ekstrak Kegiatan Awal (Apersepsi, Stimulus, & KBC)
    let apersepsiRaw = '';
    let apersepsiAction = '';
    let apersepsiQuestion = '';
    let kbcConnection = '';

    const awalMatch = clean.match(/1\.\s*Kegiatan Awal\s*:?([\s\S]*?)(?=2\.\s*Kegiatan Inti|$)/i);
    if (awalMatch) {
      const block = awalMatch[1];
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const apLine = lines.find(l => /apersepsi/i.test(l)) || lines.find(l => /(?:tanya|tunjukkan|bawa|stimulus|mengamati)/i.test(l));
      if (apLine) {
        apersepsiRaw = apLine.replace(/^[-*•\d\.\s]+/, '').replace(/^Apersepsi\s*:?\s*/i, '').trim();

        // Cari tanda petik ucapan tanya
        const quoteMatch = apersepsiRaw.match(/"([^"]+)"/);
        if (quoteMatch) {
          apersepsiQuestion = quoteMatch[1];
          apersepsiAction = apersepsiRaw.split('"')[0].replace(/Guru\s+/i, '').replace(/dan bertanya,?\s*$/i, '').trim();
        } else {
          apersepsiAction = apersepsiRaw;
        }

        // Cari tanda kurung koneksi spiritual / KBC
        const parenMatch = apersepsiRaw.match(/\(([^)]+)\)/);
        if (parenMatch) {
          kbcConnection = parenMatch[1];
        }
      }
    }

    // 3. Ekstrak Langkah Kegiatan Inti (Secara Akurat Membedah Sintaks & Aktivitas Riil)
    const intiPhases: ParsedPhase[] = [];
    const intiMatch = clean.match(/2\.\s*Kegiatan Inti\s*:?([\s\S]*?)(?=3\.\s*Kegiatan Penutup|$)/i);
    if (intiMatch) {
      const block = intiMatch[1];
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let currentPhase: ParsedPhase | null = null;

      for (const line of lines) {
        // Deteksi header langkah/fase, misal:
        // - Tahap 5: Merumuskan Kesimpulan. Kelompok menyusun "Surat Cinta untuk Pohon"...
        // - Fase 1: Orientasi ...
        // - Langkah 2: ...
        const headerMatch = line.match(/^(?:[-*•\d\.\s]*)(?:(?:Fase|Tahap|Langkah|Sintaks)\s*(\d+)|(\d+)\.)\s*[:\.\-]?\s*([^:\.\n]+(?:[:\.]|\s|$))/i);
        const isPhaseHeader = headerMatch && !/^(?:aktivitas|peran|tugas|kegiatan)\s*(?:guru|murid)/i.test(line);

        if (isPhaseHeader) {
          if (currentPhase) intiPhases.push(currentPhase);
          
          const rawNum = parseInt(headerMatch[1] || headerMatch[2], 10) || (intiPhases.length + 1);
          const rawTitle = headerMatch[3].replace(/[:\.]+$/, '').trim();
          
          const headerLength = headerMatch[0].length;
          const lineRest = line.substring(headerLength).trim();

          const quotes: string[] = [];
          const quoteRegex = /"([^"]+)"/g;
          let q;
          while ((q = quoteRegex.exec(line)) !== null) {
            quotes.push(q[1]);
          }

          const muridActs: string[] = [];
          const guruActs: string[] = [];
          if (lineRest) {
            if (/guru/i.test(lineRest)) {
              guruActs.push(lineRest);
            } else {
              muridActs.push(lineRest);
            }
          }

          currentPhase = {
            num: rawNum,
            title: rawTitle,
            description: lineRest || rawTitle,
            quotes,
            guruActivities: guruActs,
            muridActivities: muridActs
          };
        } else if (currentPhase) {
          const quoteRegex = /"([^"]+)"/g;
          let q;
          while ((q = quoteRegex.exec(line)) !== null) {
            if (!currentPhase.quotes.includes(q[1])) currentPhase.quotes.push(q[1]);
          }

          if (/guru/i.test(line)) {
            currentPhase.guruActivities.push(line.replace(/^[-*•\d\.\s]+/, '').trim());
          } else if (/murid|siswa|kelompok/i.test(line)) {
            currentPhase.muridActivities.push(line.replace(/^[-*•\d\.\s]+/, '').trim());
          } else if (line.length > 10) {
            currentPhase.muridActivities.push(line.replace(/^[-*•\d\.\s]+/, '').trim());
          }
        }
      }
      if (currentPhase) intiPhases.push(currentPhase);
    }

    // 4. Ekstrak Penutup (Refleksi & Penguatan KBC)
    let penutupRefleksi = '';
    let penutupKbc = '';
    const penutupMatch = clean.match(/3\.\s*Kegiatan Penutup\s*:?([\s\S]*?)(?=$)/i);
    if (penutupMatch) {
      const lines = penutupMatch[1].split('\n').map(l => l.trim()).filter(l => l.length > 0);
      for (const l of lines) {
        if (/refleksi/i.test(l) && !penutupRefleksi) {
          penutupRefleksi = l.replace(/^[-*•\d\.\s]+/, '').replace(/^Refleksi\s*:?\s*/i, '').trim();
        }
        if (/(?:kbc|cinta|nilai|akhlak)/i.test(l) && !penutupKbc) {
          penutupKbc = l.replace(/^[-*•\d\.\s]+/, '').replace(/^Penguatan\s*:?\s*/i, '').trim();
        }
      }
    }

    return {
      tpList,
      apersepsiRaw,
      apersepsiAction,
      apersepsiQuestion,
      kbcConnection,
      intiPhases,
      allQuotes,
      penutupRefleksi,
      penutupKbc
    };
  };

  // SMART FALLBACK GENERATOR: Deep, rich teaching guide created instantly from RPP & metadata
  const buildSmartFallbackGuide = (): TeachingGuideData => {
    const topik = formData.topik || "Pembelajaran Tematik & Karakter";
    const mapel = formData.mataPelajaran || "Mata Pelajaran";
    const kelas = formData.kelas || "1";
    const model = getModelName();
    const kbc = formData.topikPancaCinta.selected || formData.topikPancaCinta.hasil || "Cinta Sesama & Cinta Lingkungan";

    // Parse RPP text to strictly synchronize with what was actually generated in RPP
    const parsedRPP = parseRPPContent(generatedRPP);

    // Standardize phases based on pedagogical model
    let steps: TeachingStep[] = [];
    if (model.toLowerCase().includes("project") || model.toLowerCase().includes("pjbl")) {
      steps = [
        {
          id: "step-1",
          nomorUrut: 1,
          judulFase: "Fase 1: Penentuan Pertanyaan Mendasar (Start with Essential Question)",
          alokasiMenit: "8 Menit",
          tujuanLangkah: "Mengarahkan perhatian siswa pada sebuah masalah riil di sekitar mereka yang memerlukan karya/proyek untuk dipecahkan.",
          aksiGuru: [
            "Menampilkan gambar/benda/cerita pemicu yang berkaitan dengan materi " + topik + ".",
            "Mengajukan pertanyaan pemantik mendasar yang menantang rasa ingin tahu siswa.",
            "Meminta siswa mengamati dan memberikan tanggapan awal secara terbuka tanpa menyalahkan."
          ],
          skripDialogGuru: `"Anak-anak hebat kelas ${kelas}, coba lihat apa yang Ibu/Bapak guru pegang hari ini! Pernahkah kalian menemui masalah ini di rumah atau lingkungan sekitar kita? Kira-kira karya atau kreasi apa ya yang bisa kita buat bersama agar masalah ini terselesaikan?"`,
          aktivitasSiswa: [
            "Mengamati stimulus yang disajikan guru dengan antusias.",
            "Mengemukakan ide awal tentang proyek yang ingin dibuat.",
            "Menyepakati tantangan karya bersama teman sekelas."
          ],
          mediaDanAlat: ["Gambar/benda nyata pemicu", "Papan tulis/proyektor", "Lembar ide awal"],
          tipsDiferensiasi: {
            siswaButuhBimbingan: "Beri pilihan 2 opsi karya konkret agar tidak bingung mencari ide sendiri.",
            siswaMahir: "Minta mereka memikirkan 1 fitur unik tambahan pada proyek yang akan dibuat."
          },
          pertanyaanPemantikGuru: [
            `"Mengapa menurut kalian topik ${topik} ini sangat penting bagi kehidupan kita?"`,
            `"Bagaimana perasaan kalian jika kita bisa membuat karya yang bermanfaat untuk orang lain?"`
          ],
          antisipasiMasalah: {
            kendala: "Siswa mengusulkan ide proyek yang terlalu rumit atau sulit diselesaikan dalam 1 sesi.",
            solusiPraktis: "Arahkan kembali pada batasan bahan sederhana yang sudah disiapkan di kelas: 'Ide kalian luar biasa! Hari ini kita buat versi purwarupa (prototype) sederhananya dulu ya!'"
          }
        },
        {
          id: "step-2",
          nomorUrut: 2,
          judulFase: "Fase 2: Mendesain Perencanaan Proyek (Design a Plan for the Project)",
          alokasiMenit: "12 Menit",
          tujuanLangkah: "Mengorganisir siswa dalam tim kolaboratif untuk menentukan alat, bahan, dan pembagian peran kerja.",
          aksiGuru: [
            "Membagi kelas ke dalam kelompok kecil heterogen (3-4 siswa) dengan penuh kehangatan.",
            "Membagikan LKPD Panduan Proyek dan menjelaskan aturan main kerjasama yang adil.",
            "Memastikan setiap anggota memiliki peran: ketua, pengambil bahan, juru catat, dan juru bicara."
          ],
          skripDialogGuru: `"Sekarang silakan duduk bersama kelompok hebat masing-masing. Ingat prinsip Karakter Cinta Kasih: di kelompok kita saling mendengar dan berbagi peran. Siapa yang hari ini siap jadi juru gambar atau juru bicara?"`,
          aktivitasSiswa: [
            "Berkumpul bersama kelompok secara tertib.",
            "Membagi tugas masing-masing anggota secara musyawarah.",
            "Mengecek kelengkapan bahan proyek di atas meja kelompok."
          ],
          mediaDanAlat: ["LKPD Perencanaan Proyek", "Kertas kerja kelompok", "Spidol warna-warni"],
          tipsDiferensiasi: {
            siswaButuhBimbingan: "Dampingi kelompok secara langsung saat membagi peran agar tidak ada yang merasa tersisih.",
            siswaMahir: "Tugaskan siswa mahir menjadi fasilitator rekan sebaya (peer tutor) yang suportif."
          },
          pertanyaanPemantikGuru: [
            `"Apa langkah pertama yang harus tim kalian selesaikan sebelum mulai merakit?"`,
            `"Bagaimana cara membagi tugas agar semua teman ikut berkontribusi?"`
          ],
          antisipasiMasalah: {
            kendala: "Terjadi perebutan peran atau ada anak yang ingin bekerja sendiri.",
            solusiPraktis: "Gunakan kartu peran bergambar (Badge Peran). Tekankan bahwa karya terbaik lahir dari kerjasama tim yang rukun."
          }
        },
        {
          id: "step-3",
          nomorUrut: 3,
          judulFase: "Fase 3: Menyusun Jadwal & Eksekusi Pembuatan Proyek (Create a Schedule & Execute)",
          alokasiMenit: "20 Menit",
          tujuanLangkah: "Memandu siswa dalam proses pengerjaan karya secara terstruktur dengan manajemen waktu yang baik.",
          aksiGuru: [
            "Menetapkan target waktu: 'Kita punya 20 menit untuk menyelesaikan karya ini bersama!'.",
            "Berkeliling ke setiap meja kelompok untuk mengamati proses, memberikan motivasi, dan scaffolding.",
            "Mencatat perkembangan kinerja dan sikap kerjasama siswa pada lembar observasi."
          ],
          skripDialogGuru: `"Wah, kelompok 2 rapi sekali kerjanya! Kelompok 1, ada bagian yang perlu bantuan Ibu/Bapak guru? Jangan ragu bertanya ya. Waktu tersisa 10 menit lagi, pastikan karya kalian siap ditampilkan!"`,
          aktivitasSiswa: [
            "Bekerja sama merakit, menggambar, atau menyusun produk proyek sesuai rencana.",
            "Berdiskusi dan saling membantu ketika menemui kesulitan dalam merakit materi.",
            "Memeriksa hasil karya sebelum waktu pembuatan berakhir."
          ],
          mediaDanAlat: ["Bahan proyek nyata", "Gunting/lem (jika ada)", "LKPD panduan langkah"],
          tipsDiferensiasi: {
            siswaButuhBimbingan: "Beri contoh perakitan 1 langkah demi langkah secara perlahan di meja mereka.",
            siswaMahir: "Ajak mereka merapikan presentasi atau menambahkan penjelasan konsep pada produk mereka."
          },
          pertanyaanPemantikGuru: [
            `"Bagian mana dari karya kalian yang paling menunjukkan pemahaman tentang ${topik}?"`,
            `"Apakah semua anggota kelompok sudah mencoba memegang dan mengerjakan bagian karyanya?"`
          ],
          antisipasiMasalah: {
            kendala: "Ada kelompok yang bekerja terlalu lambat dan berpotensi tidak selesai tepat waktu.",
            solusiPraktis: "Beri bantuan langsung pada bagian teknis yang tersendat, fokuskan pada konten inti konsep tanpa harus sempurna di hiasan luar."
          }
        },
        {
          id: "step-4",
          nomorUrut: 4,
          judulFase: "Fase 4: Menguji Hasil & Mempresentasikan Proyek (Assess the Outcome)",
          alokasiMenit: "12 Menit",
          tujuanLangkah: "Memberikan panggung bagi siswa untuk mengkomunikasikan hasil karya mereka dan menguji keberhasilan konsep.",
          aksiGuru: [
            "Mengundang perwakilan kelompok memajang karya di depan atau metode 'Gallery Walk' (pameran karya).",
            "Memimpin tepuk tangan apresiasi untuk setiap penampilan kelompok.",
            "Mengajak audiens memberikan apresiasi positif dan umpan balik yang membangun."
          ],
          skripDialogGuru: `"Beri tepuk tangan meriah untuk Kelompok 1! Coba ceritakan kepada teman-teman, bagaimana karya kalian ini bekerja dan apa pesan penting tentang ${topik} yang ingin kalian sampaikan?"`,
          aktivitasSiswa: [
            "Menunjukkan dan mempresentasikan produk hasil karya dengan percaya diri.",
            "Kelompok lain menyimak dan memberikan tepuk tangan atau bintang apresiasi.",
            "Menjawab pertanyaan sederhana dari guru atau teman sebaya."
          ],
          mediaDanAlat: ["Meja pameran hasil karya", "Stiker bintang apresiasi", "Papan display"],
          tipsDiferensiasi: {
            siswaButuhBimbingan: "Dampingi berdiri di samping siswa saat bicara di depan kelas, ajukan pertanyaan pemancing singkat jika mereka malu.",
            siswaMahir: "Dorong mereka untuk menguraikan alasan logis di balik pemilihan desain proyek mereka."
          },
          pertanyaanPemantikGuru: [
            `"Apa hal paling membanggakan dari proyek yang telah kalian selesaikan ini?"`,
            `"Jika punya waktu lebih banyak, bagian mana yang ingin kalian sempurnakan lagi?"`
          ],
          antisipasiMasalah: {
            kendala: "Siswa menertawakan jika ada kelompok yang karyanya belum sempurna atau terjatuh.",
            solusiPraktis: "Ingatkan seketika nilai Karakter Cinta: 'Di kelas kita, setiap usaha dan keberanian tampil adalah hal yang sangat mulia! Semua karya teman adalah hebat!'"
          }
        },
        {
          id: "step-5",
          nomorUrut: 5,
          judulFase: "Fase 5: Mengevaluasi Pengalaman Belajar (Evaluate the Experience)",
          alokasiMenit: "8 Menit",
          tujuanLangkah: "Membantu siswa merefleksikan proses kerja sama, mengatasi kesulitan, dan mengikat konsep ilmiah yang dipelajari.",
          aksiGuru: [
            "Memfasilitasi siswa mengungkapkan perasaan selama proses pembuatan proyek.",
            "Menyimpulkan bersama konsep-konsep kunci materi " + topik + " yang telah dipraktikkan.",
            "Memberikan penguatan menyeluruh dan meluruskan miskonsepsi jika ada."
          ],
          skripDialogGuru: `"Luar biasa anak-anakku! Hari ini kalian bukan hanya belajar teori tentang ${topik}, tetapi kalian membuktikan sendiri dengan membuat karya nyata. Apa pelajaran paling berharga dari kerjasama tim kalian tadi?"`,
          aktivitasSiswa: [
            "Menyampaikan refleksi tentang apa yang dirasakan mudah dan menantang.",
            "Mencatat kesimpulan konsep utama materi pada buku tulis masing-masing.",
            "Menerima umpan balik penguatan dari guru dengan senang."
          ],
          mediaDanAlat: ["Catatan refleksi", "Papan tulis rangkuman konsep"],
          tipsDiferensiasi: {
            siswaButuhBimbingan: "Beri penguatan bahwa kesalahan dalam proses adalah bagian terbaik dari belajar.",
            siswaMahir: "Minta mereka merumuskan 1 kesimpulan umum yang berlaku untuk situasi lain di luar kelas."
          },
          pertanyaanPemantikGuru: [
            `"Bagaimana perasaan kalian setelah melihat proyek kalian berhasil diselesaikan bersama?"`,
            `"Apa yang akan kalian terapkan di rumah setelah belajar topik ini hari ini?"`
          ],
          antisipasiMasalah: {
            kendala: "Siswa hanya fokus pada kesenangan fisik membuat karya tanpa memahami konsep keilmuannya.",
            solusiPraktis: "Tanyakan langsung keterkaitan ilmiahnya: 'Nah, mengapa karya tadi bisa bekerja seperti itu? Konsep materi apa yang ada di dalamnya?'"
          }
        }
      ];
    } else {
      // Default: Problem Based Learning (PBL) & Active Learning Syntax
      steps = [
        {
          id: "step-1",
          nomorUrut: 1,
          judulFase: "Fase 1: Orientasi Peserta Didik pada Masalah (Problem Orientation)",
          alokasiMenit: "10 Menit",
          tujuanLangkah: "Membangun rasa ingin tahu murid terhadap masalah nyata yang dihadapi dalam topik materi " + topik + ".",
          aksiGuru: [
            "Menampilkan fenomena nyata (gambar, cerita pendek, atau video singkat) yang memuat teka-teki/masalah.",
            "Mengajukan pertanyaan pemantik kontekstual yang relevan dengan kehidupan anak sehari-hari.",
            "Mencatat respon awal murid di papan tulis untuk melihat pemahaman awal mereka."
          ],
          skripDialogGuru: `"Anak-anak hebat kelas ${kelas}, mari kita amati bersama gambar di layar ini. Coba perhatikan baik-baik, keanehan apa yang kalian lihat? Menurut kalian, mengapa hal ini bisa terjadi? Siapa yang punya dugaan awal?"`,
          aktivitasSiswa: [
            "Memusatkan perhatian pada stimulus yang disajikan guru.",
            "Mengangkat tangan dan menyampaikan dugaan awal secara aktif.",
            "Mengidentifikasi hal yang ingin mereka ketahui lebih lanjut tentang " + topik + "."
          ],
          mediaDanAlat: ["Gambar stimulus kontekstual / Cerita masalah", "Papan tulis & spidol", "LKPD orientasi"],
          tipsDiferensiasi: {
            siswaButuhBimbingan: "Ajukan pertanyaan dengan petunjuk pilihan (Contoh: 'Apakah A atau B?') agar mereka berani menjawab.",
            siswaMahir: "Minta mereka memprediksi akibat jika masalah tersebut tidak segera diselesaikan."
          },
          pertanyaanPemantikGuru: [
            `"Pernahkah kalian melihat atau mengalami peristiwa serupa di lingkungan kalian?"`,
            `"Apa yang akan terjadi jika kita membiarkan masalah ini begitu saja?"`
          ],
          antisipasiMasalah: {
            kendala: "Siswa menjawab melenceng jauh dari topik materi.",
            solusiPraktis: "Apresiasi keberanian bicaranya: 'Jawaban yang menarik sekali! Nah, bagaimana kalau jawaban itu kita hubungkan dengan topik kita hari ini, yaitu...'"
          }
        },
        {
          id: "step-2",
          nomorUrut: 2,
          judulFase: "Fase 2: Mengorganisasikan Peserta Didik untuk Belajar (Organizing for Learning)",
          alokasiMenit: "8 Menit",
          tujuanLangkah: "Membentuk kelompok kerja kooperatif dan memastikan setiap murid memahami tugas penyelidikan pada LKPD.",
          aksiGuru: [
            "Membagi murid ke dalam kelompok kecil heterogen (3-4 orang) dengan pembagian yang adil dan inklusif.",
            "Membagikan LKPD/Bahan Ajar dan menjelaskan instruksi pengerjaan secara jelas per langkah.",
            "Memastikan semua murid dalam kelompok tahu apa peran dan target yang harus diselesaikan."
          ],
          skripDialogGuru: `"Sekarang, silakan bergabung dengan teman satu kelompok dengan tenang dan tertib. Setiap kelompok akan menjadi Tim Detektif Cilik untuk memecahkan misteri topik ${topik}. Buka LKPD halaman 1, mari kita baca petunjuknya bersama-sama!"`,
          aktivitasSiswa: [
            "Berpindah tempat duduk menuju kelompok dengan tertib.",
            "Menerima LKPD dan menyimak petunjuk guru.",
            "Menentukan pembagian tugas dalam kelompok (pencatat, pembaca, penanya)."
          ],
          mediaDanAlat: ["LKPD kelompok", "Kartu peran detektif", "Alat tulis"],
          tipsDiferensiasi: {
            siswaButuhBimbingan: "Tempatkan di kelompok dengan teman sebaya yang sabar dan suka membantu.",
            siswaMahir: "Beri peran sebagai 'Kapten Diskusi' yang bertugas memastikan semua teman ikut berpendapat."
          },
          pertanyaanPemantikGuru: [
            `"Apakah semua anggota kelompok sudah memegang alat tulis dan mengerti tugasnya?"`,
            `"Langkah mana dari LKPD yang paling menantang untuk diselesaikan duluan?"`
          ],
          antisipasiMasalah: {
            kendala: "Kegaduhan saat pergeseran meja dan penolakan teman kelompok.",
            solusiPraktis: "Gunakan hitungan mundur ceria: 'Dalam hitungan ke-5, semua detektif sudah duduk manis bersama timnya. 5, 4, 3, 2, 1! Hebat semuanya!'"
          }
        },
        {
          id: "step-3",
          nomorUrut: 3,
          judulFase: "Fase 3: Membimbing Penyelidikan Mandiri & Kelompok (Guiding Investigation)",
          alokasiMenit: "18 Menit",
          tujuanLangkah: "Mendampingi murid mencari data, mempraktikkan pengamatan, dan mendiskusikan solusi atas masalah materi.",
          aksiGuru: [
            "Berkeliling ke setiap kelompok secara berkala (keliling aktif).",
            "Mengamati proses berpikir siswa, memberikan pertanyaan penuntun (scaffolding) tanpa langsung memberi jawaban jadi.",
            "Mengingatkan kerjasama yang rukun dan saling menghargai pendapat teman."
          ],
          skripDialogGuru: `"Kelompok 3 sedang membahas apa? Coba periksa petunjuk di nomor 2. Menurut kalian, apa alasan hal itu terjadi? Coba cocokkan dengan kartu konsep yang ada di meja!"`,
          aktivitasSiswa: [
            "Melakukan pengamatan, membaca bahan ajar, atau mencocokkan kartu konsep.",
            "Berdiskusi dan bertukar argumen dengan teman kelompok secara santun.",
            "Menuliskan hasil temuan dan kesimpulan sementara pada lembar LKPD."
          ],
          mediaDanAlat: ["Kartu data/konsep", "Buku pegangan siswa", "LKPD diskusi kelompok"],
          tipsDiferensiasi: {
            siswaButuhBimbingan: "Guru duduk sejajar beberapa menit di meja kelompok, memandu membaca kalimat kunci satu per satu.",
            siswaMahir: "Tantang mereka menemukan contoh penerapan konsep di bidang lain."
          },
          pertanyaanPemantikGuru: [
            `"Dari mana kalian tahu bahwa jawaban ini benar? Apa buktinya di bahan ajar?"`,
            `"Jika kondisinya diubah, apakah hasilnya akan tetap sama?"`
          ],
          antisipasiMasalah: {
            kendala: "Hanya satu anak yang aktif menulis dan berpikir, anak lain melamun atau pasif.",
            solusiPraktis: "Minta bergantian memegang LKPD: 'Bagus sekali! Sekarang giliran teman sebelahmu yang membacakan pertanyaan berikutnya ya!'"
          }
        },
        {
          id: "step-4",
          nomorUrut: 4,
          judulFase: "Fase 4: Mengembangkan & Menyajikan Hasil Karya (Developing & Presenting)",
          alokasiMenit: "12 Menit",
          tujuanLangkah: "Melatih keberanian komunikasi murid dalam menyajikan hasil temuan diskusi kelompok di depan kelas.",
          aksiGuru: [
            "Memandu sesi presentasi kelompok dengan suasana yang menyenangkan dan suportif.",
            "Mengajak audiens menyimak dengan aturan: 'Ketika teman bicara, kita pasang telinga dan tutup mulut'.",
            "Memberikan penguatan dan pujian tulus pada poin-poin tepat yang disampaikan kelompok."
          ],
          skripDialogGuru: `"Mari kita sambut Tim Detektif 1 yang akan memaparkan hasil penyelidikan mereka! Beri tepuk salut untuk kelompok 1! Silakan bacakan temuan kalian dengan suara lantang dan jelas ya!"`,
          aktivitasSiswa: [
            "Perwakilan kelompok maju ke depan dengan percaya diri membacakan hasil LKPD.",
            "Kelompok lain mendengarkan dengan seksama dan memberikan respon jempol/bintang.",
            "Menjawab pertanyaan klarifikasi sederhana dari teman atau guru."
          ],
          mediaDanAlat: ["LKPD yang telah diisi", "Papan pameran kelas", "Format apresiasi teman"],
          tipsDiferensiasi: {
            siswaButuhBimbingan: "Boleh maju berpasangan dengan teman terdekatnya agar merasa aman dan tidak gugup.",
            siswaMahir: "Latih mereka merangkum inti presentasi dalam 1 kalimat padat dan jelas."
          },
          pertanyaanPemantikGuru: [
            `"Apakah kelompok lain memiliki jawaban atau cara pandang yang berbeda dengan Kelompok 1?"`,
            `"Bagian mana dari penjelasan tadi yang paling mudah dipahami?"`
          ],
          antisipasiMasalah: {
            kendala: "Ada siswa yang bersuara sangat kecil karena gugup berbicara di depan umum.",
            solusiPraktis: "Guru mendekat dan mengulang dengan ramah: 'Suara kalian bagus sekali! Coba katakan sekali lagi dengan suara singa yang lantang agar teman di belakang juga dengar ya!'"
          }
        },
        {
          id: "step-5",
          nomorUrut: 5,
          judulFase: "Fase 5: Menganalisis & Mengevaluasi Proses Pemecahan Masalah (Analyze & Evaluate)",
          alokasiMenit: "8 Menit",
          tujuanLangkah: "Menegaskan pemahaman konsep yang benar, meluruskan kekeliruan (miskonsepsi), dan mengapresiasi proses belajar.",
          aksiGuru: [
            "Mengulas kembali poin-poin penting materi " + topik + " di papan tulis.",
            "Mengklarifikasi dan meluruskan konsep yang sempat keliru saat diskusi kelompok.",
            "Mengajak seluruh murid merayakan keberhasilan belajar bersama hari ini."
          ],
          skripDialogGuru: `"Anak-anak hebat, semua kelompok berhasil memecahkan tantangan hari ini dengan luar biasa! Jadi kesimpulan kunci kita hari ini adalah... (tulis di papan tulis). Siapa yang bisa mengulangi dengan kata-katanya sendiri?"`,
          aktivitasSiswa: [
            "Memperhatikan rangkuman dan klarifikasi konsep dari guru.",
            "Mengoreksi catatan di buku masing-masing jika sebelumnya ada yang kurang tepat.",
            "Merasa bangga atas pencapaian dan usaha belajar mereka."
          ],
          mediaDanAlat: ["Catatan papan tulis terangkum", "Buku catatan siswa"],
          tipsDiferensiasi: {
            siswaButuhBimbingan: "Pastikan poin kesimpulan utama ditulis dengan huruf besar dan ringkas agar mudah dicatat.",
            siswaMahir: "Ajak mereka mengaitkan kesimpulan hari ini dengan materi pertemuan sebelumnya."
          },
          pertanyaanPemantikGuru: [
            `"Apa hal paling baru yang baru kalian ketahui hari ini tentang ${topik}?"`,
            `"Mengapa konsep ini sangat berguna bagi kita sehari-hari?"`
          ],
          antisipasiMasalah: {
            kendala: "Siswa tampak lelah atau fokus menurun di akhir kegiatan inti.",
            solusiPraktis: "Lakukan tepuk fokus 10 detik (Tepuk 1, 2, 3 dor!) sebelum menarik kesimpulan papan tulis."
          }
        }
      ];
    }

    // 3. SINKRONISASI AKTIVITAS INTI DARI DOKUMEN RPP (MENGGANTIKAN TEMPLATE STATIS)
    // Jika RPP memiliki langkah-langkah konkret (misal: "Surat Cinta untuk Pohon", eksperimen daun, dll),
    // langkah-langkah di panduan WAJIB menampilkan skrip dialog dan aksi nyata tersebut!
    if (parsedRPP?.intiPhases && parsedRPP.intiPhases.length >= 2) {
      steps = parsedRPP.intiPhases.map((phase, idx) => {
        const stepNum = phase.num || (idx + 1);
        const hasQuotes = phase.quotes.length > 0;
        const mainQuote = hasQuotes ? `"${phase.quotes[0]}"` : "";
        
        let cleanTitle = phase.title;
        if (cleanTitle.length > 55 && cleanTitle.includes('.')) {
          cleanTitle = cleanTitle.split('.')[0].trim();
        }

        const fullTitle = `Fase ${stepNum}: ${cleanTitle}${mainQuote ? ` (Aktivitas: ${mainQuote})` : ''}`;
        const activitySummary = phase.muridActivities.join(' ') || phase.description || phase.title;

        let skrip = "";
        if (mainQuote) {
          skrip = `"Anak-anak hebat, sekarang saatnya setiap kelompok melakukan aktivitas istimewa, yaitu ${mainQuote}! ${phase.description ? phase.description.replace(/^[-*•\s]*Kelompok\s+/i, 'Silakan kelompok ') : ''}. Tunjukkan kerja sama terbaik dan saling mendukung ya!"`;
        } else if (idx === 0) {
          skrip = `"Anak-anak hebat kelas ${kelas}, mari kita amati bersama stimulus di depan kelas terkait topik '${topik}'. ${phase.description || ''}. Siapa yang bisa menemukan tantangan atau masalah utamanya?"`;
        } else if (idx === parsedRPP.intiPhases.length - 1) {
          skrip = `"Luar biasa kerja sama semua kelompok hari ini! Mari kita simpulkan temuan terbaik kita: ${phase.description || phase.title}. Siapa yang ingin menyampaikan pesan penting hasil diskusinya?"`;
        } else {
          skrip = `"Sekarang silakan tim bekerja sama: ${phase.description || phase.title}. Ingat pilar Karakter Berbasis Cinta: saling mendengarkan, menghargai pendapat, dan kompak!"`;
        }

        const aksiGuruList = phase.guruActivities.length > 0 ? phase.guruActivities : [
          `Guru memandu dan memfasilitasi aktivitas ${mainQuote || cleanTitle} di kelas.`,
          `Guru berkeliling memberikan bimbingan dan pertanyaan pemantik untuk mempertajam pemahaman murid.`,
          `Guru mengapresiasi kerja sama dan saling asah-asih-asuh antarmurid sesuai nilai KBC.`
        ];

        const aksiSiswaList = phase.muridActivities.length > 0 ? phase.muridActivities : [
          phase.description || `Murid berdiskusi aktif bersama teman sekelompok untuk menyelesaikan tugas ${mainQuote || cleanTitle}.`,
          `Murid saling mengemukakan argumen dan mencatat temuan pada lembar kerja kelompok.`,
          `Murid menunjukkan sikap santun dan saling menyayangi antar anggota tim.`
        ];

        const mediaList = [
          mainQuote ? `Lembar Kerja / Bahan ${mainQuote}` : `LKPD Pembelajaran ${topik}`,
          `Media Peraga & Bahan Ajar ${topik}`,
          `Alat Tulis & Papan Kerja`
        ];

        return {
          id: `step-${stepNum}`,
          nomorUrut: stepNum,
          judulFase: fullTitle,
          alokasiMenit: idx === 0 ? "8 Menit" : idx === 1 ? "10 Menit" : idx === 2 ? "15 Menit" : idx === 3 ? "12 Menit" : "8 Menit",
          tujuanLangkah: `Menuntaskan tahapan ${cleanTitle} ${mainQuote ? `melalui karya ${mainQuote}` : ''} untuk memperkuat penguasaan kompetensi murid.`,
          aksiGuru: aksiGuruList,
          skripDialogGuru: skrip,
          aktivitasSiswa: aksiSiswaList,
          mediaDanAlat: mediaList,
          tipsDiferensiasi: {
            siswaButuhBimbingan: `Beri panduan langkah bertahap (scaffolding) langsung ke meja kelompok dan berikan contoh konkret penyelesaian ${mainQuote || cleanTitle}.`,
            siswaMahir: `Tantang murid untuk memperdalam analisis ${topik} atau menjadi tutor sebaya yang suportif bagi rekan sekelompoknya.`
          },
          pertanyaanPemantikGuru: [
            `"Bagaimana proses diskusi tim kalian dalam menyelesaikan ${mainQuote || cleanTitle} ini?"`,
            `"Apa bukti ilmiah atau alasan di balik kesimpulan yang kalian temukan?"`
          ],
          antisipasiMasalah: {
            kendala: `Ada anggota kelompok yang pasif atau kebingungan saat menyusun ${mainQuote || cleanTitle}.`,
            solusiPraktis: `Hampiri meja kelompok, ajukan pertanyaan pemancing sederhana, dan pastikan pembagian peran kerja berjalan adil dengan penuh kasih sayang.`
          }
        };
      });
    } else if (parsedRPP?.allQuotes && parsedRPP.allQuotes.length > 0 && steps.length > 0) {
      // Injeksi kutipan aktivitas (seperti "Surat Cinta untuk Pohon") ke fase terakhir jika format RPP agak unik
      const specialQuote = parsedRPP.allQuotes[parsedRPP.allQuotes.length - 1];
      const lastStep = steps[steps.length - 1];
      if (lastStep && specialQuote) {
        lastStep.judulFase = `${lastStep.judulFase} (Aktivitas: "${specialQuote}")`;
        lastStep.skripDialogGuru = `"Anak-anak hebat, sekarang saatnya setiap kelompok membuat karya istimewa '${specialQuote}'! Tuangkan seluruh pemahaman dan rasa terima kasih kalian atas apa yang kita pelajari hari ini!"`;
        lastStep.aktivitasSiswa = [
          `Bersama kelompok menyusun "${specialQuote}" sebagai wujud perumusan kesimpulan pembelajaran yang mendalam.`,
          ...lastStep.aktivitasSiswa
        ];
        lastStep.mediaDanAlat = [
          `Lembar/Kertas karya "${specialQuote}"`,
          ...lastStep.mediaDanAlat
        ];
      }
    }

    return {
      topik: topik,
      mataPelajaran: mapel,
      kelas: kelas,
      modelPembelajaran: model,
      alokasiWaktuTotal: formData.alokasiWaktu || "2 x 35 Menit (1 Pertemuan)",
      ringkasanStrategi: `Panduan ini dirancang untuk memandu guru mengajar topik "${topik}" secara bertahap dan menyenangkan bagi siswa Kelas ${kelas}. Mengedepankan interaksi hangat guru-siswa, pemahaman konsep tuntas, bimbingan diferensiasi tanpa diskriminasi, serta internalisasi Karakter Berbasis Cinta (${kbc}).`,

      kegiatanAwal: {
        alokasiWaktu: "10-15 Menit",
        tujuan: "Menciptakan suasana kelas yang aman, tertib, penuh cinta kasih, serta membangkitkan rasa ingin tahu murid melalui apersepsi yang hidup.",
        langkahDetail: [
          {
            tahap: "1. Pembukaan Ramah, Salam, & Berdoa",
            skripGuru: `"Assalamu'alaikum warahmatullahi wabarakatuh, selamat pagi anak-anak hebat! Bagaimana kabarnya hari ini? Alhamdulillah, semuanya tampak ceria dan bersemangat. Sebelum kita mulai petualangan ilmu hari ini, mari kita tundukkan kepala dan berdoa bersama dengan khusyuk. Ketua kelas, silakan dipimpin doanya ya."`,
            aktivitasSiswa: "Menjawab salam serentak dengan senyum, duduk rapi, dan memimpin/mengikuti doa pembuka bersama dengan khusyuk.",
            tipsManajemen: "Tatap mata murid satu per satu, tunggu sampai seluruh kelas benar-benar hening sebelum memulai doa. Hindari memulai saat masih ada anak berlarian."
          },
          {
            tahap: "2. Presensi & Pengecekan Kesiapan Emosional (Check-in Emosi)",
            skripGuru: `"Siapa sahabat kita yang hari ini berhalangan hadir? Mari kita doakan semoga yang sedang sakit segera sembuh. Anak-anak, sebelum belajar, coba letakkan tangan di dada: 'Hari ini saya siap belajar dengan senang hati dan cinta!'"`,
            aktivitasSiswa: "Melaporkan kehadiran teman, menarik napas dalam-dalam, dan mengucapkan afirmasi kesiapan belajar bersama guru.",
            tipsManajemen: "Jika ada siswa yang terlihat murung atau mengantuk, hampiri sejenak dan berikan tepukan bahu lembut atau sapaan hangat."
          },
          {
            tahap: "3. Apersepsi Menarik & Pertanyaan Pemantik Kontekstual (Sinkron RPP)",
            skripGuru: (() => {
              if (parsedRPP?.apersepsiQuestion) {
                const actionDisplay = parsedRPP.apersepsiAction ? parsedRPP.apersepsiAction : "apa yang Ibu/Bapak bawa di depan kelas";
                return `"Anak-anak hebat, coba perhatikan apa yang Ibu/Bapak tunjukkan hari ini (${actionDisplay}). Coba amati baik-baik. Ibu/Bapak ingin bertanya: '${parsedRPP.apersepsiQuestion}' Siapa yang memiliki ide atau ingin mencoba menjawab?"`;
              }
              if (parsedRPP?.apersepsiRaw) {
                return `"Anak-anak hebat, mari kita cermati bersama: ${parsedRPP.apersepsiRaw}. Menurut kalian, mengapa hal tersebut bisa terjadi dan apa hubungannya dengan kehidupan kita?"`;
              }
              return `"Anak-anak hebat kelas ${kelas}, mari kita amati bersama fenomena topik '${topik}'. Pernahkah kalian mengamati hal ini di sekitar kita? Apa yang paling membuat kalian penasaran?"`;
            })(),
            aktivitasSiswa: (() => {
              if (parsedRPP?.apersepsiAction || parsedRPP?.apersepsiQuestion) {
                return `Mengamati secara saksama stimulus (${parsedRPP.apersepsiAction || topik}) yang diperagakan guru, merenungkan pertanyaan pemantik spiritual/konseptual, dan aktif mengangkat tangan untuk menyampaikan pendapat awal.`;
              }
              return "Memusatkan perhatian pada stimulus awal guru dan antusias merespon pertanyaan pemantik.";
            })(),
            tipsManajemen: (() => {
              if (parsedRPP?.apersepsiAction) {
                return `Gunakan benda konkret atau gambar peraga riil sebagaimana skenario RPP (${parsedRPP.apersepsiAction}). Dekatkan ke meja murid agar stimulus terasa hidup dan memicu rasa ingin tahu.`;
              }
              return "Beri giliran bicara merata tidak hanya pada murid di baris depan, tetapi juga ajak murid yang duduk di baris belakang.";
            })()
          },
          {
            tahap: "4. Penyampaian Tujuan & Kontrak Belajar Ceria (Sinkron ATP)",
            skripGuru: (() => {
              const effectiveTPList: string[] = (parsedRPP?.tpList && parsedRPP.tpList.length > 0)
                ? parsedRPP.tpList
                : (formData.tp.tipe === 'manual' && formData.tp.manual ? formData.tp.manual.split('\n').filter((l: string) => l.trim()) : []);

              if (effectiveTPList.length > 0) {
                const tpFormatted = effectiveTPList.map((tp: string) => tp.replace(/^[-*•\d\.\s]+/, '')).join("; serta ");
                return `"Hari ini target petualangan belajar kita sangat hebat dan jelas: kita semua akan ${tpFormatted}. Kita capai bersama lewat kerjasama kelompok yang saling menyayangi dan mendukung ya. Siap anak-anak hebat?"`;
              }
              return `"Hari ini tujuan hebat kita adalah: setelah belajar bersama, kalian semua akan mampu memahami dan menjelaskan tentang ${topik} dengan benar. Aturan belajar kita hari ini hanya dua: saling menyayangi teman dan aktif bertanya jika belum paham. Siap semuanya?"`;
            })(),
            aktivitasSiswa: "Menyimak butir Tujuan Pembelajaran (TP) yang disampaikan guru dan menjawab 'Siap, Ibu/Bapak Guru!' dengan riang penuh semangat.",
            tipsManajemen: "Tuliskan poin kunci TP di sudut papan tulis sebagai kompas capaian hingga akhir jam pelajaran."
          }
        ],
        iceBreakingSingkat: {
          nama: "Tepuk Fokus & Karakter Cinta",
          instruksi: "Tepuk 1x: 'Siap!', Tepuk 2x: 'Fokus!', Tepuk 3x: 'Penuh Cinta!' (diakhiri tangan membentuk simbol hati di dada).",
          manfaat: "Mengembalikan konsentrasi siswa dalam 15 detik dan menumbuhkan rasa kehangatan antar teman."
        },
        internalisasiKBC: parsedRPP?.kbcConnection
          ? `Tanamkan pilar ${kbc} (${parsedRPP.kbcConnection}): bangun kesadaran spiritual dan cinta lingkungan sejak menit awal pembelajaran.`
          : `Tanamkan pilar ${kbc} dengan mengingatkan bahwa belajar bukan sekadar mencari nilai, melainkan bentuk rasa syukur kepada Allah SWT dan wujud kasih sayang kepada sesama makhluk.`
      },

      kegiatanInti: {
        namaModel: model,
        alokasiWaktu: "45-50 Menit",
        penjelasanSintaks: `Kegiatan inti dijalankan mengikuti langkah baku ${model} yang menggeser peran guru dari 'penceramah tunggal' menjadi 'fasilitator & pemantik berpikir kritis'. Pembelajaran berpusat pada murid (student-centered) dengan pembiasaan kolaboratif.`,
        faseLangkah: steps
      },

      kegiatanPenutup: {
        alokasiWaktu: "10-15 Menit",
        tujuan: "Mengikat makna pembelajaran, memfasilitasi refleksi diri murid, menguatkan karakter cinta kasih, dan menutup kelas dengan doa serta motivasi hangat.",
        langkahDetail: [
          {
            tahap: "1. Refleksi Bermakna Bersama Siswa",
            skripGuru: parsedRPP?.penutupRefleksi
              ? `"Anak-anak hebat, mari kita renungkan sejenak: ${parsedRPP.penutupRefleksi} Apa satu hal paling luar biasa yang kalian rasakan hari ini?"`
              : `"Anak-anak hebat, waktu belajar kita sudah hampir selesai. Mari kita renungkan sejenak: Dari semua aktivitas tadi, bagian mana yang paling kalian sukai? Dan apa satu hal penting yang paling kalian ingat tentang ${topik}?"`,
            aktivitasSiswa: "Mengungkapkan perasaan belajar mereka dengan jujur dan menyebutkan konsep yang paling mereka ingat.",
            panduanRefleksi: [
              "Apa hal paling seru yang kamu pelajari hari ini?",
              "Bagian mana yang tadi sempat terasa sulit tapi akhirnya berhasil kamu pahami?",
              "Bagaimana sikapmu kepada teman kelompokmu saat belajar tadi?"
            ]
          },
          {
            tahap: "2. Penguatan Nilai Karakter Berbasis Cinta (KBC)",
            skripGuru: parsedRPP?.penutupKbc
              ? `"Ibu/Bapak guru sangat bangga pada kalian semua hari ini. ${parsedRPP.penutupKbc}. Ingatlah untuk selalu membawa nilai cinta kasih ini di manapun kalian berada!"`
              : `"Ibu/Bapak guru sangat bangga melihat kalian hari ini. Kalian tidak hanya pintar memahami ${topik}, tetapi kalian membuktikan Karakter Cinta: kalian saling membantu saat teman kesulitan, mendengarkan saat teman bicara, dan pantang menyerah. Pertahankan sifat mulia ini di rumah ya!"`,
            aktivitasSiswa: "Mendengarkan dengan bangga dan tersenyum, menyerap nilai kebaikan dalam hati.",
            panduanRefleksi: [
              "Kebaikan apa yang sudah kamu berikan untuk teman sebangkumu hari ini?"
            ]
          },
          {
            tahap: "3. Tindak Lanjut & Doa Penutup",
            skripGuru: `"Untuk memperdalam pemahaman kalian, di rumah nanti coba ceritakan materi ini kepada Ayah atau Bunda ya. Pertemuan berikutnya kita akan belajar hal yang lebih seru lagi! Mari kita akhiri dengan doa syukur bersama. Alhamdulillahirabbil 'alamin. Sampai jumpa besok anak-anak hebat!"`,
            aktivitasSiswa: "Merapikan alat tulis dan meja ke dalam tas, berdoa bersama dengan khusyuk, dan berpamitan kepada guru.",
            panduanRefleksi: [
              "Mengingat komitmen untuk menyapa orang tua di rumah dengan senyuman."
            ]
          }
        ],
        pesanInspiratif: "Setiap anak adalah bintang yang bersinar dengan caranya sendiri. Guru yang mengajar dengan cinta akan melahirkan murid yang haus akan ilmu dan penuh kasih sayang."
      },

      checklistKesiapanGuru: [
        "Menyiapkan bahan tayang stimulus / gambar / benda konkret di meja guru sebelum bel berbunyi.",
        "Mencetak lembar LKPD sejumlah kelompok (pastikan cukup dan terbaca jelas).",
        "Mengecek spidol dan papan tulis dalam keadaan bersih siap tulis.",
        "Mengingat nama-nama siswa yang membutuhkan bimbingan ekstra untuk pendampingan aktif.",
        "Membawa stiker bintang atau kartu apresiasi untuk memotivasi partisipasi siswa."
      ],

      tipsGuruSpesial: [
        "Gunakan teknik 'Wait Time 3 Detik': Setelah melempar pertanyaan, jangan langsung menunjuk murid. Beri jeda 3 detik agar semua murid sempat berpikir.",
        "Terapkan apresiasi spesifik: Hindari hanya berkata 'Bagus!'. Ucapkan 'Ibu suka sekali caramu mengamati detail pada gambar nomor 2 tadi!'.",
        "Bergerak secara dinamis di kelas: Jangan hanya berdiri di belakang meja guru. Berkeliling ke area meja belakang agar seluruh siswa merasa diperhatikan.",
        "Jika kelas mulai ribut atau hilang fokus, jangan berteriak memarahi. Turunkan volume suara guru menjadi bisikan lembut, anak-anak akan otomatis hening untuk menyimak."
      ]
    };
  };

  // Generate guide via Gemini AI API
  const handleGenerateAiGuide = async () => {
    if (!generatedRPP) {
      alert("Silakan buat dokumen RPP terlebih dahulu agar AI dapat membaca dan membedah alur kegiatan RPP secara presisi.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const modelName = getModelName();
    const systemPrompt = `Anda adalah Konsultan Master Pedagogi Nasional, Ahli Kurikulum Merdeka, dan Pelatih Guru Senior di Indonesia.
Tugas Anda: Menganalisis dokumen RPP di bawah ini, lalu menyusun "PANDUAN MENGAJAR GURU SECARA DETAIL (STEP-BY-STEP TEACHING WALKTHROUGH)" terutama pada bagian PENGALAMAN BELAJAR (Kegiatan Awal, Kegiatan Inti berdasar Sintaks Model, dan Kegiatan Penutup).

ATURAN SINKRONISASI MUTLAK DENGAN DOKUMEN RPP (WAJIB DIPATUHI):
1. SINKRONISASI APERSEPSI & STIMULUS: Skrip ucapan guru pada langkah Apersepsi HARUS mengutip dan mengembangkan secara nyata skenario apersepsi yang ada di RPP (misalnya: jika di RPP tertulis guru menunjukkan sehelai daun segar dan bertanya tentang klorofil vs napas, maka skrip guru di panduan WAJIB mengajak siswa mengamati daun segar tersebut dan menanyakan pertanyaan klorofil itu!). DILARANG KERAS menggunakan kalimat klise umum seperti 'siapa yang ingat pelajaran minggu lalu'.
2. SINKRONISASI TUJUAN PEMBELAJARAN: Skrip guru saat menyampaikan tujuan WAJIB membacakan butir-butir Tujuan Pembelajaran (TP) operasional yang ada di RPP, bukan sekadar menyebut nama topik umum.
3. SINKRONISASI KEGIATAN INTI: Langkah-langkah kegiatan inti, aksi guru, dan aktivitas murid WAJIB mencerminkan alur nyata yang ada di Bagian D RPP, dijabarkan menjadi dialog verbatim dan panduan interaksi kelas konkret.
4. SINKRONISASI PENUTUP & KBC: Refleksi dan penutup WAJIB menyatu dengan internalisasi pilar Panca Cinta KBC yang tertulis di RPP.

PANDUAN INI BERTUJUAN AGAR GURU TIDAK LAGI BINGUNG DENGAN ALUR RPP. Berikan penjelasan yang sangat konkret, praktis, ada skrip dialog kalimat pembuka guru kata-demi-kata (verbatim script), alokasi menit presisi, peran guru, aktivitas murid konkret, tips diferensiasi bagi anak yang tertinggal vs anak cepat, pertanyaan pemantik pancingan, serta antisipasi kendala di kelas.

KEMBALIKAN HANYA JSON MURNI tanpa markdown backtick (\`\`\`json) dengan struktur yang sama persis seperti contoh skema berikut:
{
  "topik": "${formData.topik}",
  "mataPelajaran": "${formData.mataPelajaran}",
  "kelas": "${formData.kelas}",
  "modelPembelajaran": "${modelName}",
  "alokasiWaktuTotal": "${formData.alokasiWaktu}",
  "ringkasanStrategi": "Penjelasan ringkas 2-3 kalimat filosofi pengajaran pada materi ini.",
  "kegiatanAwal": {
    "alokasiWaktu": "10-15 Menit",
    "tujuan": "Tujuan kegiatan awal",
    "langkahDetail": [
      {
        "tahap": "1. Pembukaan & Doa",
        "skripGuru": "Contoh kalimat nyata guru menyapa dan mengajak doa...",
        "aktivitasSiswa": "Apa yang dilakukan murid...",
        "tipsManajemen": "Tips praktis guru mengkondisikan kelas..."
      },
      {
        "tahap": "2. Presensi & Emosional",
        "skripGuru": "Contoh kalimat nyata...",
        "aktivitasSiswa": "Respon siswa...",
        "tipsManajemen": "Tips..."
      },
      {
        "tahap": "3. Apersepsi & Pertanyaan Pemantik",
        "skripGuru": "Contoh kalimat nyata menghubungkan materi...",
        "aktivitasSiswa": "Respon siswa...",
        "tipsManajemen": "Tips..."
      },
      {
        "tahap": "4. Penyampaian Tujuan",
        "skripGuru": "Contoh kalimat guru menyampaikan apa yang akan dipelajari...",
        "aktivitasSiswa": "Respon siswa...",
        "tipsManajemen": "Tips..."
      }
    ],
    "iceBreakingSingkat": {
      "nama": "Nama Ice Breaking",
      "instruksi": "Cara memainkannya di kelas dalam 1 menit",
      "manfaat": "Manfaatnya"
    },
    "internalisasiKBC": "Cara menanamkan nilai Karakter Berbasis Cinta sejak awal kelas"
  },
  "kegiatanInti": {
    "namaModel": "${modelName}",
    "alokasiWaktu": "45-50 Menit",
    "penjelasanSintaks": "Penjelasan mengapa sintaks model ini dipilih dan bagaimana transisi antar fase.",
    "faseLangkah": [
      {
        "id": "step-1",
        "nomorUrut": 1,
        "judulFase": "Fase 1: ...",
        "alokasiMenit": "10 Menit",
        "tujuanLangkah": "Tujuan langkah...",
        "aksiGuru": ["Aksi 1", "Aksi 2", "Aksi 3"],
        "skripDialogGuru": "Contoh ucapan guru langsung kepada siswa...",
        "aktivitasSiswa": ["Aktivitas murid 1", "Aktivitas murid 2"],
        "mediaDanAlat": ["Media 1", "Media 2"],
        "tipsDiferensiasi": {
          "siswaButuhBimbingan": "Cara membimbing siswa yang tertinggal...",
          "siswaMahir": "Tantangan tambahan untuk siswa yang cepat..."
        },
        "pertanyaanPemantikGuru": ["Pertanyaan pancingan jika siswa bingung 1", "Pertanyaan 2"],
        "antisipasiMasalah": {
          "kendala": "Kemungkinan kendala di kelas...",
          "solusiPraktis": "Solusi cepat guru..."
        }
      }
    ]
  },
  "kegiatanPenutup": {
    "alokasiWaktu": "10-15 Menit",
    "tujuan": "Tujuan penutup",
    "langkahDetail": [
      {
        "tahap": "1. Refleksi Bersama",
        "skripGuru": "Contoh dialog guru...",
        "aktivitasSiswa": "Aktivitas murid...",
        "panduanRefleksi": ["Pertanyaan refleksi 1", "Pertanyaan 2", "Pertanyaan 3"]
      },
      {
        "tahap": "2. Penguatan KBC",
        "skripGuru": "Contoh dialog guru...",
        "aktivitasSiswa": "Aktivitas murid...",
        "panduanRefleksi": ["Poin apresiasi..."]
      },
      {
        "tahap": "3. Tindak Lanjut & Doa",
        "skripGuru": "Contoh dialog guru...",
        "aktivitasSiswa": "Aktivitas murid...",
        "panduanRefleksi": ["Pesan penutup..."]
      }
    ],
    "pesanInspiratif": "Pesan inspirasi bagi guru"
  },
  "checklistKesiapanGuru": ["Poin 1", "Poin 2", "Poin 3", "Poin 4"],
  "tipsGuruSpesial": ["Tips 1", "Tips 2", "Tips 3", "Tips 4"]
}`;

    const userPrompt = `Berikut adalah data dan DOKUMEN RPP LENGKAP yang telah digenerate:
Mata Pelajaran: ${formData.mataPelajaran}
Topik Materi: ${formData.topik}
Kelas: ${formData.kelas}
Model Pembelajaran: ${modelName}
Karakter KBC: ${formData.topikPancaCinta.selected || formData.topikPancaCinta.hasil || "Cinta Lingkungan & Cinta Teman"}

DOKUMEN RPP:
${generatedRPP}

Susun Panduan Mengajar Guru yang sangat komprehensif, operasional, dan siap pakai. 
WAJIB SINKRON 100% DENGAN RPP: Ambil pertanyaan apersepsi riil dari RPP, cantumkan butir TP operasional di skrip tujuan, dan jabarkan sintaks ${modelName} sesuai kegiatan inti di RPP. Kembalikan HANYA format JSON murni!`;

    try {
      const responseText = await callGemini(userPrompt, systemPrompt, false, null, [], true);
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setGuideData(parsed);
    } catch (err: any) {
      console.warn("Gagal memanggil AI untuk panduan mengajar, menggunakan Smart Fallback Generator:", err);
      // Fallback seamlessly so the teacher never experiences a broken view!
      const fallback = buildSmartFallbackGuide();
      setGuideData(fallback);
      setErrorMsg("Server AI sedang antre padat. Panduan Mengajar telah dibuat menggunakan Generator Cerdas Berbasis RPP.");
    } finally {
      setIsLoading(false);
    }
  };

  const lastRPPRef = useRef<string | null>(null);

  // Auto initialize or re-synchronize guide whenever generatedRPP changes or is populated
  useEffect(() => {
    if (generatedRPP && generatedRPP !== lastRPPRef.current) {
      lastRPPRef.current = generatedRPP;
      setGuideData(buildSmartFallbackGuide());
    }
  }, [generatedRPP, formData.topik, formData.tp]);

  // Request interactive AI variation/tips for a specific phase
  const handleRequestAiVariation = async (phaseTitle: string) => {
    setAiIdeaPrompt(`Ide variasi aktivitas interaktif & ice breaking untuk ${phaseTitle}`);
    setIsGeneratingIdea(true);
    setAiIdeaResult(null);

    const prompt = `Guru sedang mengajar mata pelajaran ${formData.mataPelajaran}, Topik "${formData.topik}" untuk Kelas ${formData.kelas}.
Pada tahap "${phaseTitle}", berikan 2 variasi ide kegiatan interaktif alternatif yang sangat menyenangkan, minim alat, dan membuat siswa antusias berpartisipasi aktif.
Tuliskan langsung poin-poin ringkas dan skrip instruksi guru dalam 2 paragraf!`;

    try {
      const text = await callGemini(prompt, "Anda adalah Pelatih Guru Kreatif Nasional yang ahli merancang aktivitas kelas ceria dan efektif.");
      setAiIdeaResult(text);
    } catch (err) {
      setAiIdeaResult(`💡 Variasi Cepat:\n1. Gunakan teknik 'Think-Pair-Share': Minta siswa memikirkan jawaban 30 detik sendiri, lalu berbisik ke teman sebangku 1 menit, baru tunjuk 2 pasang membagikan ke kelas.\n2. Permainan 'Tongkat Estafet Musik': Putar lagu riang 15 detik, saat lagu berhenti, siswa yang memegang spidol mendapat kesempatan emas menjawab kuis.`);
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  // Print Teaching Cheatsheet
  const handlePrintGuide = () => {
    window.print();
  };

  // Export to Microsoft Word (.doc)
  const exportToWord = () => {
    if (!guideData) return;

    let docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Panduan Mengajar - ${guideData.topik}</title>
        <style>
          body { font-family: 'Calibri', 'Segoe UI', sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; margin: 20px; }
          h1 { font-size: 16pt; color: #1e1b4b; text-align: center; text-transform: uppercase; margin-bottom: 4px; }
          h2 { font-size: 13pt; color: #312e81; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase; }
          h3 { font-size: 11pt; color: #4338ca; margin-top: 14px; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 16px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 10pt; text-align: left; vertical-align: top; }
          th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; }
          .dialog-box { background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 8px 12px; margin: 8px 0; font-style: italic; color: #1e1b4b; }
          .badge { display: inline-block; padding: 2px 6px; background: #e0e7ff; color: #3730a3; border-radius: 4px; font-size: 9pt; font-weight: bold; }
          .meta-table { border: none; margin-bottom: 20px; }
          .meta-table td { border: none; padding: 4px 6px; }
        </style>
      </head>
      <body>
        <h1>PANDUAN DETAIL MENGAJAR GURU (TEACHING WALKTHROUGH)</h1>
        <p style="text-align: center; font-size: 10pt; color: #64748b; margin-top: 0;">Panduan Operasional Pengalaman Belajar Kurikulum Merdeka</p>
        
        <table class="meta-table">
          <tr>
            <td width="20%"><strong>Mata Pelajaran:</strong></td>
            <td width="30%">${guideData.mataPelajaran}</td>
            <td width="20%"><strong>Nama Madrasah/Sekolah:</strong></td>
            <td width="30%">${formData.namaSekolah}</td>
          </tr>
          <tr>
            <td><strong>Topik Materi:</strong></td>
            <td><strong>${guideData.topik}</strong></td>
            <td><strong>Kelas / Semester:</strong></td>
            <td>Kelas ${guideData.kelas}</td>
          </tr>
          <tr>
            <td><strong>Model Pembelajaran:</strong></td>
            <td>${guideData.modelPembelajaran}</td>
            <td><strong>Alokasi Waktu:</strong></td>
            <td>${guideData.alokasiWaktuTotal}</td>
          </tr>
          <tr>
            <td><strong>Guru Pengampu:</strong></td>
            <td>${formData.titiMangsa.guru}</td>
            <td><strong>Tanggal:</strong></td>
            <td>${formData.titiMangsa.tanggal}</td>
          </tr>
        </table>

        <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
          <strong>Ringkasan Strategi Pengajaran:</strong><br/>
          ${guideData.ringkasanStrategi}
        </div>

        <h2>A. KEGIATAN AWAL / PENDAHULUAN (${guideData.kegiatanAwal.alokasiWaktu})</h2>
        <p><strong>Tujuan:</strong> ${guideData.kegiatanAwal.tujuan}</p>
        ${guideData.kegiatanAwal.langkahDetail.map((lg, idx) => `
          <h3>${lg.tahap}</h3>
          <div class="dialog-box"><strong>Contoh Skrip Ucapan Guru:</strong><br/>${lg.skripGuru}</div>
          <p><strong>Aktivitas Murid:</strong> ${lg.aktivitasSiswa}</p>
          <p><strong>Tips Manajemen Kelas:</strong> ${lg.tipsManajemen}</p>
        `).join('')}

        ${guideData.kegiatanAwal.iceBreakingSingkat ? `
          <div style="background: #fdf4ff; border: 1px solid #f0abfc; padding: 8px 12px; border-radius: 6px; margin: 10px 0;">
            <strong>Ice Breaking Pendukung:</strong> ${guideData.kegiatanAwal.iceBreakingSingkat.nama}<br/>
            <em>Instruksi:</em> ${guideData.kegiatanAwal.iceBreakingSingkat.instruksi}<br/>
            <em>Manfaat:</em> ${guideData.kegiatanAwal.iceBreakingSingkat.manfaat}
          </div>
        ` : ''}

        <h2>B. KEGIATAN INTI: SINTAKS MODEL ${guideData.kegiatanInti.namaModel.toUpperCase()} (${guideData.kegiatanInti.alokasiWaktu})</h2>
        <p><em>${guideData.kegiatanInti.penjelasanSintaks}</em></p>

        ${guideData.kegiatanInti.faseLangkah.map(fase => `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3>${fase.judulFase} <span class="badge">${fase.alokasiMenit}</span></h3>
            <p><strong>Tujuan Langkah:</strong> ${fase.tujuanLangkah}</p>
            
            <div class="dialog-box">
              <strong>Skrip Kalimat Instruksi Guru:</strong><br/>
              ${fase.skripDialogGuru}
            </div>

            <table>
              <tr>
                <th width="50%">Tindakan & Peran Guru</th>
                <th width="50%">Aktivitas & Respon Murid</th>
              </tr>
              <tr>
                <td>
                  <ul>
                    ${fase.aksiGuru.map(a => `<li>${a}</li>`).join('')}
                  </ul>
                </td>
                <td>
                  <ul>
                    ${fase.aktivitasSiswa.map(as => `<li>${as}</li>`).join('')}
                  </ul>
                </td>
              </tr>
            </table>

            <p><strong>Media / Alat Digunakan:</strong> ${fase.mediaDanAlat.join(', ')}</p>
            <p><strong>Tips Diferensiasi:</strong><br/>
              - <em>Untuk Murid Butuh Bimbingan:</em> ${fase.tipsDiferensiasi.siswaButuhBimbingan}<br/>
              - <em>Untuk Murid Mahir:</em> ${fase.tipsDiferensiasi.siswaMahir}
            </p>
            <p><strong>Pertanyaan Pemantik Pancingan:</strong><br/>
              ${fase.pertanyaanPemantikGuru.map(q => `• ${q}`).join('<br/>')}
            </p>
            <p><strong>Antisipasi Kendala:</strong> <em>Kendala:</em> ${fase.antisipasiMasalah.kendala} | <em>Solusi:</em> ${fase.antisipasiMasalah.solusiPraktis}</p>
          </div>
        `).join('')}

        <h2>C. KEGIATAN PENUTUP & REFLEKSI (${guideData.kegiatanPenutup.alokasiWaktu})</h2>
        <p><strong>Tujuan:</strong> ${guideData.kegiatanPenutup.tujuan}</p>
        ${guideData.kegiatanPenutup.langkahDetail.map(pen => `
          <h3>${pen.tahap}</h3>
          <div class="dialog-box"><strong>Contoh Skrip Ucapan Guru:</strong><br/>${pen.skripGuru}</div>
          <p><strong>Aktivitas Murid:</strong> ${pen.aktivitasSiswa}</p>
          ${pen.panduanRefleksi ? `
            <p><strong>Panduan Pertanyaan Refleksi Anak:</strong></p>
            <ul>
              ${pen.panduanRefleksi.map(pr => `<li>${pr}</li>`).join('')}
            </ul>
          ` : ''}
        `).join('')}

        <h2>D. CHECKLIST KESIAPAN GURU & TIPS SPESIAL</h2>
        <table style="width: 100%;">
          <tr>
            <th width="50%">Checklist Kesiapan Sebelum Mengajar</th>
            <th width="50%">Tips Mengajar Efektif</th>
          </tr>
          <tr>
            <td>
              <ul>
                ${guideData.checklistKesiapanGuru.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </td>
            <td>
              <ul>
                ${guideData.tipsGuruSpesial.map(t => `<li>${t}</li>`).join('')}
              </ul>
            </td>
          </tr>
        </table>

        <div style="margin-top: 40px; text-align: right;">
          <p>${formData.titiMangsa.tempat}, ${formData.titiMangsa.tanggal}</p>
          <p>Guru Pengampu,</p>
          <br/><br/><br/>
          <p><strong>( ${formData.titiMangsa.guru} )</strong></p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Panduan_Mengajar_${guideData.topik.replace(/\s+/g, '_')}_Kelas_${guideData.kelas}.doc`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      
      {/* Top Banner Action Header (no-print) */}
      <div className="bg-slate-950/90 p-5 md:p-6 rounded-3xl border border-indigo-500/30 shadow-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between no-print">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30">
            <GraduationCap size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black text-white tracking-wide">
                Panduan Mengajar Detail Guru
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                Pengalaman Belajar RPP
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Penjelasan rinci langkah demi langkah kegiatan awal, inti, dan penutup dengan dialog guru nyata agar tidak bingung di kelas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Refresh AI Guide */}
          <button
            onClick={handleGenerateAiGuide}
            disabled={isLoading || !generatedRPP}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isLoading 
              ? "Menyusun Alur Guru..." 
              : guideData 
                ? "Perbarui dengan AI" 
                : "Generate Panduan Guru"}
          </button>

          {/* Quick Cheatsheet Print */}
          {guideData && (
            <>
              <button
                onClick={handlePrintGuide}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                title="Cetak Cheatsheet Guru untuk Meja Kelas"
              >
                <Printer size={14} className="text-indigo-400" /> Cetak Cheatsheet
              </button>
              <button
                onClick={exportToWord}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-700/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                title="Download Dokumen Microsoft Word"
              >
                <FileDown size={14} /> Export Word
              </button>
            </>
          )}
        </div>
      </div>

      {/* Warning if RPP not generated yet */}
      {!generatedRPP && (
        <div className="bg-amber-950/40 border border-amber-500/40 p-6 md:p-8 rounded-3xl text-center space-y-4 shadow-xl no-print">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <BookOpen size={32} />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-base font-black text-amber-200">
              Dokumen RPP Belum Tersedia
            </h3>
            <p className="text-xs text-amber-300/80 leading-relaxed">
              Panduan Mengajar ini diturunkan langsung dari alur RPP hasil generate Anda. Buat RPP terlebih dahulu agar alur kegiatan awal, inti (sintaks model), dan penutup dapat dipetakan secara presisi dan akurat.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateToRPPSetup}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Settings size={14} /> Buka Konfigurasi RPP
            </button>
            <button
              onClick={() => {
                // Generate preview sample guide
                setGuideData(buildSmartFallbackGuide());
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles size={14} className="text-amber-400" /> Lihat Contoh Panduan Mengajar
            </button>
          </div>
        </div>
      )}

      {/* Error notice if any */}
      {errorMsg && (
        <div className="p-4 bg-amber-950/50 border border-amber-500/40 rounded-2xl text-amber-200 text-xs flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-amber-300 hover:text-white font-bold cursor-pointer text-[10px]"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Guide Content Display */}
      {guideData && (
        <div className="space-y-6">

          {/* Sub-Tabs Navigation Inside Panduan Mengajar (no-print) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
            {[
              { id: 'all', label: 'Semua Alur Mengajar', count: 'Lengkap', icon: <Layers size={14} /> },
              { id: 'awal', label: '1. Kegiatan Awal', count: guideData.kegiatanAwal.alokasiWaktu, icon: <Smile size={14} /> },
              { id: 'inti', label: '2. Kegiatan Inti (Sintaks)', count: guideData.kegiatanInti.alokasiWaktu, icon: <Target size={14} /> },
              { id: 'penutup', label: '3. Kegiatan Penutup', count: guideData.kegiatanPenutup.alokasiWaktu, icon: <CheckCircle2 size={14} /> },
              { id: 'tips', label: 'Checklist & Pro Tips', count: `${guideData.checklistKesiapanGuru.length} Hal`, icon: <Lightbulb size={14} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                    : 'bg-slate-950/80 hover:bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Info Metadata Bar */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Topik Materi</p>
              <p className="font-black text-white truncate">{guideData.topik}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Mata Pelajaran & Kelas</p>
              <p className="font-bold text-indigo-300">{guideData.mataPelajaran} • Kelas {guideData.kelas}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Model Pembelajaran</p>
              <p className="font-bold text-amber-300 truncate">{guideData.modelPembelajaran}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Alokasi Waktu</p>
              <p className="font-bold text-emerald-400">{guideData.alokasiWaktuTotal}</p>
            </div>
          </div>

          {/* Strategy Summary Card */}
          <div className="bg-gradient-to-r from-indigo-950/60 via-slate-950 to-purple-950/60 border border-indigo-500/30 rounded-2xl p-4 md:p-5 flex items-start gap-3.5">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl shrink-0 mt-0.5 border border-indigo-500/30">
              <Compass size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                Filosofi & Strategi Mengajar di Kelas
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {guideData.ringkasanStrategi}
              </p>
            </div>
          </div>

          {/* SECTION 1: KEGIATAN AWAL / PENDAHULUAN */}
          {(activeTab === 'all' || activeTab === 'awal') && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl print-avoid-break">
              {/* Header Box */}
              <div 
                onClick={() => toggleStep('awal')}
                className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                    1
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">
                        KEGIATAN AWAL / PENDAHULUAN
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        ⏱️ {guideData.kegiatanAwal.alokasiWaktu}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {guideData.kegiatanAwal.tujuan}
                    </p>
                  </div>
                </div>
                <div className="text-slate-400 no-print">
                  {expandedSteps['awal'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedSteps['awal'] && (
                <div className="p-5 md:p-6 space-y-6">
                  {/* Steps List */}
                  <div className="space-y-4">
                    {guideData.kegiatanAwal.langkahDetail.map((item, idx) => (
                      <div key={idx} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wide flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                            {item.tahap}
                          </h4>
                          <button
                            onClick={() => handleCopyText(item.skripGuru, `awal-${idx}`)}
                            className="no-print flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                            title="Salin Skrip Dialog"
                          >
                            {copiedScriptId === `awal-${idx}` ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Salin Skrip</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Script Box */}
                        <div className="bg-indigo-950/40 border-l-4 border-indigo-500 p-3.5 rounded-r-xl text-xs text-indigo-100 italic leading-relaxed">
                          <p className="text-[10px] not-italic font-black text-indigo-400 uppercase tracking-wider mb-1">
                            💬 Contoh Kalimat Ucapan Guru di Kelas:
                          </p>
                          "{item.skripGuru}"
                        </div>

                        {/* Action details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                              <Users size={12} className="text-emerald-400" /> Aktivitas / Respon Murid:
                            </p>
                            <p className="text-slate-200">{item.aktivitasSiswa}</p>
                          </div>
                          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                              <ShieldCheck size={12} className="text-amber-400" /> Tips Manajemen Guru:
                            </p>
                            <p className="text-slate-300">{item.tipsManajemen}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ice Breaking & KBC Pill */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {guideData.kegiatanAwal.iceBreakingSingkat && (
                      <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-purple-300 text-xs font-black uppercase">
                          <Sparkles size={16} /> Ice Breaking Singkat: {guideData.kegiatanAwal.iceBreakingSingkat.nama}
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          <strong>Cara main:</strong> {guideData.kegiatanAwal.iceBreakingSingkat.instruksi}
                        </p>
                        <p className="text-[11px] text-purple-300/80">
                          ✨ <em>{guideData.kegiatanAwal.iceBreakingSingkat.manfaat}</em>
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase">
                        <CheckCircle2 size={16} /> Penanaman Karakter Berbasis Cinta (KBC)
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {guideData.kegiatanAwal.internalisasiKBC}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: KEGIATAN INTI SESUAI SINTAKS MODEL */}
          {(activeTab === 'all' || activeTab === 'inti') && (
            <div className="space-y-4 print-avoid-break">
              <div className="bg-slate-950/80 border border-slate-800 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                      2
                    </span>
                    <h3 className="text-base font-black text-white">
                      KEGIATAN INTI: SINTAKS {guideData.kegiatanInti.namaModel.toUpperCase()}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {guideData.kegiatanInti.penjelasanSintaks}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 shrink-0">
                  ⏱️ Total: {guideData.kegiatanInti.alokasiWaktu}
                </span>
              </div>

              {/* Steps Accordion */}
              {guideData.kegiatanInti.faseLangkah.map((step) => {
                const isStepExpanded = expandedSteps[step.id] ?? true;
                return (
                  <div 
                    key={step.id}
                    className="bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl"
                  >
                    {/* Step Title Header */}
                    <div 
                      onClick={() => toggleStep(step.id)}
                      className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black text-xs flex items-center justify-center">
                          {step.nomorUrut}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white">
                              {step.judulFase}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                              ⏱️ {step.alokasiMenit}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {step.tujuanLangkah}
                          </p>
                        </div>
                      </div>
                      <div className="text-slate-400 no-print">
                        {isStepExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {isStepExpanded && (
                      <div className="p-5 md:p-6 space-y-5">
                        
                        {/* Verbatim Script Box */}
                        <div className="bg-indigo-950/30 border-l-4 border-indigo-500 p-4 rounded-r-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                              <MessageCircle size={14} /> Skrip Instruksi & Kalimat Guru:
                            </span>
                            <button
                              onClick={() => handleCopyText(step.skripDialogGuru, step.id)}
                              className="no-print flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                            >
                              {copiedScriptId === step.id ? (
                                <>
                                  <Check size={12} className="text-emerald-400" />
                                  <span className="text-emerald-400">Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Salin Skrip</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-indigo-100 italic leading-relaxed">
                            "{step.skripDialogGuru}"
                          </p>
                        </div>

                        {/* Grid: Aksi Guru vs Aktivitas Murid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2.5">
                            <h5 className="text-xs font-black text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                              <GraduationCap size={15} /> Apa yang Dilakukan Guru:
                            </h5>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {step.aksiGuru.map((ag, agIdx) => (
                                <li key={agIdx} className="flex items-start gap-2">
                                  <span className="text-indigo-400 font-bold shrink-0">•</span>
                                  <span>{ag}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2.5">
                            <h5 className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                              <Users size={15} /> Apa yang Dilakukan Siswa:
                            </h5>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {step.aktivitasSiswa.map((as, asIdx) => (
                                <li key={asIdx} className="flex items-start gap-2">
                                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                                  <span>{as}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Media Used */}
                        {step.mediaDanAlat && step.mediaDanAlat.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              📦 Media / Alat Langkah Ini:
                            </span>
                            {step.mediaDanAlat.map((med, mIdx) => (
                              <span 
                                key={mIdx}
                                className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium text-[11px]"
                              >
                                {med}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Differentiation & Scaffolding */}
                        <div className="p-4 bg-amber-950/20 border border-amber-500/25 rounded-2xl space-y-2">
                          <h5 className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                            <Compass size={14} /> Tips Diferensiasi Pembelajaran:
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                              <p className="text-[10px] font-bold text-amber-400 uppercase mb-1">
                                🆘 Murid yang Membutuhkan Bimbingan (Scaffolding):
                              </p>
                              <p className="text-slate-300">{step.tipsDiferensiasi.siswaButuhBimbingan}</p>
                            </div>
                            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                              <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">
                                🚀 Murid Mahir / Cepat Tanggap (Enrichment):
                              </p>
                              <p className="text-slate-300">{step.tipsDiferensiasi.siswaMahir}</p>
                            </div>
                          </div>
                        </div>

                        {/* Prompting Questions & Potential Pitfalls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {step.pertanyaanPemantikGuru && step.pertanyaanPemantikGuru.length > 0 && (
                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                              <h5 className="text-[11px] font-black text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                                <HelpCircle size={14} /> Pertanyaan Pancingan Guru (Jika Siswa Macet):
                              </h5>
                              <ul className="space-y-1.5 text-slate-300">
                                {step.pertanyaanPemantikGuru.map((q, qIdx) => (
                                  <li key={qIdx} className="italic text-indigo-200">
                                    "{q}"
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {step.antisipasiMasalah && (
                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                              <h5 className="text-[11px] font-black text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                                <AlertTriangle size={14} /> Antisipasi Masalah & Solusi Cepat:
                              </h5>
                              <p className="text-slate-300">
                                <strong className="text-rose-400">Kendala:</strong> {step.antisipasiMasalah.kendala}
                              </p>
                              <p className="text-slate-300">
                                <strong className="text-emerald-400">Solusi Guru:</strong> {step.antisipasiMasalah.solusiPraktis}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Ask AI for more ideas in this step (no-print) */}
                        <div className="pt-2 flex items-center justify-end no-print">
                          <button
                            onClick={() => handleRequestAiVariation(step.judulFase)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                          >
                            <Sparkles size={12} />
                            <span>Tanya Ide Variasi / Ice Breaking Tambahan untuk Langkah Ini</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION 3: KEGIATAN PENUTUP & REFLEKSI */}
          {(activeTab === 'all' || activeTab === 'penutup') && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl print-avoid-break">
              <div 
                onClick={() => toggleStep('penutup')}
                className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                    3
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">
                        KEGIATAN PENUTUP & REFLEKSI BERMAKNA
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        ⏱️ {guideData.kegiatanPenutup.alokasiWaktu}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {guideData.kegiatanPenutup.tujuan}
                    </p>
                  </div>
                </div>
                <div className="text-slate-400 no-print">
                  {expandedSteps['penutup'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedSteps['penutup'] && (
                <div className="p-5 md:p-6 space-y-6">
                  <div className="space-y-4">
                    {guideData.kegiatanPenutup.langkahDetail.map((item, idx) => (
                      <div key={idx} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wide flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            {item.tahap}
                          </h4>
                          <button
                            onClick={() => handleCopyText(item.skripGuru, `penutup-${idx}`)}
                            className="no-print flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                          >
                            {copiedScriptId === `penutup-${idx}` ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Salin Skrip</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Script box */}
                        <div className="bg-emerald-950/40 border-l-4 border-emerald-500 p-3.5 rounded-r-xl text-xs text-emerald-100 italic leading-relaxed">
                          <p className="text-[10px] not-italic font-black text-emerald-400 uppercase tracking-wider mb-1">
                            💬 Contoh Kalimat Ucapan Guru:
                          </p>
                          "{item.skripGuru}"
                        </div>

                        {/* Response & reflection questions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                              Aktivitas Siswa:
                            </p>
                            <p className="text-slate-200">{item.aktivitasSiswa}</p>
                          </div>

                          {item.panduanRefleksi && item.panduanRefleksi.length > 0 && (
                            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">
                                ❓ Pertanyaan Refleksi Anak:
                              </p>
                              <ul className="space-y-1 text-slate-300">
                                {item.panduanRefleksi.map((pr, prIdx) => (
                                  <li key={prIdx}>• {pr}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Motivational message */}
                  <div className="p-5 bg-gradient-to-r from-indigo-950/50 to-purple-950/50 border border-indigo-500/30 rounded-2xl flex items-center gap-3">
                    <Sparkles size={24} className="text-amber-400 shrink-0" />
                    <div>
                      <h5 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                        Pesan Inspirasi untuk Guru
                      </h5>
                      <p className="text-xs text-slate-200 italic mt-0.5">
                        "{guideData.kegiatanPenutup.pesanInspiratif}"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: CHECKLIST KESIAPAN & PRO TIPS GURU */}
          {(activeTab === 'all' || activeTab === 'tips') && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl print-avoid-break">
              <div 
                onClick={() => toggleStep('tips')}
                className="p-5 bg-gradient-to-r from-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                    4
                  </span>
                  <div>
                    <h3 className="text-base font-black text-white">
                      CHECKLIST KESIAPAN MENGAJAR & PRO TIPS
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hal-hal praktis yang perlu disiapkan sebelum masuk kelas agar suasana kondusif.
                    </p>
                  </div>
                </div>
                <div className="text-slate-400 no-print">
                  {expandedSteps['tips'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedSteps['tips'] && (
                <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Checklist */}
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-amber-400" />
                      Checklist Sebelum Bel Berbunyi:
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {guideData.checklistKesiapanGuru.map((check, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2.5">
                          <input 
                            type="checkbox" 
                            defaultChecked={cIdx < 2} 
                            className="mt-0.5 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                          <span>{check}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pro Tips */}
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wide flex items-center gap-2">
                      <Lightbulb size={16} className="text-indigo-400" />
                      Tips Spesial Manajemen Kelas:
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {guideData.tipsGuruSpesial.map((tip, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0">★</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Footer Links to Other Sub-Menus (no-print) */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <div>
              <h4 className="text-sm font-black text-white">Siap Mengajar atau Perlu Perangkat Lain?</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Anda juga dapat melihat dokumen lengkap RPP atau menyimulasikan pembelajaran di Kelas Interaktif AI.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onNavigateToRPPDocument}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Lihat Dokumen RPP
              </button>
              <button
                onClick={onNavigateToInteractiveClass}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <BrainCircuit size={14} /> Masuk Kelas Interaktif
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AI IDEA VARIATION POPUP */}
      {aiIdeaPrompt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in no-print">
          <div className="bg-slate-950 border border-indigo-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase">
                <Sparkles size={16} /> Inspirasi Variasi Mengajar AI
              </div>
              <button
                onClick={() => setAiIdeaPrompt(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-bold">{aiIdeaPrompt}</p>

              {isGeneratingIdea ? (
                <div className="py-8 text-center space-y-2">
                  <RefreshCw size={24} className="animate-spin mx-auto text-indigo-400" />
                  <p className="text-xs text-slate-400">Merumuskan ide aktivitas kreatif untuk anak...</p>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {aiIdeaResult}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAiIdeaPrompt(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup & Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
