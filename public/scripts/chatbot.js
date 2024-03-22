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
                    const audioURL = URL.createObjectURL(audioBlob);
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = function () {
                        const base64data = reader.result.split(',')[1];
                        transcreverAudio(base64data);
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
                exibirMensagem(data.text);
                messageHistory.push(
                    {"role": "user", "content": data.text}
                );
                obterRespostaDoChatGPT(messageHistory);
            })
            .catch(function (erro) {
                console.log('Erro ao transcrever áudio:', erro);
                // Tratar erro de forma mais específica, se necessário
            });
    }

    function obterRespostaDoChatGPT(messageHistory) {
        fetch('/functions/chat', {
            method: 'POST',
            body: JSON.stringify({
                messages: messageHistory
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                exibirMensagem(data.response);
                messageHistory.push(
                    {"role": "assistant", "content": data.response}
                );
            })
            .catch(function (erro) {
                console.log('Erro ao obter resposta do ChatGPT:', erro);
            });
    }

    function exibirMensagem(message) {
        console.log('Mensagem:', message);
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = message;
        chatHistory.appendChild(messageElement);
    }
}
