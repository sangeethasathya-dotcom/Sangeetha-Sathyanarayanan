import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Server-side Gemini AI weather briefing API endpoint
  app.post('/api/ai-summary', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured',
          fallbackMessage: 'AI Weather Briefing requires GEMINI_API_KEY secret.',
        });
      }

      const { location, current, daily } = req.body;
      if (!location || !current) {
        return res.status(400).json({ error: 'Missing weather context payload' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `
Act as an expert Chief Meteorologist & Lifestyle Advisor.
Provide a concise, engaging, and practical AI Weather Intelligence Briefing for ${location.name}${location.country ? `, ${location.country}` : ''}.

Current Weather Snapshot:
- Temperature: ${current.temperature}°C (Feels like ${current.apparentTemperature}°C)
- Humidity: ${current.humidity}%
- Wind Speed: ${current.windSpeed} km/h
- Precipitation: ${current.precipitation} mm
- Condition Code: ${current.weatherCode}

Upcoming 5-Day Outlook:
${daily?.slice(0, 5).map((d: any) => `- ${d.dayName}: Max ${d.tempMax}°C, Min ${d.tempMin}°C, Rain Chance ${d.precipitationProbabilityMax}%`).join('\n')}

Structure your response cleanly using concise Markdown bullets:
- **Atmospheric Conditions**: 2-sentence summary of today's weather feel and atmosphere.
- **Outfit & Gear Recommendation**: Exact clothes, footwear, umbrella, or sunglasses to pack today.
- **Activity & Timing Guidance**: Ideal time window today for outdoor activities, workout, or commute warnings.

Keep it crisp, helpful, professional, and max 180 words.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      return res.json({
        summary: response.text || 'AI briefing successfully generated.',
      });
    } catch (err: any) {
      console.error('Error generating AI weather summary:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate AI weather briefing.',
      });
    }
  });

  // Vite development middleware vs production static distribution
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
    console.log(`Weather Intelligence full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
