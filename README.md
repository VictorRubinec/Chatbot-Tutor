# Chat Tutor v2

Um tutor de IA interativo com múltiplos modelos, modos de ensino personalizados, transcrição de áudio e síntese de fala. Desenvolvido como portfólio com frontend em **GitHub Pages** e backend em **Vercel**.

## 🎯 Características

- **2 Provedores de IA Reais**: Groq e OpenRouter com suporte a múltiplos modelos
- **2 Modos de Ensino**:
  - **Tutor Direto**: Respostas diretas e objetivas
  - **Tutor Socrático**: Ensino baseado em perguntas para incentivar pensamento crítico
- **Seleção Dinâmica de Modelos**: Mude de provedor e modelo instantaneamente
- **Transcrição de Áudio (STT)**: Converta fala em texto usando Groq Whisper
- **Síntese de Fala (TTS)**: Ouça as respostas da IA com síntese de voz nativa do navegador
- **Interface Responsiva**: Funciona perfeitamente em desktop, tablet e mobile
- **Fallback Automático**: Se um modelo ficar indisponível, tenta outros automaticamente
- **Sem Chaves de API no Frontend**: Todas as chaves sensíveis permanecem seguras no backend
- **Chat Persistente**: Histórico salvo em `localStorage`

## 🏗️ Arquitetura

```text
.
├── chat-tutor/                          # Frontend estático (GitHub Pages)
│   ├── index.html                       # Estrutura HTML semântica
│   ├── css/
│   │   └── style.css                    # Estilos modernos com CSS Grid, animações
│   └── scripts/
│       ├── chatbot.js                   # Lógica principal (estado, renderização, eventos)
│       ├── api-client.js                # Cliente HTTP para comunicação com backend
│       ├── modes.js                     # Configuração de modos (Direto/Socrático)
│       ├── voice.js                     # TTS + gravação de áudio
│       └── config.js                    # Constantes globais
│
├── api/                                 # Backend Node/Express (Vercel)
│   ├── index.js                         # Entry point para Vercel
│   ├── package.json                     # Dependências
│   ├── vercel.json                      # Configuração de deploy Vercel
│   ├── .env.example                     # Template de variáveis de ambiente
│   └── src/
│       ├── server.js                    # Aplicação Express com rotas
│       ├── config/
│       │   └── providers.js             # Catálogo de provedores e modelos
│       └── services/
│           ├── modes.js                 # Prompts do sistema
│           ├── chat-service.js          # Lógica de chat com fallback
│           └── transcribe-service.js    # Integração Groq Whisper
│
└── README.md                            # Documentação do projeto
```

## 🚀 Stack Tecnológico

### Frontend
- **HTML5** com semântica acessível
- **CSS3** com Grid Layout, Flexbox, variáveis CSS, gradientes e animações
- **JavaScript ES6+** vanilla (sem frameworks)
- **Web APIs**: 
  - `MediaRecorder` para gravação de áudio
  - `SpeechSynthesisUtterance` para síntese de voz
  - `localStorage` para persistência

### Backend
- **Node.js** com Express.js
- **APIs de IA**:
  - [Groq API](https://console.groq.com) - Inferência rápida + Whisper para STT
  - [OpenRouter API](https://openrouter.ai) - Agregador de múltiplos modelos
- **CORS** para comunicação segura entre domínios
- **Dotenv** para gerenciamento de variáveis de ambiente

### Deploy
- **Frontend**: GitHub Pages (automático via main branch)
- **Backend**: Vercel (serverless functions)

## 📋 Modelos Disponíveis

### Groq (Rápido e Gratuito)
- `mixtral-8x7b-32768`
- `llama-2-70b-chat`
- `llama2-70b-4096`

### OpenRouter (Diversos)
- `meta-llama/llama-3-70b-instruct`
- `meta-llama/llama-2-70b-chat-hf`
- `mistralai/mistral-large`
- E mais...

**Nota**: Os modelos disponíveis podem variar. O backend possui fallback automático se um modelo ficar indisponível.

## 🛠️ Configuração Local

### Pré-requisitos
- Node.js 18+
- Git
- Chaves de API:
  - [Groq API Key](https://console.groq.com)
  - [OpenRouter API Key](https://openrouter.ai)

### Backend

1. Clone o repositório:
```bash
git clone https://github.com/VictorRubinec/Chatbot-Tutor.git
cd Chatbot-Tutor/api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite `.env` com suas chaves:
```
GROQ_API_KEY=seu_groq_api_key
OPENROUTER_API_KEY=seu_openrouter_api_key
PORT=3001
NODE_ENV=development
```

4. Inicie o servidor:
```bash
npm start
```

O backend estará disponível em `http://localhost:3001`

### Frontend (Desenvolvimento)

1. Navegue até a pasta do frontend:
```bash
cd ../chat-tutor
```

2. Inicie um servidor HTTP simples (exemplo com Python):
```bash
python -m http.server 8000
# ou Node.js
npx http-server -p 8000
```

3. Abra `http://localhost:8000` no navegador

## 🔌 Endpoints da API

### Saúde
```
GET /health
Resposta: { "status": "ok" }
```

### Listar Provedores
```
GET /providers
Resposta: ["groq", "openrouter"]
```

### Listar Modelos
```
GET /models?provider=groq
Resposta: [
  { "id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B" },
  ...
]
```

### Chat
```
POST /chat
Body: {
  "provider": "groq",
  "model": "mixtral-8x7b-32768",
  "mode": "direct",
  "messages": [
    { "role": "user", "content": "Olá!" }
  ]
}
Resposta: { "response": "Olá! Como posso ajudá-lo?" }
```

### Transcrição de Áudio
```
POST /transcribe
Body: FormData com arquivo de áudio
Resposta: { "text": "Texto transcrito" }
```

## 🎨 Interface do Usuário

### Layout Principal
- **Header**: Logo, descrição e botão de configurações
- **Chat History**: Área centralizada com mensagens alinhadas
- **Composer**: Barra fixa inferior com:
  - Textarea para entrada de mensagens (esquerda)
  - Seletores de Provedor/Modelo/Personalidade (centro, dispostos verticalmente)
  - Botões Escutar/Enviar (direita, dispostos verticalmente)

### Painel de Configuração
- Toggle de Voz (ON/OFF)
- Botão Limpar Chat
- Crédito do desenvolvedor com link para portfólio

### Responsividade
- **Desktop**: Layout completo com barra lateral
- **Tablet**: Seletores reorganizados
- **Mobile**: Stack vertical, botões maiores para toque

## 🔒 Segurança

- **Sem Chaves Expostas**: Todas as chaves de API ficam no backend (variáveis de ambiente Vercel)
- **CORS Configurado**: Frontend pode se comunicar com backend de forma segura
- **Sanitização de Respostas**: Texto interno da IA é filtrado (remove `<system-reminder>`, metadados)
- **Validação de Input**: Mensagens são validadas no backend antes do processamento

## 📊 Fluxo de Mensagens

```
[Usuário digita ou grava áudio]
         ↓
[Frontend envia POST /chat ou /transcribe]
         ↓
[Backend recebe, valida, seleciona modelo]
         ↓
[Backend chama Groq ou OpenRouter]
         ↓
[Se modelo indisponível, tenta outro]
         ↓
[Backend sanitiza resposta]
         ↓
[Frontend recebe resposta via JSON]
         ↓
[Frontend renderiza mensagem]
         ↓
[Se TTS ativado, sintetiza áudio]
```

## 🧪 Testando Localmente

1. **Chat Simples**:
   - Digite uma mensagem e clique em "Enviar"
   - Resposta deve aparecer em poucos segundos

2. **Mude de Modelo**:
   - Selecione outro provedor no dropdown
   - Modelos devem carregar automaticamente
   - Chat continua funcionando com novo modelo

3. **Áudio**:
   - Clique em "Escutar" e fale
   - Mensagem deve aparecer transcrita
   - Com TTS ON, resposta é sintetizada

4. **Fallback**:
   - Se um modelo falhar, backend tenta outro automaticamente
   - Usuário recebe aviso no chat (em desenvolvimento)

## 📦 Deploy

### Backend (Vercel)

1. Conecte seu repositório GitHub no Vercel
2. Configure variáveis de ambiente:
   - `GROQ_API_KEY`
   - `OPENROUTER_API_KEY`
   - `CORS_ORIGIN` (ex: `https://VictorRubinec.github.io/Chatbot-Tutor`)
3. Deploy automático ao fazer push para `main`

### Frontend (GitHub Pages)

1. Ative GitHub Pages nas configurações do repositório
2. Selecione `main` como branch source
3. URL: `https://VictorRubinec.github.io/Chatbot-Tutor`

**Nota**: Atualize `API_URL` em `chat-tutor/scripts/config.js` com a URL do backend Vercel

## 🐛 Troubleshooting

### "Erro de Rede" no áudio
- Verifique se o backend está respondendo em `/health`
- Revise as chaves de API no Vercel

### Modelo não disponível
- Backend tenta fallback automático
- Verifique rate-limiting das APIs (Groq: 30 req/min)

### Mensagens não aparecem
- Abra DevTools (F12) e verifique console para erros
- Confirme que `localStorage` está habilitado

### CORS error
- Verifique que backend tem `CORS_ORIGIN` configurado corretamente
- Em desenvolvimento: `http://localhost:*`

## 📝 Notas de Desenvolvimento

- **Modelos podem ficar offline**: OpenRouter e Groq decommission modelos ocasionalmente
- **Rate Limiting**: Groq tem limite de 30 requisições por minuto na tier gratuita
- **STT Instável**: Alternativamente ao `SpeechRecognition`, usamos Groq Whisper (mais robusto)
- **TTS Browser**: Qualidade varia por navegador e idioma

## 📄 Licença

Projeto pessoal de portfólio. Livre para usar como referência.

## 👨‍💻 Autor

**Victor Zanin Rubinec**
- GitHub: [@VictorRubinec](https://github.com/VictorRubinec)
- Portfólio: [victorrubinec.github.io](https://victorrubinec.github.io/)

---

**Desenvolvido com ❤️ como projeto de portfólio**
