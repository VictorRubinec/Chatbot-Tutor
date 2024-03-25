function chat() {
    const btnGravar = document.getElementById('gravar-btn');
    const chatHistory = document.getElementById('chat-history');

    let mediaRecorder;
    let chunks = [];
    let messageHistory = [];

    btnGravar.addEventListener('click', toggleGravacao);

    function toggleGravacao() {
        if (btnGravar.innerHTML === 'Gravar') {
            iniciarGravacao();
        } else {
            pararGravacao();
        }
    }

    function iniciarGravacao() {
        // Verificar se o navegador suporta a API getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log('O navegador não suporta gravação de áudio.');
            return;
        }

        btnGravar.innerHTML = 'Parar';
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                mediaRecorder.ondataavailable = function (event) {
                    chunks.push(event.data);
                }

                mediaRecorder.onstop = function () {
                    const audioBlob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = function () {
                        const base64data = reader.result.split(',')[1];
                        if (base64data !== '' && base64data !== null && base64data !== undefined) transcreverAudio(base64data);
                        else console.log('Sem dados de áudio.');
                    }
                    chunks = [];
                }
            })
            .catch(function (err) {
                console.log('Erro ao acessar o dispositivo de áudio: ' + err);
            });
    }

    function pararGravacao() {
        btnGravar.innerHTML = 'Gravar';
        mediaRecorder.stop();
    }

    function transcreverAudio(audioBlob) {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: audioBlob })
        };

        fetch('/functions/transcribe-audio', requestOptions)
            .then(response => response.json())
            .then(data => {
                messageHistory.push(
                    { "role": "user", "content": data.text }
                );
                exibirMensagem(messageHistory[messageHistory.length - 1]);
                obterRespostaDoChatGPT(messageHistory[messageHistory.length - 1]);
            })
            .catch(function (erro) {
                console.log('Erro ao transcrever áudio:', erro);
            });
    }

    function obterRespostaDoChatGPT(messageHistory) {

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "messages": messageHistory
            })
        }

        fetch('/functions/chat', requestOptions)
            .then(response => response.json())
            .then(data => {
                exibirMensagem(data);
                messageHistory.push(
                    { "role": "assistant", "content": data.response }
                );
                // falarResposta(data.response);
            })
            .catch(function (erro) {
                console.log('Erro ao obter resposta do ChatGPT:', erro);
            });
    }

    function exibirMensagem(message) {
        console.log('Mensagem:', message);
        var messageElement;
        if (message.role === 'user') {
            messageElement = "<div class='mensagem-user'>" + message + "</div>";
        } else if (message.role === 'assistant') {
            messageElement = "<div class='mensagem-assistant'>" + message + "</div>";
        }
        chatHistory += messageElement;
    }

    function falarResposta(resposta) {

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "input": resposta
            })
        };

        fetch('/functions/falar-audio', requestOptions)
            .then(response => response.json())
            .then(data => {

            })
            .catch(function (erro) {
                console.log('Erro ao falar resposta:', erro);
            });
    }
}
