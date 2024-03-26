const openai = require('openai');
const { Buffer } = require('buffer');
const fs = require('fs');

require('dotenv').config();

const openai_key = process.env.OPENAI_API_KEY;

const client = new openai.OpenAI(openai_key);

function testar(req, res) {
    console.log("ENTRAMOS NO avisoController");
    res.send("ENTRAMOS NO AVISO CONTROLLER");
}

let chunks = [];

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

        const { audio } = req.body;

        const audioBlob = base64toBlob(audio, 'audio/ogg; codecs=opus');

        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.ogg');

        const transcription = await client.audio.transcriptions.create({
            model: 'whisper-1',
            file: formData.get('file')
        });

        res.json({ text: transcription.text });

        // const { buffer } = req.body;

        // // estou recebendo um buffer
        // console.log('Buffer:', buffer);

        // const audio = Buffer.from(buffer).toString('base64');

        // console.log('Audio:', audio);

        // console.log('Buffer:', buffer);

        // const audioa = audio.then(function (result) {
        //     console.log('Resultado:', result);
        //     // transcreverAudio(buffer);
        // });

        // // transformar o buffer em base64
        // const audio64 = Buffer.from(audio).toString('base64');

        // const audioBlob = base64toBlob(audio64, 'audio/ogg; codecs=opus');

        // console.log('Blob:', audioBlob);

        // const { audio } = req.body;

        // console.log(`audio: ${audio}`);

        // const url = audio.replace('blob:', '');

        // const response = await fetch(url);

        // // criar um blob .ogg
        // const blob = new Blob([await response.arrayBuffer()], { type: 'audio/ogg; codecs=opus' });

        // console.log(blob);

        // const formData = new FormData();
        // formData.append('file', blob, 'audio.ogg');

        // const transcription = await client.audio.transcriptions.create({
        //     model: 'whisper-1',
        //     file: formData.get('file')
        // });

        // console.log('Transcrição:', transcription.text);

        // console.log('Transcrição:', transcription.text);

        // const { audio, index, totalChunks } = req.body;

        // console.log('Index:', index);
        // console.log('Total de chunks:', totalChunks);

        // if (index === totalChunks) {

        //     console.log('Transcrevendo áudio...');

        //     const chunkInteira = chunks.join('');

        //     console.log('Tamanho do áudio:', chunkInteira);

        //     const audioBlob = base64toBlob(chunkInteira, 'audio/ogg; codecs=opus');

        //     const formData = new FormData();
        //     formData.append('file', audioBlob, 'audio.ogg');

        //     chunks = [];

        //     const transcription = await client.audio.transcriptions.create({
        //         model: 'whisper-1',
        //         file: formData.get('file')
        //     });

        //     console.log('Transcrição:', transcription.text);
        //     console.log('Chunks:', chunks.length)

        //     res.json({ text: transcription.text });
        // } else {
        //     chunks.push(audio);
        //     console.log('Chunk adicionado:', index);
        // }



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
        var texto = req.body.input;

        texto = texto.replace(/<[^>]*>?/gm, '');

        const response = await client.audio.speech.create({
            model: 'tts-1',
            voice: 'alloy',
            input: texto,
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
