function chat() {
    const STORAGE_KEY = "chatTutorV2State";

    const configToggle = document.getElementById("config-toggle");
    const configPanel = document.getElementById("config-panel");

    const providerSelect = document.getElementById("provider-select");
    const modelSelect = document.getElementById("model-select");
    const modeSelect = document.getElementById("mode-select");

    const clearChatButton = document.getElementById("clear-chat-btn");
    const voiceToggleButton = document.getElementById("voice-toggle-btn");

    const chatHistoryElement = document.getElementById("chat-history");
    const chatInnerElement = document.getElementById("chat-inner");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-btn");
    const listenButton = document.getElementById("listen-btn");

    let state = {
        apiBaseUrl: window.ChatTutorConfig.defaultApiBaseUrl,
        provider: "groq",
        model: "llama-3.1-8b-instant",
        mode: "direct",
        voiceEnabled: true,
        isListening: false,
        messages: []
    };

    let typingNode = null;

    hydrateState();
    bindEvents();

    appendSystemMessage("Carregando provedores e modelos...");
    bootstrapRemoteConfig();

    if (state.messages.length === 0) {
        appendAssistantMessage(getWelcomeText());
    } else {
        renderHistory();
    }

    refreshVoiceButton();
    if (!canRecordAudio()) {
        listenButton.disabled = true;
        listenButton.textContent = "Sem STT";
        listenButton.title = "Gravacao de audio nao suportada neste navegador.";
    }

    function bindEvents() {
        configToggle.addEventListener("click", function (event) {
            event.stopPropagation();
            configPanel.classList.toggle("is-open");
        });

        document.addEventListener("click", function (event) {
            if (!configPanel.contains(event.target) && event.target !== configToggle) {
                configPanel.classList.remove("is-open");
            }
        });

        providerSelect.addEventListener("change", onProviderChange);
        modelSelect.addEventListener("change", onModelChange);
        modeSelect.addEventListener("change", onModeChange);
        clearChatButton.addEventListener("click", clearChat);
        voiceToggleButton.addEventListener("click", toggleVoice);

        sendButton.addEventListener("click", sendMessage);
        listenButton.addEventListener("click", toggleSpeechRecognition);

        messageInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter" && !event.shiftKey && !sendButton.disabled) {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    function hydrateState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                modeSelect.value = state.mode;
                return;
            }

            const saved = JSON.parse(raw);

            state.apiBaseUrl = saved.apiBaseUrl || state.apiBaseUrl;
            state.provider = saved.provider || state.provider;
            state.model = saved.model || state.model;
            state.mode = saved.mode || state.mode;
            state.voiceEnabled = saved.voiceEnabled !== false;
            state.messages = Array.isArray(saved.messages) ? saved.messages : [];

            modeSelect.value = state.mode;
        } catch (error) {
            appendSystemMessage("Falha ao recuperar estado local. Seguindo com padroes.");
        }
    }

    function persistState() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                apiBaseUrl: state.apiBaseUrl,
                provider: state.provider,
                model: state.model,
                mode: state.mode,
                voiceEnabled: state.voiceEnabled,
                messages: state.messages.slice(-60)
            })
        );
    }

    async function bootstrapRemoteConfig() {
        try {
            const providersData = await window.ApiClient.getProviders(state.apiBaseUrl);
            populateProviders(providersData.providers || []);

            await loadModelsForProvider(state.provider);

            const health = await window.ApiClient.getHealth(state.apiBaseUrl);
            appendSystemMessage("API conectada: " + health.status + ".");
        } catch (error) {
            appendSystemMessage("Nao foi possivel conectar com a API. Verifique a URL no painel de configuracoes.");
        }
    }

    function populateProviders(providers) {
        providerSelect.innerHTML = "";

        const enabledProviders = providers.filter(function (provider) {
            return provider.enabled !== false;
        });

        const source = enabledProviders.length > 0 ? enabledProviders : providers;

        source.forEach(function (provider) {
            const option = document.createElement("option");
            option.value = provider.id;
            option.textContent = provider.enabled === false
                ? provider.label + " (sem chave no backend)"
                : provider.label;
            providerSelect.appendChild(option);
        });

        if (!source.some(function (provider) { return provider.id === state.provider; })) {
            state.provider = source[0] ? source[0].id : "groq";
        }

        providerSelect.value = state.provider;
    }

    async function onProviderChange() {
        state.provider = providerSelect.value;
        await loadModelsForProvider(state.provider);
        persistState();
        appendSystemMessage("Provedor alterado para " + providerSelect.options[providerSelect.selectedIndex].text + ".");
    }

    function onModelChange() {
        state.model = modelSelect.value;
        persistState();
        appendSystemMessage("Modelo alterado para " + modelSelect.options[modelSelect.selectedIndex].text + ".");
    }

    function onModeChange() {
        state.mode = modeSelect.value;
        persistState();
        appendSystemMessage("Personalidade alterada para " + window.ChatModes.getMode(state.mode).label + ".");
    }

    async function loadModelsForProvider(providerId) {
        modelSelect.innerHTML = "";

        try {
            const modelData = await window.ApiClient.getModels(state.apiBaseUrl, providerId);
            const models = modelData.models || [];

            models.forEach(function (model) {
                const option = document.createElement("option");
                option.value = model.id;
                option.textContent = model.label;
                modelSelect.appendChild(option);
            });

            if (!models.some(function (model) { return model.id === state.model; })) {
                state.model = models[0] ? models[0].id : "";
            }

            modelSelect.value = state.model;
        } catch (error) {
            appendSystemMessage("Nao foi possivel carregar modelos do provedor selecionado.");
        }
    }

    function clearChat() {
        state.messages = [];
        chatInnerElement.innerHTML = "";
        appendAssistantMessage(getWelcomeText());
        persistState();
    }

    function toggleVoice() {
        state.voiceEnabled = !state.voiceEnabled;
        if (!state.voiceEnabled) {
            window.VoiceUtils.stop();
        }
        refreshVoiceButton();
        persistState();
    }

    function refreshVoiceButton() {
        voiceToggleButton.textContent = state.voiceEnabled ? "Voz: ON" : "Voz: OFF";
    }

    function toggleSpeechRecognition() {
        if (!canRecordAudio()) {
            appendSystemMessage("Gravacao de audio indisponivel neste navegador.");
            return;
        }

        if (!state.isListening) {
            window.VoiceUtils.startRecording(
                function onReady() {
                    state.isListening = true;
                    listenButton.textContent = "Parar";
                    listenButton.classList.add("btn-recording");
                },
                function onError(errorMessage) {
                    appendSystemMessage(errorMessage);
                    state.isListening = false;
                    listenButton.textContent = "Escutar";
                    listenButton.classList.remove("btn-recording");
                },
                async function onStop(audioBlob) {
                    state.isListening = false;
                    listenButton.textContent = "Escutar";
                    listenButton.classList.remove("btn-recording");

                    if (!audioBlob || audioBlob.size === 0) {
                        appendSystemMessage("Audio vazio. Tente gravar novamente.");
                        return;
                    }

                    setLoading(true);
                    try {
                        const transcribed = await window.ApiClient.transcribeAudio(state.apiBaseUrl, audioBlob);
                        const text = (transcribed.text || "").trim();

                        if (!text) {
                            appendSystemMessage("Nao consegui entender o audio. Tente falar mais proximo do microfone.");
                            return;
                        }

                        messageInput.value = text;
                        await sendMessage();
                    } catch (error) {
                        appendSystemMessage("Erro ao transcrever audio: " + error.message);
                    } finally {
                        setLoading(false);
                    }
                }
            );
            return;
        }

        window.VoiceUtils.stopRecording();
        state.isListening = false;
        listenButton.textContent = "Escutar";
        listenButton.classList.remove("btn-recording");
    }

    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) {
            return;
        }

        const userMessage = { role: "user", content: text };
        state.messages.push(userMessage);
        appendUserMessage(text);
        messageInput.value = "";
        setLoading(true);

        try {
            const payload = {
                provider: providerSelect.value,
                model: modelSelect.value,
                mode: modeSelect.value,
                messages: state.messages
            };

            const response = await window.ApiClient.sendChat(state.apiBaseUrl, payload);
            const botText = response.reply || "Sem resposta.";

            state.provider = response.provider || state.provider;
            state.model = response.model || state.model;
            state.mode = response.mode || state.mode;

            providerSelect.value = state.provider;
            if (Array.from(modelSelect.options).some(function (option) { return option.value === state.model; })) {
                modelSelect.value = state.model;
            }
            modeSelect.value = state.mode;

            const assistantMessage = { role: "assistant", content: botText };
            state.messages.push(assistantMessage);
            appendAssistantMessage(botText);
            speakIfEnabled(botText);
            persistState();
        } catch (error) {
            appendSystemMessage("Erro ao chamar IA: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    function speakIfEnabled(text) {
        if (!state.voiceEnabled) {
            return;
        }
        window.VoiceUtils.speak(text);
    }

    function renderHistory() {
        chatInnerElement.innerHTML = "";
        state.messages.forEach(function (message) {
            if (message.role === "user") {
                appendUserMessage(message.content);
            } else if (message.role === "assistant") {
                appendAssistantMessage(message.content);
            }
        });
    }

    function appendUserMessage(text) {
        appendMessage("user", text);
    }

    function appendAssistantMessage(text) {
        appendMessage("assistant", text);
    }

    function appendSystemMessage(text) {
        appendMessage("system", text);
    }

    function appendMessage(role, text) {
        const wrapper = document.createElement("div");
        wrapper.className = role === "user" ? "user-div" : "bot-div";

        const paragraph = document.createElement("p");
        paragraph.className = "message " + (role === "user" ? "user" : role === "assistant" ? "bot" : "system");
        paragraph.textContent = sanitizeDisplayedText(text);

        wrapper.appendChild(paragraph);
        chatInnerElement.appendChild(wrapper);
        chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
    }

    function setLoading(stateLoading) {
        sendButton.disabled = stateLoading;
        listenButton.disabled = stateLoading || !canRecordAudio();
        messageInput.disabled = stateLoading;

        if (!stateLoading) {
            if (typingNode) {
                typingNode.remove();
                typingNode = null;
            }
            return;
        }

        typingNode = document.createElement("div");
        typingNode.className = "bot-div";

        const paragraph = document.createElement("p");
        paragraph.className = "message bot";
        paragraph.textContent = "Digitando...";

        typingNode.appendChild(paragraph);
        chatInnerElement.appendChild(typingNode);
        chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
    }

    function getWelcomeText() {
        return [
            "Bem-vindo ao Chat Tutor v2.",
            "Escolha provedor, modelo e personalidade na barra inferior.",
            "Nas configurações você pode apenas ligar/desligar voz e limpar chat."
        ].join("\n");
    }

    function canRecordAudio() {
        return Boolean(window.MediaRecorder && window.navigator && window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia);
    }

    function sanitizeDisplayedText(text) {
        const value = String(text || "");
        if (!value) {
            return "";
        }

        return value
            .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/gi, "")
            .replace(/operational mode has changed/gi, "")
            .replace(/no longer in read-only mode/gi, "")
            .replace(/utilize your arsenal of tools as needed\.?/gi, "")
            .trim();
    }
}
