import express from 'express';
import path from 'path';
import { GoogleGenAI, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Helper to lazily initialize GoogleGenAI with server API key
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Gemini Content Generation Proxy
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { prompt, systemPrompt, useSearch, imageData, history, isJson } = req.body;
      const ai = getAi();

      const contents: any[] = [];

      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text || '' }],
          });
        }
      }

      const currentParts: any[] = [{ text: prompt || '' }];
      if (imageData) {
        const mimeMatch = imageData.match(/^data:([a-zA-Z0-9.+/-]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : (imageData.startsWith('JVBERi0') ? 'application/pdf' : 'image/png');
        const base64Data = imageData.replace(/^data:[^;]+;base64,/, '');
        currentParts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }

      contents.push({
        role: 'user',
        parts: currentParts,
      });

      const config: any = {};
      if (systemPrompt) {
        config.systemInstruction = systemPrompt;
      }
      if (isJson) {
        config.responseMimeType = 'application/json';
      }
      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      // Multi-model fallback sequence to guard against 503 high demand / 429 rate limit
      const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      let lastError: any = null;
      let generatedText: string | null = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: config,
          });
          if (response.text) {
            generatedText = response.text;
            break;
          }
        } catch (mErr: any) {
          console.warn(`Model ${modelName} failed, attempting fallback model. Reason:`, mErr?.message || mErr);
          lastError = mErr;
          // Pause briefly before fallback attempt
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (!generatedText) {
        throw lastError || new Error('Layanan AI sedang mengalami lonjakan antrean. Silakan coba sesaat lagi.');
      }

      return res.json({ text: generatedText });
    } catch (err: any) {
      console.error('Error in /api/gemini/generate:', err);
      return res.status(500).json({ error: err.message || 'Error generating content with Gemini' });
    }
  });

  // Gemini Image Generation Proxy with Smart Educational Visual (SVG) Fallback
  app.post('/api/gemini/generate-image', async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getAi();

      let imageUrl: string | null = null;

      // 1. Coba panggil model gambar Imagen/Gemini (jika project/API key memiliki kuota berbayar)
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: '1:1',
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (imgErr: any) {
        console.warn('Model gambar bitmap tidak tersedia atau kuota free tier 0, beralih ke Smart Educational SVG Generator. Reason:', imgErr?.message || imgErr);
      }

      // 2. Jika model gambar bitmap kuotanya 0 atau gagal, generate Media Peraga Visual Edukatif (SVG) menggunakan gemini-3.8-flash
      if (!imageUrl) {
        try {
          const svgPrompt = `Anda adalah Ahli Desain Grafis Media Peraga Sains dan Edukasi Sekolah di Indonesia.
Tugas Anda: Buat SATU kode SVG murni (width="600" height="500" viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg") sebagai gambar peraga pembelajaran visual untuk:
"${prompt}"

KRITERIA GAMBAR PERAGA EDUKATIF:
1. Visual menarik, warna cerah bergradasi, jelas dan proporsional untuk siswa sekolah (SD/SMP/SMA).
2. Tampilkan objek utama materi (misal: daun segar dengan klorofil hijau, sel tumbuhan, sinar matahari, panah fotosintesis, dsb).
3. Berikan judul visual di bagian atas dan label keterangan konsep kunci yang terbaca jelas.
4. Gunakan elemen SVG standar (rect, circle, ellipse, path, line, text, polygon, defs, linearGradient, marker).
5. Background bersih bergradasi lembut atau cerah.
6. Kembalikan HANYA KODE SVG MURNI tanpa markdown (tanpa \`\`\`xml atau \`\`\`svg). Awali langsung dengan <svg dan akhiri dengan </svg>.`;

          const svgResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [{ parts: [{ text: svgPrompt }] }],
          });

          let cleanSvg = svgResponse.text?.trim() || '';
          cleanSvg = cleanSvg.replace(/^```(?:svg|xml)?\s*/i, '').replace(/\s*```$/, '').trim();

          if (!cleanSvg.startsWith('<svg')) {
            const m = cleanSvg.match(/<svg[\s\S]*<\/svg>/i);
            if (m) cleanSvg = m[0];
          }

          if (cleanSvg.includes('<svg') && cleanSvg.includes('</svg>')) {
            const base64Svg = Buffer.from(cleanSvg, 'utf-8').toString('base64');
            imageUrl = `data:image/svg+xml;base64,${base64Svg}`;
          }
        } catch (svgErr: any) {
          console.warn('Fallback SVG AI mengalami error:', svgErr?.message || svgErr);
        }
      }

      // 3. Fallback Mandiri (Offline Safe Educational Card) agar gambar TIDAK PERNAH kosong
      if (!imageUrl) {
        const cleanPrompt = (prompt || 'Media Visual Edukatif').replace(/["<>]/g, '').slice(0, 50);
        const safeSvg = `<svg width="600" height="500" viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0f172a" />
              <stop offset="100%" stop-color="#1e1b4b" />
            </linearGradient>
            <linearGradient id="leafG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#10b981" />
              <stop offset="100%" stop-color="#047857" />
            </linearGradient>
          </defs>
          <rect width="600" height="500" rx="20" fill="url(#bgG)" stroke="#334155" stroke-width="2"/>
          <circle cx="300" cy="210" r="100" fill="#065f46" opacity="0.4"/>
          <path d="M300 120 C380 160, 380 260, 300 300 C220 260, 220 160, 300 120 Z" fill="url(#leafG)"/>
          <line x1="300" y1="130" x2="300" y2="290" stroke="#a7f3d0" stroke-width="3"/>
          <line x1="300" y1="170" x2="340" y2="150" stroke="#a7f3d0" stroke-width="2"/>
          <line x1="300" y1="210" x2="350" y2="190" stroke="#a7f3d0" stroke-width="2"/>
          <line x1="300" y1="250" x2="340" y2="230" stroke="#a7f3d0" stroke-width="2"/>
          <line x1="300" y1="170" x2="260" y2="150" stroke="#a7f3d0" stroke-width="2"/>
          <line x1="300" y1="210" x2="250" y2="190" stroke="#a7f3d0" stroke-width="2"/>
          <line x1="300" y1="250" x2="260" y2="230" stroke="#a7f3d0" stroke-width="2"/>
          <circle cx="460" cy="90" r="40" fill="#facc15" opacity="0.9"/>
          <text x="300" y="60" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#38bdf8">MEDIA PERAGA PEMBELAJARAN</text>
          <text x="300" y="370" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="16" fill="#f8fafc">${cleanPrompt}</text>
          <rect x="60" y="410" width="480" height="46" rx="10" fill="#1e293b" stroke="#334155"/>
          <text x="300" y="439" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Bahan Peraga Edukatif Siap Digunakan dalam Pembelajaran</text>
        </svg>`;
        const base64Safe = Buffer.from(safeSvg, 'utf-8').toString('base64');
        imageUrl = `data:image/svg+xml;base64,${base64Safe}`;
      }

      return res.json({ imageUrl, success: true });
    } catch (err: any) {
      console.error('Error in /api/gemini/generate-image:', err);
      return res.status(500).json({ error: err.message || 'Error generating image' });
    }
  });

  // Gemini Text-To-Speech Proxy
  app.post('/api/gemini/tts', async (req, res) => {
    try {
      const { text } = req.body;
      const ai = getAi();

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Aoede' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        return res.status(400).json({ error: 'No audio returned' });
      }

      return res.json({ base64Audio });
    } catch (err: any) {
      console.error('Error in /api/gemini/tts:', err);
      return res.status(500).json({ error: err.message || 'TTS generation failed' });
    }
  });

  // Vite development middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
