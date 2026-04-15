async function transcribeAudio(audioBuffer, mimeType) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("Transcricao indisponivel: GROQ_API_KEY nao configurada");
    }

    const formData = new FormData();
    const contentType = mimeType || "audio/webm";
    const fileName = contentType.includes("wav") ? "audio.wav" : "audio.webm";

    formData.append("file", new Blob([audioBuffer], { type: contentType }), fileName);
    formData.append("model", "whisper-large-v3");
    formData.append("language", "pt");
    formData.append("response_format", "json");

    const response = await fetchWithTimeout("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            Authorization: "Bearer " + apiKey
        },
        body: formData
    }, 45000);

    const data = await response.json().catch(function () {
        return null;
    });

    if (!response.ok) {
        const details = data && data.error ? JSON.stringify(data.error) : "sem detalhes";
        throw new Error("Falha na transcricao: " + details);
    }

    const text = data && typeof data.text === "string" ? data.text.trim() : "";
    if (!text) {
        throw new Error("Transcricao vazia");
    }

    return text;
}

async function fetchWithTimeout(url, init, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(function () {
        controller.abort();
    }, timeoutMs);

    try {
        return await fetch(url, Object.assign({}, init, { signal: controller.signal }));
    } finally {
        clearTimeout(timeout);
    }
}

module.exports = {
    transcribeAudio
};
