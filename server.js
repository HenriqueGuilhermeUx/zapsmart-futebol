import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

// ✅ CORS: seu site oficial
app.use(cors({
  origin: ['https://zapsmart.club', 'https://www.zapsmart.club', 'http://localhost:5173'],
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors());

// Healthcheck (GET)
app.get('/', (req, res) => {
  res.type('text').send('ZapSmart Futebol online - use POST /futebol/chat');
});

// OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Resposta padrão
const reply = (response, suggestions = []) => ({ response, suggestions });

// Rota principal (POST)
app.post('/futebol/chat', async (req, res) => {
  const { message } = req.body || {};
  try {
    // IA simples (pode plugar APIs/scraping depois)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um analista de futebol objetivo, com foco em jogos, tabelas e notícias.' },
        { role: 'user', content: `Pergunta do usuário: ${message || ''}` }
      ],
      temperature: 0.5
    });

    const text = completion.choices?.[0]?.message?.content || 'Sem resposta no momento.';
    const suggestions = [
      'Jogos de hoje',
      'Classificação',
      'Artilharia',
      'Próximas rodadas',
      'Mercado de transferências'
    ];
    return res.json(reply(text, suggestions));
  } catch (e) {
    console.error('[Futebol] Erro:', e);
    return res.json(reply('🤖 Erro em Futebol. Tente novamente.', ['Jogos de hoje','Classificação']));
  }
});

// 405 educado para métodos incorretos
const methodNotAllowed = (req, res) => res.status(405).send('Method Not Allowed. Use POST.');
app.get('/futebol/chat', methodNotAllowed);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`ZapSmart Futebol rodando na porta ${port}`));
