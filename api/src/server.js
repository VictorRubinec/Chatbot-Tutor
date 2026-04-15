const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { listProviders, listModels, isValidModel, getProvider } = require("./config/providers");
const { isValidMode } = require("./services/modes");
const { sendChat } = require("./services/chat-service");
const { transcribeAudio } = require("./services/transcribe-service");

dotenv.config();

const app = express();

const corsOrigin = parseCorsOrigins(process.env.CORS_ORIGIN);
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.post("/transcribe", express.raw({
    limit: "12mb",
    type: function (req) {
        const contentType = req.headers["content-type"] || "";
        return contentType.startsWith("audio/");
    }
}), async function (req, res) {
    try {
        if (!req.body || !req.body.length) {
            res.status(400).json({ error: "Audio nao enviado" });
            return;
        }

        const mimeType = req.headers["content-type"] || "audio/webm";
        const text = await transcribeAudio(req.body, mimeType);
        res.json({ text });
    } catch (error) {
        res.status(500).json({
            error: "Falha ao transcrever audio",
            details: error.message
        });
    }
});

app.get("/health", function (req, res) {
    res.json({
        status: "ok",
        service: "chat-tutor-api",
        time: new Date().toISOString()
    });
});

app.get("/providers", function (req, res) {
    const providers = listProviders().map(function (provider) {
        const providerDef = getProvider(provider.id);
        const enabled = Boolean(providerDef && process.env[providerDef.envKey]);
        return {
            id: provider.id,
            label: provider.label,
            enabled
        };
    });

    res.json({ providers });
});

app.get("/models", function (req, res) {
    const provider = req.query.provider;

    if (!provider) {
        res.status(400).json({ error: "Query param provider e obrigatorio" });
        return;
    }

    const models = listModels(provider);
    if (models.length === 0) {
        res.status(404).json({ error: "Provedor nao encontrado ou sem modelos" });
        return;
    }

    const providerDef = getProvider(provider);
    if (!providerDef || !process.env[providerDef.envKey]) {
        res.status(503).json({ error: "Provedor sem chave configurada no backend" });
        return;
    }

    res.json({ provider, models });
});

app.post("/chat", async function (req, res) {
    try {
        const provider = req.body.provider;
        let model = req.body.model;
        const mode = req.body.mode;
        const messages = req.body.messages;

        if (!provider || !model || !mode || !Array.isArray(messages)) {
            res.status(400).json({
                error: "Campos obrigatorios: provider, model, mode, messages"
            });
            return;
        }

        if (!isValidMode(mode)) {
            res.status(400).json({ error: "Modo invalido" });
            return;
        }

        if (!isValidModel(provider, model)) {
            const fallbackModels = listModels(provider);
            model = fallbackModels[0] ? fallbackModels[0].id : model;
        }

        const sanitizedMessages = sanitizeMessages(messages);
        if (sanitizedMessages.length === 0) {
            res.status(400).json({ error: "A lista de mensagens esta vazia" });
            return;
        }

        const result = await sendChat({
            provider,
            model,
            mode,
            messages: sanitizedMessages
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: "Falha ao processar chat",
            details: error.message
        });
    }
});

app.use(function (req, res) {
    res.status(404).json({ error: "Rota nao encontrada" });
});

function sanitizeMessages(messages) {
    return messages
        .filter(function (message) {
            return message && (message.role === "user" || message.role === "assistant") && typeof message.content === "string";
        })
        .map(function (message) {
            return {
                role: message.role,
                content: message.content.slice(0, 5000)
            };
        })
        .slice(-20);
}

function parseCorsOrigins(value) {
    if (!value || value.trim() === "*") {
        return true;
    }

    const isProduction = process.env.NODE_ENV === "production";

    const origins = value
        .split(",")
        .map(function (item) {
            return normalizeOrigin(item);
        })
        .filter(Boolean);

    return function (origin, callback) {
        if (!origin) {
            callback(null, true);
            return;
        }

        const normalizedOrigin = normalizeOrigin(origin);
        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);

        if (origins.includes(normalizedOrigin) || (!isProduction && isLocalhost)) {
            callback(null, true);
            return;
        }

        callback(new Error("Origem nao permitida pelo CORS: " + normalizedOrigin));
    };
}

function normalizeOrigin(value) {
    if (!value) {
        return "";
    }

    const trimmed = String(value).trim();
    if (!trimmed) {
        return "";
    }

    try {
        return new URL(trimmed).origin;
    } catch (error) {
        return trimmed.replace(/\/+$/, "");
    }
}

if (require.main === module) {
    const port = Number(process.env.PORT || 3000);
    app.listen(port, function () {
        console.log("API online na porta " + port);
    });
}

module.exports = {
    app
};
