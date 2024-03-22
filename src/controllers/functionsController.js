require('dotenv').config();

const openai_key = process.env.OPENAI_API_KEY;

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
        formData.append('model', 'whisper-1');

        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openai_key}`,
            },
            body: formData
        };

        fetch('https://api.openai.com/v1/audio/transcriptions', requestOptions)
            .then(response => response.json())
            .then(data => {
                res.json({ text: data.text });
            })
            .catch(error => {
                console.error('Erro ao transcrever áudio:', error);
            });

    } catch (error) {
        console.error('Error transcribing audio:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function respostaGPT(req, res) {
    try {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openai_key}`,
            },
            body: JSON.stringify({
                "model": "gpt-3.5-turbo",
                "messages": req.body.messages
            })
        };

        fetch('https://api.openai.com/v1/chat/completions', requestOptions)
            .then(response => response.json())
            .then(data => {
                res.json({ response: data.choices[0].message.content });
            })
            .catch(error => {
                console.error('Erro ao obter resposta do ChatGPT:', error);
            });
    } catch (error) {
        console.error('Error interacting with ChatGPT:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    testar,
    respostaGPT,
    transcreverAudio
};
