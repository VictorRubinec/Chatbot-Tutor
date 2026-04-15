const PROVIDERS = {
    groq: {
        id: "groq",
        label: "Groq",
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
        envKey: "GROQ_API_KEY",
        models: [
            { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" },
            { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
            { id: "openai/gpt-oss-20b", label: "GPT OSS 20B" }
        ]
    },
    openrouter: {
        id: "openrouter",
        label: "OpenRouter",
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        envKey: "OPENROUTER_API_KEY",
        models: [
            { id: "openai/gpt-oss-20b:free", label: "GPT OSS 20B (Free)" },
            { id: "openai/gpt-oss-120b:free", label: "GPT OSS 120B (Free)" },
            { id: "google/gemma-3-4b-it:free", label: "Gemma 3 4B IT (Free)" }
        ]
    }
};

function listProviders() {
    return Object.values(PROVIDERS).map(function (provider) {
        return { id: provider.id, label: provider.label };
    });
}

function getProvider(providerId) {
    return PROVIDERS[providerId] || null;
}

function listModels(providerId) {
    const provider = getProvider(providerId);
    return provider ? provider.models : [];
}

function isValidModel(providerId, modelId) {
    const models = listModels(providerId);
    return models.some(function (model) {
        return model.id === modelId;
    });
}

module.exports = {
    listProviders,
    getProvider,
    listModels,
    isValidModel
};
