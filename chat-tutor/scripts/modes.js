window.ChatModes = (function () {
    const MODES = {
        direct: {
            label: "Tutor Direto",
            description: "Resposta objetiva, curta e com passos"
        },
        socratic: {
            label: "Tutor Socratico",
            description: "Resposta por perguntas guiadas"
        }
    };

    function getMode(modeId) {
        return MODES[modeId] || MODES.direct;
    }

    return {
        getMode: getMode,
        all: MODES
    };
})();
