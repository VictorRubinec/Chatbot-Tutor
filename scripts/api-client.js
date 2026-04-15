window.ApiClient = (function () {
    async function request(baseUrl, path, options) {
        const url = normalizeBaseUrl(baseUrl) + path;
        const response = await fetch(url, options || {});
        const data = await response.json().catch(function () {
            return { error: "Resposta invalida da API" };
        });

        if (!response.ok) {
            const details = data.details ? " - " + data.details : "";
            throw new Error((data.error || "Falha na API") + details);
        }

        return data;
    }

    function normalizeBaseUrl(baseUrl) {
        return String(baseUrl || "").trim().replace(/\/+$/, "");
    }

    async function getProviders(baseUrl) {
        return request(baseUrl, "/providers");
    }

    async function getModels(baseUrl, provider) {
        return request(baseUrl, "/models?provider=" + encodeURIComponent(provider));
    }

    async function getHealth(baseUrl) {
        return request(baseUrl, "/health");
    }

    async function sendChat(baseUrl, payload) {
        return request(baseUrl, "/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    }

    async function transcribeAudio(baseUrl, audioBlob) {
        const url = normalizeBaseUrl(baseUrl) + "/transcribe";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": audioBlob.type || "audio/webm"
            },
            body: audioBlob
        });

        const data = await response.json().catch(function () {
            return { error: "Resposta invalida da API" };
        });

        if (!response.ok) {
            const details = data.details ? " - " + data.details : "";
            throw new Error((data.error || "Falha na API") + details);
        }

        return data;
    }

    return {
        getProviders: getProviders,
        getModels: getModels,
        getHealth: getHealth,
        sendChat: sendChat,
        transcribeAudio: transcribeAudio
    };
})();
