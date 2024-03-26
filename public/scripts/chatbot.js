function chat() {

    const btnGravar = document.getElementById('gravar-btn');
    const btnEnviar = document.getElementById('enviar-btn');

    const mensagemInput = document.getElementById('mensagem-input');

    const chatHistory = document.getElementById('chat-history');

    const modalModelo = document.getElementById('modal-modelo');
    const btnModelo = document.getElementById('modelo-btn');
    const modeloInput = document.getElementById('modelo-input');

    let mediaRecorder;
    let chunks = [];
    let messageHistory = [];

    btnGravar.addEventListener('click', toggleGravacao);
    btnEnviar.addEventListener('click', enviarMensagem);
    btnModelo.addEventListener('click', modeloAssistente);

    mensagemInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            btnEnviar.click();
        }
    });

    modeloInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            btnModelo.click();
        }
    });

    // if (messageHistory.length == 0) modalModelo.style.display = 'block';

    function modeloAssistente() {
        messageHistory.push(
            { "role": "system", "content": "Quando houver quebra de linha em sua mensagem, substitua por <br>" },
            { "role": "system", "content": "você é um ChatBot com função de " + modeloInput.value },
            { "role": "system", "content": "se apresente para o usuário" }
        );

        modalModelo.style.display = 'none';
        obterRespostaDoChatGPT(messageHistory);
    }

    function toggleGravacao() {
        if (btnGravar.innerHTML === 'Gravar') {
            btnGravar.style.backgroundColor = 'red';
            iniciarGravacao();
        } else {
            btnGravar.style.backgroundColor = 'green';
            pararGravacao();
        }
    }

    function falarAudio(base64, type) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: type });

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    }

    function enviarMensagem() {
        const mensagem = mensagemInput.value;
        if (mensagem !== '' && mensagem !== null && mensagem !== undefined) {
            messageHistory.push(
                { "role": "user", "content": mensagem }
            );
            console.log('Histórico de mensagens:', messageHistory);
            exibirMensagem(messageHistory[messageHistory.length - 1]);
            obterRespostaDoChatGPT(messageHistory);
            mensagemInput.value = '';
        } else {
            console.log('Mensagem vazia.');
        }
    }

    function blobToBuffer(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                const buffer = reader.result;
                resolve(buffer);
            }
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    }

    function iniciarGravacao() {
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
                    const audioBlob = new Blob(chunks, { type: 'audio/ogg' });
                    
                    // const buffer = blobToBuffer(audioBlob);
                    // const audio = buffer.then(function (result) {
                        // console.log('Resultado:', result);
                        // transcreverAudio(buffer);
                    // });
            
                    
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = function () {
                        const base64data = reader.result.split(',')[1];
                        // dividirAudio(base64data);
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

    // function dividirAudio(base64data) {
    //     // 20KB
    //     const chunkSize = 1024 * 20;
    //     var totalChunks = Math.ceil(base64data.length / chunkSize);
    //     let audio = [];

    //     for (let i = 0; i < totalChunks; i++) {
    //         const start = i * chunkSize;
    //         const end = start + chunkSize;
    //         audio.push(base64data.slice(start, end));
    //     }

    //     console.log('Áudio dividido:', audio.length);
    //     console.log('Total de chunks:', totalChunks);

    //     console.log('Áudio:', audio);
    //     console.log('Áudio:', audio[0]);

    //     for (let i = 0; i < totalChunks; i++) {
    //         setTimeout(() => {
    //             console.log('index:', i)
    //             // console.log('chunk:', audio[i])
    //             transcreverAudio(audio[i], i + 1, totalChunks);
    //             if (i === totalChunks - 1) {
    //                 console.log('Áudio enviado.');
    //                 audio = [];
    //             }
    //         }, i * 1000);
    //     }
    // }

    function transcreverAudio(audioBlob) {
        
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                audio: audioBlob
            })
        };

        fetch('/functions/transcribe-audio', requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log('Texto transcrito:', data);
                messageHistory.push(
                    { "role": "user", "content": data.text }
                );
                console.log('Histórico de mensagens:', messageHistory);
                exibirMensagem(messageHistory[messageHistory.length - 1]);
                obterRespostaDoChatGPT(messageHistory);
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
                messageHistory.push(
                    { "role": "assistant", "content": data.response }
                );
                exibirMensagem(messageHistory[messageHistory.length - 1]);
                textoParaAudio(data.response);
            })
            .catch(function (erro) {
                console.log('Erro ao obter resposta do ChatGPT:', erro);
            });
    }

    function exibirMensagem(message) {
        console.log('Mensagem:', message);
        var messageElement;
        if (message.role === 'user') {
            messageElement = "<div class='user-div'><p class='mensagem-user'>" + message.content + "</p></div>";
        } else if (message.role === 'assistant') {
            messageElement = "<div class='bot-div'><p class='mensagem-bot'>" + message.content + "</p></div>";
        } else {
            throw new Error('Mensagem inválida.');
        }
        chatHistory.innerHTML += messageElement;
    }

    function textoParaAudio(resposta) {
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
                console.log('Resposta:', data);
                falarAudio(data.audio, 'audio/wav');
            })
            .catch(function (erro) {
                console.log('Erro ao falar resposta:', erro);
            });
    }
}
