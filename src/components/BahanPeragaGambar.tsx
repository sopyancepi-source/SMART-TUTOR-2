import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Maximize2, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Loader2, 
  Printer, 
  Download, 
  RefreshCw,
  Eye,
  Layers,
  ZoomIn
} from 'lucide-react';

export interface VisualPeragaItem {
  id: string;
  nomor: number;
  judul: string;
  kategori: 'contoh' | 'bukan_contoh' | 'stimulus' | 'peraga';
  labelBadge: string;
  penjelasanKonsep: string;
  deskripsiVisual: string;
  promptAi?: string;
  urlGambar?: string;
  pertanyaanPemantik?: string;
}

interface BahanPeragaGambarProps {
  item: {
    id: string;
    judul: string;
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
  };
  onGenerateImage: (gambarId: string, prompt: string) => Promise<string | null>;
  onOpenModal: (gambar: VisualPeragaItem) => void;
  topik: string;
  mataPelajaran: string;
  kelas: string;
  namaSekolah: string;
}

export const BahanPeragaGambar: React.FC<BahanPeragaGambarProps> = ({
  item,
  onGenerateImage,
  onOpenModal,
  topik,
  mataPelajaran,
  kelas,
  namaSekolah
}) => {
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [localImages, setLocalImages] = useState<Record<string, string>>({});
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);

  const gambarList: VisualPeragaItem[] = item.daftarGambarKoleksi && item.daftarGambarKoleksi.length > 0 
    ? item.daftarGambarKoleksi 
    : item.bahanGambar 
      ? [{
          id: 'single-img-1',
          nomor: 1,
          judul: item.bahanGambar.judulGambar || item.judul,
          kategori: 'stimulus',
          labelBadge: item.bahanGambar.labelKategori || 'MEDIA GAMBAR PERAGA',
          penjelasanKonsep: item.bahanGambar.penjelasanKonsep || item.deskripsi,
          deskripsiVisual: item.bahanGambar.deskripsiVisual || 'Gambar peraga untuk pemahaman materi.',
          promptAi: item.bahanGambar.promptAi || `Ilustrasi edukatif ${topik}`,
          urlGambar: item.bahanGambar.urlGambar
        }]
      : [];

  const handleGenerateSingle = async (gambar: VisualPeragaItem) => {
    const prompt = gambar.promptAi || `Educational illustration for ${topik}: ${gambar.judul}. Clear textbook illustration style for school children.`;
    setLoadingImages(prev => ({ ...prev, [gambar.id]: true }));
    try {
      const url = await onGenerateImage(gambar.id, prompt);
      if (url) {
        setLocalImages(prev => ({ ...prev, [gambar.id]: url }));
      }
    } catch (e) {
      console.error("Gagal generate gambar:", e);
    } finally {
      setLoadingImages(prev => ({ ...prev, [gambar.id]: false }));
    }
  };

  const handleGenerateAll = async () => {
    setIsBatchGenerating(true);
    for (const g of gambarList) {
      const currentUrl = localImages[g.id] || g.urlGambar;
      if (!currentUrl) {
        await handleGenerateSingle(g);
      }
    }
    setIsBatchGenerating(false);
  };

  return (
    <div className="p-5 md:p-8 space-y-6">
      
      {/* Header Info Banner on Screen */}
      <div className="no-print space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Media Visual Berbasis RPP ({gambarList.length} Gambar Peraga)
            </span>
            <p className="text-xs text-slate-300 mt-1">{item.deskripsi}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateAll}
              disabled={isBatchGenerating}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isBatchGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{isBatchGenerating ? "Membuat Semua Gambar..." : "Generate Semua Gambar AI Sekaligus 🎨"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header on Print View */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{namaSekolah || "SEKOLAH / MADRASAH"}</p>
        <h2 className="text-base font-black uppercase text-slate-900">SET GAMBAR PERAGA PEMBELAJARAN (CONTOH & BUKAN CONTOH)</h2>
        <p className="text-xs text-slate-700 mt-0.5">Mata Pelajaran: <strong>{mataPelajaran}</strong> | Topik: <strong>{topik}</strong> | Kelas: <strong>{kelas}</strong></p>
        <p className="text-[10px] text-slate-500 italic mt-1">✂️ Petunjuk Guru: Cetak lembar ini dan gunting mengikuti garis kotak putus-putus untuk dibagikan kepada kelompok siswa atau ditempelkan di papan tulis.</p>
      </div>

      {/* Grid of Images / Flashcards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
        {gambarList.map((gambar, idx) => {
          const imageUrl = localImages[gambar.id] || gambar.urlGambar;
          const isImgLoading = loadingImages[gambar.id] || false;
          const isExample = gambar.kategori === 'contoh';
          const isNonExample = gambar.kategori === 'bukan_contoh';

          return (
            <div 
              key={gambar.id || idx}
              className={`bg-slate-900 print:bg-white text-slate-100 print:text-black rounded-2xl border-2 overflow-hidden shadow-lg transition-all print:shadow-none flex flex-col justify-between print-avoid-break ${
                isExample 
                  ? 'border-emerald-500/50 print:border-emerald-600' 
                  : isNonExample 
                    ? 'border-rose-500/50 print:border-rose-600' 
                    : 'border-indigo-500/50 print:border-slate-800'
              }`}
            >
              {/* Card Top Badge */}
              <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
                isExample 
                  ? 'bg-emerald-950/60 print:bg-emerald-50 border-emerald-500/30 print:border-emerald-300' 
                  : isNonExample 
                    ? 'bg-rose-950/60 print:bg-rose-50 border-rose-500/30 print:border-rose-300' 
                    : 'bg-indigo-950/60 print:bg-slate-100 border-indigo-500/30 print:border-slate-300'
              }`}>
                <div className="flex items-center gap-2">
                  {isExample ? (
                    <span className="flex items-center gap-1 text-[11px] font-black uppercase text-emerald-400 print:text-emerald-800 bg-emerald-500/20 print:bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      <CheckCircle2 size={13} /> {gambar.labelBadge || "CONTOH (EXAMPLE)"}
                    </span>
                  ) : isNonExample ? (
                    <span className="flex items-center gap-1 text-[11px] font-black uppercase text-rose-400 print:text-rose-800 bg-rose-500/20 print:bg-rose-100 px-2.5 py-0.5 rounded-md">
                      <XCircle size={13} /> {gambar.labelBadge || "BUKAN CONTOH (NON-EXAMPLE)"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-black uppercase text-indigo-400 print:text-slate-800 bg-indigo-500/20 print:bg-slate-200 px-2.5 py-0.5 rounded-md">
                      <Layers size={13} /> {gambar.labelBadge || `GAMBAR ${idx + 1}`}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 print:text-slate-600">
                    #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 no-print">
                  {imageUrl && (
                    <button
                      onClick={() => handleGenerateSingle(gambar)}
                      disabled={isImgLoading}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Generate Ulang Variasi Visual"
                    >
                      <RefreshCw size={13} className={isImgLoading ? "animate-spin" : ""} />
                    </button>
                  )}
                  <button
                    onClick={() => onOpenModal({ ...gambar, urlGambar: imageUrl })}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
                    title="Tampilkan Layar Penuh (Mode Proyektor)"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>

              {/* Picture Container */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-sm text-white print:text-black mb-2">
                    {gambar.judul}
                  </h4>

                  {/* Image Display or Fallback */}
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300 min-h-[170px] max-h-[220px] flex items-center justify-center">
                    {imageUrl ? (
                      <div className="relative w-full h-full group flex items-center justify-center bg-slate-950/90">
                        <img 
                          src={imageUrl} 
                          alt={gambar.judul}
                          referrerPolicy="no-referrer"
                          className="w-full h-44 object-contain cursor-pointer transition-transform group-hover:scale-105"
                          onClick={() => onOpenModal({ ...gambar, urlGambar: imageUrl })}
                        />
                        <div 
                          onClick={() => onOpenModal({ ...gambar, urlGambar: imageUrl })}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer no-print"
                        >
                          <ZoomIn size={16} /> Perbesar Gambar
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 text-center space-y-2.5 w-full">
                        <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center ${
                          isExample 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : isNonExample 
                              ? 'bg-rose-500/20 text-rose-400' 
                              : 'bg-indigo-500/20 text-indigo-400'
                        }`}>
                          {isImgLoading ? (
                            <Loader2 size={24} className="animate-spin" />
                          ) : (
                            <ImageIcon size={24} />
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-[11px] text-slate-300 print:text-black font-semibold leading-relaxed px-2">
                            "{gambar.deskripsiVisual}"
                          </p>
                          <p className="text-[10px] text-slate-500 italic no-print">
                            {isImgLoading ? "Sedang melukis gambar dengan AI..." : "Visual ilustrasi edukatif siap digenerate"}
                          </p>
                        </div>

                        {/* Generate Single Image Button */}
                        <div className="pt-1 no-print">
                          <button
                            onClick={() => handleGenerateSingle(gambar)}
                            disabled={isImgLoading}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isImgLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            <span>{isImgLoading ? "Proses Melukis..." : "Generate Gambar AI 🎨"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conceptual Explanation Box */}
                <div className="mt-3 space-y-2 pt-2 border-t border-slate-800 print:border-slate-300">
                  <div className="p-2.5 bg-slate-950/60 print:bg-slate-100 rounded-xl text-xs space-y-1 border border-slate-800/80 print:border-slate-300">
                    <p className="text-[10px] font-black uppercase text-indigo-400 print:text-slate-800 flex items-center gap-1">
                      <HelpCircle size={12} /> Penjelasan Konsep ({isExample ? 'Kenapa Contoh' : isNonExample ? 'Kenapa Bukan Contoh' : 'Fungsi Peraga'}):
                    </p>
                    <p className="text-slate-300 print:text-black text-[11px] leading-relaxed">
                      {gambar.penjelasanKonsep}
                    </p>
                  </div>

                  {gambar.pertanyaanPemantik && (
                    <p className="text-[11px] text-amber-300 print:text-black italic font-medium px-1">
                      ❓ <strong>Pertanyaan ke Siswa:</strong> "{gambar.pertanyaanPemantik}"
                    </p>
                  )}
                </div>
              </div>

              {/* Cut line helper for printing */}
              <div className="hidden print:block text-center text-[9px] text-slate-400 border-t border-dashed border-slate-400 py-1">
                ✂️ Gunting mengikuti garis luar kotak ini
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
