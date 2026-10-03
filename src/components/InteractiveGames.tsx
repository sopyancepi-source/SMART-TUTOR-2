import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Trophy, 
  RotateCcw, 
  Send, 
  Play, 
  Youtube, 
  HelpCircle,
  ArrowRight,
  Layers,
  Award,
  Camera,
  Upload,
  Palette
} from 'lucide-react';

export interface MakeAMatchPair {
  q: string;
  a: string;
}

export interface MakeAMatchProps {
  title: string;
  pairs: MakeAMatchPair[];
  onComplete?: (resultSummary: string) => void;
}

export const MakeAMatchGame: React.FC<MakeAMatchProps> = ({ title, pairs, onComplete }) => {
  const [questions, setQuestions] = useState<{ id: string; text: string; pairId: number }[]>([]);
  const [answers, setAnswers] = useState<{ id: string; text: string; pairId: number }[]>([]);
  
  const [selectedQ, setSelectedQ] = useState<{ id: string; pairId: number } | null>(null);
  const [selectedA, setSelectedA] = useState<{ id: string; pairId: number } | null>(null);
  
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [wrongMatch, setWrongMatch] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    // Initialize & Shuffle cards
    const qList = pairs.map((p, idx) => ({
      id: `q-${idx}`,
      text: p.q,
      pairId: idx
    }));
    const aList = pairs.map((p, idx) => ({
      id: `a-${idx}`,
      text: p.a,
      pairId: idx
    }));

    // Shuffle both
    setQuestions([...qList].sort(() => Math.random() - 0.5));
    setAnswers([...aList].sort(() => Math.random() - 0.5));
    setMatchedPairIds([]);
    setAttempts(0);
    setIsCompleted(false);
  }, [pairs]);

  const handleSelectQuestion = (q: { id: string; text: string; pairId: number }) => {
    if (matchedPairIds.includes(q.pairId)) return;
    setSelectedQ(q);
    
    if (selectedA) {
      checkMatch(q.pairId, selectedA.pairId);
    }
  };

  const handleSelectAnswer = (a: { id: string; text: string; pairId: number }) => {
    if (matchedPairIds.includes(a.pairId)) return;
    setSelectedA(a);

    if (selectedQ) {
      checkMatch(selectedQ.pairId, a.pairId);
    }
  };

  const checkMatch = (qPairId: number, aPairId: number) => {
    setAttempts(prev => prev + 1);
    if (qPairId === aPairId) {
      // Match found!
      const newMatched = [...matchedPairIds, qPairId];
      setMatchedPairIds(newMatched);
      setSelectedQ(null);
      setSelectedA(null);

      if (newMatched.length === pairs.length) {
        setIsCompleted(true);
      }
    } else {
      // Wrong match
      setWrongMatch(true);
      setTimeout(() => {
        setSelectedQ(null);
        setSelectedA(null);
        setWrongMatch(false);
      }, 900);
    }
  };

  const resetGame = () => {
    setMatchedPairIds([]);
    setSelectedQ(null);
    setSelectedA(null);
    setAttempts(0);
    setIsCompleted(false);
    setQuestions([...questions].sort(() => Math.random() - 0.5));
    setAnswers([...answers].sort(() => Math.random() - 0.5));
  };

  const sendResultToTeacher = () => {
    if (onComplete) {
      const summary = `Saya sudah menyelesaikan Game Make a Match "${title}" dengan ${attempts} kali percobaan dan berhasil mencocokkan ${pairs.length}/${pairs.length} pasangan kartu! 🎉`;
      onComplete(summary);
    }
  };

  return (
    <div className="w-full my-4 bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 md:p-6 shadow-2xl text-slate-100">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Permainan Edukasi</span>
            <h4 className="text-base font-black text-white">{title || "Make a Match (Jodohkan Kartu)"}</h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            Mencoba: <strong className="text-amber-400">{attempts}</strong>
          </span>
          <button 
            onClick={resetGame}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer"
            title="Ulang Game"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <p className="text-xs md:text-sm text-slate-300 font-medium mb-5">
        📌 <strong>Petunjuk:</strong> Klik 1 kartu soal di sebelah kiri, lalu klik 1 kartu jawaban yang cocok di sebelah kanan!
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Left Column: Questions */}
        <div className="space-y-3">
          <h5 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5 mb-1">
            <HelpCircle size={14} className="text-amber-400" /> KOLOM SOAL / KONSEP
          </h5>
          {questions.map((q) => {
            const isMatched = matchedPairIds.includes(q.pairId);
            const isSelected = selectedQ?.id === q.id;

            return (
              <button
                key={q.id}
                disabled={isMatched}
                onClick={() => handleSelectQuestion(q)}
                className={`w-full text-left p-4 md:p-4.5 rounded-2xl border text-xs md:text-sm font-bold transition-all flex items-center justify-between cursor-pointer leading-relaxed ${
                  isMatched 
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 opacity-90 cursor-default shadow-sm' 
                    : isSelected 
                      ? wrongMatch && selectedQ?.id === q.id
                        ? 'bg-red-950/80 border-red-500 text-red-100 animate-shake'
                        : 'bg-indigo-600 border-indigo-300 text-white shadow-xl shadow-indigo-600/30 scale-[1.01]' 
                      : 'bg-slate-900 border-slate-800 text-slate-100 hover:border-indigo-500/60 hover:bg-slate-850'
                }`}
              >
                <span>{q.text}</span>
                {isMatched && <CheckCircle2 size={18} className="text-emerald-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>

        {/* Right Column: Answers */}
        <div className="space-y-3">
          <h5 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={14} className="text-emerald-400" /> KOLOM PASANGAN / JAWABAN
          </h5>
          {answers.map((a) => {
            const isMatched = matchedPairIds.includes(a.pairId);
            const isSelected = selectedA?.id === a.id;

            return (
              <button
                key={a.id}
                disabled={isMatched}
                onClick={() => handleSelectAnswer(a)}
                className={`w-full text-left p-4 md:p-4.5 rounded-2xl border text-xs md:text-sm font-bold transition-all flex items-center justify-between cursor-pointer leading-relaxed ${
                  isMatched 
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 opacity-90 cursor-default shadow-sm' 
                    : isSelected 
                      ? wrongMatch && selectedA?.id === a.id
                        ? 'bg-red-950/80 border-red-500 text-red-100 animate-shake'
                        : 'bg-indigo-600 border-indigo-300 text-white shadow-xl shadow-indigo-600/30 scale-[1.01]' 
                      : 'bg-slate-900 border-slate-800 text-slate-100 hover:border-indigo-500/60 hover:bg-slate-850'
                }`}
              >
                <span>{a.text}</span>
                {isMatched && <CheckCircle2 size={18} className="text-emerald-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Victory Banner */}
      {isCompleted && (
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-emerald-900/80 to-slate-900 border border-emerald-500/40 text-center animate-in zoom-in duration-300 space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
            <Trophy size={28} className="animate-bounce" />
          </div>
          <div>
            <h5 className="text-sm font-black text-emerald-300 uppercase tracking-wider">Hore! Semua Kartu Berhasil Terjodohkan!</h5>
            <p className="text-xs text-slate-300 mt-0.5">Kamu menyelesaikan permainan dalam {attempts} percobaan!</p>
          </div>
          {onComplete && (
            <button
              onClick={sendResultToTeacher}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Send size={14} /> Kirim Hasil Ke Guru GEM
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export interface InteractiveQuizProps {
  title: string;
  question: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
  onSelectOption?: (optionText: string) => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  title,
  question,
  options,
  correctIndex,
  explanation,
  onSelectOption
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChoose = (idx: number) => {
    if (submitted) return;
    setSelected(idx);
    setSubmitted(true);
  };

  const handleSendToChat = () => {
    if (selected !== null && onSelectOption) {
      const optionText = options[selected];
      onSelectOption(`Jawaban saya untuk kuis "${title}": ${optionText}`);
    }
  };

  return (
    <div className="w-full my-4 bg-slate-950 border border-amber-500/30 rounded-2xl p-4 md:p-5 shadow-2xl text-slate-100">
      <div className="flex items-center gap-2.5 mb-3 border-b border-slate-800 pb-2.5">
        <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
          <Award size={18} />
        </div>
        <div>
          <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">Kuis Interaktif</span>
          <h4 className="text-sm font-black text-white">{title || "Uji Pemahaman Cepat"}</h4>
        </div>
      </div>

      <p className="text-xs font-bold text-slate-200 leading-relaxed mb-4">{question}</p>

      <div className="space-y-2 mb-4">
        {options.map((opt, i) => {
          const isCorrect = correctIndex === i;
          const isChosen = selected === i;

          let btnClass = "bg-slate-900 border-slate-800 text-slate-200 hover:border-amber-500/50";
          if (submitted) {
            if (isCorrect) {
              btnClass = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold";
            } else if (isChosen) {
              btnClass = "bg-red-950/80 border-red-500 text-red-200 font-bold";
            } else {
              btnClass = "bg-slate-900/50 border-slate-800 text-slate-500 opacity-60";
            }
          }

          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => handleChoose(i)}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                  submitted && isCorrect 
                    ? 'bg-emerald-500 text-white' 
                    : submitted && isChosen 
                      ? 'bg-red-500 text-white' 
                      : 'bg-slate-800 text-slate-300'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="font-semibold">{opt}</span>
              </div>

              {submitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
              {submitted && isChosen && !isCorrect && <XCircle size={16} className="text-red-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className="space-y-3 animate-in fade-in duration-300">
          {explanation && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              💡 <strong>Penjelasan:</strong> {explanation}
            </div>
          )}

          {onSelectOption && (
            <button
              onClick={handleSendToChat}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Send size={14} /> Kirim Jawaban Ke Guru GEM
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export interface ChoiceGameProps {
  title: string;
  scenario: string;
  choices: string[];
  onSelectChoice: (choice: string) => void;
}

export const ChoiceGame: React.FC<ChoiceGameProps> = ({ title, scenario, choices, onSelectChoice }) => {
  return (
    <div className="w-full my-4 bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 md:p-5 shadow-2xl text-slate-100">
      <div className="flex items-center gap-2.5 mb-3 border-b border-slate-800 pb-2.5">
        <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
          <Layers size={18} />
        </div>
        <div>
          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Aktivitas Keputusan</span>
          <h4 className="text-sm font-black text-white">{title || "Pilih Langkah Azkayra"}</h4>
        </div>
      </div>

      <p className="text-xs text-slate-200 font-medium leading-relaxed mb-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
        💬 {scenario}
      </p>

      <div className="space-y-2">
        {choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => onSelectChoice(choice)}
            className="w-full text-left p-3.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-400 text-indigo-200 hover:text-white font-bold text-xs transition-all flex items-center justify-between group cursor-pointer"
          >
            <span>{choice}</span>
            <ArrowRight size={14} className="text-indigo-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </div>
  );
};

export interface EmbeddedYouTubeProps {
  queryOrUrl?: string;
  searchTopic?: string;
}

export const EmbeddedYouTube: React.FC<EmbeddedYouTubeProps> = ({ queryOrUrl, searchTopic }) => {
  const target = queryOrUrl || searchTopic || "";
  let videoId = "";
  if (target.includes("youtube.com/watch?v=")) {
    videoId = target.split("v=")[1]?.split("&")[0] || "";
  } else if (target.includes("youtu.be/")) {
    videoId = target.split("youtu.be/")[1]?.split("?")[0] || "";
  }

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(target.replace(/^https?:\/\/[^\s]+/, ''))}`;

  return (
    <div className="w-full my-3 rounded-2xl overflow-hidden border border-red-500/30 bg-slate-950 shadow-xl">
      <div className="p-2.5 bg-slate-900 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-600 rounded-lg text-white">
            <Youtube size={16} />
          </div>
          <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Media Pembelajaran Video</span>
        </div>
        <a 
          href={searchUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-950/40 px-2 py-1 rounded-lg border border-red-500/20"
        >
          <span>Buka di YouTube</span>
          <Play size={10} />
        </a>
      </div>

      {videoId ? (
        <div className="relative aspect-video w-full">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}`} 
            title="Video Pembelajaran" 
            className="w-full h-full border-0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen 
          />
        </div>
      ) : (
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center text-center space-y-2">
          <div className="p-3 bg-red-600/10 text-red-400 rounded-full border border-red-500/20">
            <Youtube size={28} />
          </div>
          <div>
            <h5 className="text-xs font-black text-slate-200 uppercase">Video Pembelajaran YouTube</h5>
            <p className="text-[11px] text-slate-400 max-w-sm mt-0.5">Topik: "{target.replace(/https?:\/\/[^\s]+/g, '').trim() || target}"</p>
          </div>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg transition-all inline-flex items-center gap-2 uppercase tracking-wider"
          >
            <Play size={14} /> Tonton Video Sekarang
          </a>
        </div>
      )}
    </div>
  );
};

export interface ProjectTaskProps {
  title: string;
  description: string;
  instruction?: string;
  onTriggerUpload?: () => void;
}

export const ProjectTask: React.FC<ProjectTaskProps> = ({
  title,
  description,
  instruction,
  onTriggerUpload
}) => {
  return (
    <div className="w-full my-4 bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 md:p-5 shadow-2xl text-slate-100">
      <div className="flex items-center gap-2.5 mb-3 border-b border-slate-800 pb-2.5">
        <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
          <Palette size={18} />
        </div>
        <div>
          <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Tugas Proyek & Kreativitas</span>
          <h4 className="text-sm font-black text-white">{title || "Aktivitas Proyek Unjuk Kerja"}</h4>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          🎨 <strong>Deskripsi Tugas:</strong> {description}
        </p>

        {instruction && (
          <p className="text-[11px] text-amber-300 font-semibold bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/20">
            📌 <strong>Langkah Kerjanya:</strong> {instruction}
          </p>
        )}
      </div>

      <div className="pt-1">
        <button
          onClick={onTriggerUpload}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <Camera size={16} /> Foto & Upload Hasil Karya Ke Guru GEM
        </button>
      </div>
    </div>
  );
};
