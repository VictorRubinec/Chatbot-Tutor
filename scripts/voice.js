window.VoiceUtils = (function () {
    const RecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let mediaRecorder = null;
    let mediaStream = null;
    let audioChunks = [];

    function isRecognitionSupported() {
        return Boolean(RecognitionApi);
    }

    function speak(text) {
        if (!window.speechSynthesis || !text) {
            return;
        }

        stop();

        const utterance = new SpeechSynthesisUtterance(String(text));
        utterance.lang = "pt-BR";
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }

    function stop() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    function startRecognition(onResult, onError) {
        if (!isRecognitionSupported()) {
            onError("Reconhecimento de voz indisponivel neste navegador.");
            return;
        }

        stopRecognition();

        recognition = new RecognitionApi();
        recognition.lang = "pt-BR";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = function (event) {
            const text = event.results[0][0].transcript || "";
            onResult(text.trim());
        };

        recognition.onerror = function (event) {
            onError(mapRecognitionError(event && event.error));
        };

        recognition.onend = function () {
            recognition = null;
        };

        recognition.start();
    }

    function stopRecognition() {
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
    }

    async function startRecording(onReady, onError, onStop) {
        try {
            if (!window.MediaRecorder || !window.navigator || !window.navigator.mediaDevices) {
                onError("Gravacao de audio nao suportada neste navegador.");
                return;
            }

            audioChunks = [];
            mediaStream = await window.navigator.mediaDevices.getUserMedia({ audio: true });

            const recorderOptions = {};
            if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                recorderOptions.mimeType = "audio/webm;codecs=opus";
            }

            mediaRecorder = new MediaRecorder(mediaStream, recorderOptions);

            mediaRecorder.ondataavailable = function (event) {
                if (event.data && event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onerror = function () {
                onError("Falha durante a gravacao de audio.");
                cleanupRecording();
            };

            mediaRecorder.onstop = function () {
                const mimeType = mediaRecorder && mediaRecorder.mimeType ? mediaRecorder.mimeType : "audio/webm";
                const audioBlob = new Blob(audioChunks, { type: mimeType });
                cleanupRecording();
                onStop(audioBlob);
            };

            mediaRecorder.start();
            onReady();
        } catch (error) {
            onError(mapGetUserMediaError(error));
            cleanupRecording();
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            return;
        }
        cleanupRecording();
    }

    function isRecording() {
        return Boolean(mediaRecorder && mediaRecorder.state !== "inactive");
    }

    return {
        isRecognitionSupported: isRecognitionSupported,
        startRecognition: startRecognition,
        stopRecognition: stopRecognition,
        startRecording: startRecording,
        stopRecording: stopRecording,
        isRecording: isRecording,
        speak: speak,
        stop: stop
    };

    function mapRecognitionError(code) {
        switch (code) {
            case "not-allowed":
            case "service-not-allowed":
                return "Permissao de microfone negada. Libere o microfone no navegador e tente novamente.";
            case "no-speech":
                return "Nao detectei fala. Tente falar mais proximo do microfone.";
            case "audio-capture":
                return "Nao encontrei um microfone ativo neste dispositivo.";
            case "network":
                return "Falha de rede na transcricao. Verifique sua conexao e tente novamente.";
            case "aborted":
                return "Transcricao cancelada.";
            default:
                return "Nao consegui transcrever sua fala. Se estiver fora de localhost, use HTTPS e verifique a permissao de microfone.";
        }
    }

    function mapGetUserMediaError(error) {
        const code = error && error.name ? error.name : "";

        switch (code) {
            case "NotAllowedError":
            case "PermissionDeniedError":
                return "Permissao de microfone negada. Libere no navegador e tente novamente.";
            case "NotFoundError":
            case "DevicesNotFoundError":
                return "Nao encontrei um microfone ativo neste dispositivo.";
            case "NotReadableError":
            case "TrackStartError":
                return "Nao foi possivel acessar o microfone. Verifique se outro app esta usando.";
            default:
                return "Falha ao iniciar gravacao de audio.";
        }
    }

    function cleanupRecording() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(function (track) {
                track.stop();
            });
        }

        mediaRecorder = null;
        mediaStream = null;
        audioChunks = [];
    }
})();
