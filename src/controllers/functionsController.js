const openai = require('openai');
const { Buffer } = require('buffer');
const { Writable } = require('stream');

require('dotenv').config();

const openai_key = process.env.OPENAI_API_KEY;
const client = new openai.OpenAI(openai_key);

function testar(req, res) {
    console.log("ENTRAMOS NO avisoController");
    res.send("ENTRAMOS NO AVISO CONTROLLER");
}

function base64toBlob(base64Data, contentType) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
}


async function transcreverAudio(req, res) {
    try {
        const writable = new Writable({
            write(chunk, encoding, callback) {
                chunks.push(chunk);
                callback();
            }
        });
    
        const chunks = [];
    
        req.on('data', (chunk) => {
            writable.write(chunk); 
        });
    
        req.on('end', async () => {
            writable.end();
    
            try {
                const buffer = Buffer.concat(chunks);
    
                const buffer64 = buffer.toString('base64');

                const audioBlob = base64toBlob(buffer64, 'audio/ogg; codecs=opus');

                const formData = new FormData();
                formData.append('file', audioBlob, 'audio.ogg');

                const transcription = await client.audio.transcriptions.create({
                    model: 'whisper-1',
                    file: formData.get('file')
                });

                res.json({ text: transcription.text });
            } catch (error) {
                console.error('Erro ao transcrever áudio:', error);
                res.status(500).json({ error: 'Erro ao transcrever áudio' });
            }
        });
    } catch (error) {
        console.error('Erro ao transcrever o áudio:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function respostaGPT(req, res) {
    try {
        const response = await client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: req.body.messages
        });
        res.json({ response: response.choices[0].message.content });
    } catch (error) {
        console.error('Erro ao obter resposta do GPT:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function falarAudio(req, res) {
    try {
        var { input, voz } = req.body; 
        
        input = input.replace(/<[^>]*>?/gm, '');
        voz = voz.toLowerCase();

        const response = await client.audio.speech.create({
            model: 'tts-1',
            voice: voz,
            input: input,
        });

        const audio64 = Buffer.from(await response.arrayBuffer()).toString('base64');

        res.json({ audio: audio64 });
    } catch (error) {
        console.error('Erro ao sintetizar fala:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    testar,
    respostaGPT,
    transcreverAudio,
    falarAudio
};
