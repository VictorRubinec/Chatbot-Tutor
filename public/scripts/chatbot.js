function chat() {

    const configIcon = document.getElementById('config-icon');
    const soundIconOn = document.getElementById('sound-on');
    const soundIconOff = document.getElementById('sound-off');

    const menuConfig = document.getElementById('menu-content');

    const modeloVoz = document.getElementById('modelo-voz');

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

    let controleDeVoz = true;

    let vozTutor = modeloVoz.value;

    btnEnviar.addEventListener('click', function () {
        if (mensagemInput.value !== '') {
            mensagemInput.style.border = '1px solid #494949';
            mensagemInput.style.backgroundColor = '#313131';
            mensagemInput.style.color = 'white';
            mensagemInput.placeholder = 'Digite sua mensagem';
            enviarMensagem();
        } else {
            mensagemInput.style.border = '1px solid red';
            mensagemInput.style.backgroundColor = '#ffcccc';
            mensagemInput.style.color = 'black';
            mensagemInput.placeholder = 'Mensagem vazia';
            mensagemInput.focus();
        }
    });

    btnModelo.addEventListener('click', function () {
        if (modeloInput.value !== '') {
            modeloAssistente();
        } else {
            modeloInput.style.border = '1px solid red';
            modeloInput.style.backgroundColor = '#ffcccc';
            modeloInput.style.color = 'black';
            modeloInput.placeholder = 'Campo obrigatório';
            modeloInput.focus();
        }
    });

    btnGravar.addEventListener('click', function () {
        if (btnGravar.innerHTML === 'Gravar') {
            iniciarGravacao();
            btnGravar.className = 'btn-gravando';
        } else {
            pararGravacao();
            btnGravar.className = 'btn';
        }
    });

    modeloVoz.addEventListener('change', function () {
        vozTutor = modeloVoz.value;
    });

    configIcon.addEventListener('click', function () {
        if (menuConfig.style.display === 'none' || menuConfig.style.display === '') {
            menuConfig.style.display = 'block';
        } else {
            menuConfig.style.display = 'none';
        }
    });

    window.addEventListener('click', function (event) {
        if (event.target !== configIcon && event.target !== menuConfig && event.target !== soundIconOn && event.target !== soundIconOff && event.target !== modeloVoz && event.target !== modeloInput && event.target !== btnModelo) {
            menuConfig.style.display = 'none';
        }
    });

    soundIconOn.addEventListener('click', function () {
        soundIconOn.style.display = 'none';
        soundIconOff.style.display = 'block';

        controleDeVoz = false;
    });

    soundIconOff.addEventListener('click', function () {
        soundIconOff.style.display = 'none';
        soundIconOn.style.display = 'block';

        controleDeVoz = true;
    });

    mensagemInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter' && !event.shiftKey && btnEnviar.disabled === false) {
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

    if (messageHistory.length == 0) modalModelo.style.display = 'block';

    function modeloAssistente() {
        messageHistory.push(
            { "role": "system", "content": "Não use emojis" },
            { "role": "system", "content": "você é um ChatBot com função de " + modeloInput.value },
            { "role": "system", "content": "se apresente para o usuário" }
        );
        modalModelo.style.display = 'none';
        obterRespostaDoChatGPT(messageHistory);
    }

    function falarAudio(base64, type) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: type });

        const url = URL.createObjectURL(blob); 1
        const audio = new Audio(url);
        audio.play();
    }

    function enviarMensagem() {
        const mensagem = mensagemInput.value;
        if (mensagem !== '' && mensagem !== null && mensagem !== undefined) {
            messageHistory.push(
                { "role": "user", "content": mensagem }
            );
            exibirMensagem(messageHistory[messageHistory.length - 1]);
            obterRespostaDoChatGPT(messageHistory);
            mensagemInput.value = '';
        } else {
            console.log('Mensagem vazia.');
        }
    }

    function iniciarGravacao() {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia) {
            btnGravar.innerHTML = 'Parar';
            window.navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function (stream) {
                    mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.start();
    
                    mediaRecorder.ondataavailable = function (event) {
                        chunks.push(event.data);
                    }
    
                    mediaRecorder.onstop = function () {
                        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                        transcreverAudio(audioBlob);
                        chunks = [];
                    }
                })
                .catch(function (err) {
                    console.log('Erro ao acessar o dispositivo de áudio: ' + err);
                });
        } else {
            console.log('O navegador não suporta gravação de áudio.');
        }
    }

    function pararGravacao() {
        btnGravar.innerHTML = 'Gravar';
        mediaRecorder.stop();
    }

    function transcreverAudio(audioBlob) {
        aguardandoResposta('user', true);
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'audio/wav'
            },
            body: audioBlob
        };
        fetch('/functions/transcribe-audio', requestOptions)
            .then(response => response.json())
            .then(data => {
                aguardandoResposta('user', false);
                messageHistory.push(
                    { "role": "user", "content": data.text }
                );
                exibirMensagem(messageHistory[messageHistory.length - 1]);
                obterRespostaDoChatGPT(messageHistory);
            })
            .catch(function (erro) {
                console.log('Erro ao transcrever áudio:', erro);
            });
    }

    function obterRespostaDoChatGPT(messageHistory) {
        aguardandoResposta('assistant', true);
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
                if (controleDeVoz) textoParaAudio(data.response);
                else {
                    aguardandoResposta('assistant', false);
                    exibirMensagem(messageHistory[messageHistory.length - 1]);
                }
            })
            .catch(function (erro) {
                console.log('Erro ao obter resposta do ChatGPT:', erro);
            });
    }


    function textoParaAudio(resposta) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                voz: vozTutor,
                input: resposta
            })
        };
        fetch('/functions/falar-audio', requestOptions)
            .then(response => response.json())
            .then(data => {
                aguardandoResposta('assistant', false);
                exibirMensagem(messageHistory[messageHistory.length - 1]);
                falarAudio(data.audio, 'audio/wav');
            })
            .catch(function (erro) {
                console.log('Erro ao falar resposta:', erro);
            });
    }

    function exibirMensagem(message) {
        var messageElement;
        if (message.role === 'user') {
            messageElement = "<div class='user-div'><p class='mensagem-user'>" + message.content + "</p></div>";
        } else if (message.role === 'assistant') {
            messageElement = "<div class='bot-div'><p class='mensagem-bot'>" + message.content + "</p></div>";
        } else {
            throw new Error('Mensagem inválida.');
        }
        chatHistory.innerHTML += messageElement;
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function aguardandoResposta(role, state) {
        switch (role) {
            case 'user':
                if (state === true) {
                    chatHistory.innerHTML += "<div class='user-div'><p class='mensagem-user'> . . . </p></div>";
                    btnEnviar.disabled = true;
                    btnGravar.disabled = true;
                    mensagemInput.disabled = true;
                } else {
                    chatHistory.removeChild(chatHistory.lastChild);
                    btnEnviar.disabled = false;
                    btnGravar.disabled = false;
                    mensagemInput.disabled = false;
                }
                break;
            case 'assistant':
                if (state === true) {
                    chatHistory.innerHTML += "<div class='bot-div'><p class='mensagem-bot'> . . . </p></div>";
                    btnEnviar.disabled = true;
                    btnGravar.disabled = true;
                } else {
                    chatHistory.removeChild(chatHistory.lastChild);
                    btnEnviar.disabled = false;
                    btnGravar.disabled = false;
                }
                break;
            default:
                break;
        }
    }
}
