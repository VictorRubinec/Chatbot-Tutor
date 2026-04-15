const { getProvider, listModels } = require("../config/providers");
const { getModePrompt } = require("./modes");

async function sendChat(options) {
    const providerId = options.provider;
    const requestedModel = options.model;
    const mode = options.mode;
    const messages = Array.isArray(options.messages) ? options.messages : [];

    const provider = getProvider(providerId);
    if (!provider) {
        throw new Error("Provedor invalido");
    }

    const apiKey = process.env[provider.envKey];
    if (!apiKey) {
        throw new Error("Chave da API nao configurada para " + provider.label);
    }

    const systemMessage = {
        role: "system",
        content: getModePrompt(mode)
    };

    const candidateModels = [requestedModel]
        .concat(listModels(providerId).map(function (item) { return item.id; }))
        .filter(uniqueStrings);

    let lastError = null;

    for (const candidateModel of candidateModels) {
        try {
            const data = await callProvider({
                provider,
                providerId,
                apiKey,
                model: candidateModel,
                messages: [systemMessage].concat(messages)
            });

            const rawReply = data && data.choices && data.choices[0] && data.choices[0].message
                ? data.choices[0].message.content
                : "";

            const reply = sanitizeAssistantReply(rawReply);

            if (!reply) {
                throw new Error("Resposta vazia do provider");
            }

            return {
                reply,
                provider: providerId,
                model: candidateModel,
                mode,
                usage: data.usage || null
            };
        } catch (error) {
            lastError = error;
            if (!isRetryableProviderError(error)) {
                break;
            }
        }
    }

    throw lastError || new Error("Falha ao consultar provider");
}

async function callProvider(input) {
    const payload = {
        model: input.model,
        temperature: 0.7,
        messages: input.messages
    };

    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + input.apiKey
    };

    if (input.providerId === "openrouter") {
        headers["HTTP-Referer"] = process.env.OPENROUTER_HTTP_REFERER || "https://github.com";
        headers["X-Title"] = process.env.OPENROUTER_X_TITLE || "Chat Tutor v2";
    }

    const response = await fetchWithTimeout(input.provider.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
    }, 45000);

    const data = await response.json().catch(function () {
        return null;
    });

    if (!response.ok) {
        const details = data && data.error ? data.error : { message: "sem detalhes" };
        const error = new Error("Falha no provider " + input.provider.label + ": " + JSON.stringify(details));
        error.statusCode = response.status;
        error.providerDetails = details;
        throw error;
    }

    return data;
}

function isRetryableProviderError(error) {
    const statusCode = Number(error && error.statusCode);
    const providerDetails = error && error.providerDetails ? error.providerDetails : {};
    const providerCode = Number(providerDetails.code);
    const providerMessage = String(providerDetails.message || providerDetails.raw || "").toLowerCase();

    if (statusCode === 429 || providerCode === 429) {
        return true;
    }

    if (statusCode === 404 || providerCode === 404) {
        return true;
    }

    return providerMessage.includes("rate-limit") || providerMessage.includes("rate limit") || providerMessage.includes("no endpoints found");
}

function uniqueStrings(value, index, array) {
    return Boolean(value) && array.indexOf(value) === index;
}

function sanitizeAssistantReply(text) {
    const original = String(text || "");
    if (!original) {
        return "";
    }

    let cleaned = original;

    cleaned = cleaned.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/gi, " ");
    cleaned = cleaned.replace(/<analysis>[\s\S]*?<\/analysis>/gi, " ");
    cleaned = cleaned.replace(/<tool>[\s\S]*?<\/tool>/gi, " ");
    cleaned = cleaned.replace(/<[^>]+>/g, " ");

    cleaned = cleaned
        .split(/\r?\n/)
        .filter(function (line) {
            const normalized = line.trim().toLowerCase();
            if (!normalized) {
                return false;
            }
            if (normalized.startsWith("we should ")) {
                return false;
            }
            if (normalized.includes("operational mode has changed")) {
                return false;
            }
            if (normalized.includes("no longer in read-only mode")) {
                return false;
            }
            if (normalized.includes("utilize your arsenal of tools")) {
                return false;
            }
            return true;
        })
        .join("\n")
        .trim();

    if (cleaned) {
        return cleaned;
    }

    return "Desculpe, tive um problema para formatar a resposta. Pode repetir sua pergunta?";
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
    sendChat
};
