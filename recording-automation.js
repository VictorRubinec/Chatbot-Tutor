// 🎬 Script de Automação para Gravação - Chat Tutor v2
// Cole no console do navegador (F12) enquanto grava a tela

const recordingScript = {
    currentStep: 0,
    isRunning: false,

    steps: [
        // Passo 1: Aguarde e mostre interface
        {
            name: "Cena 1: Interface Inicial",
            duration: 3000,
            action: async () => {
                console.log("✓ Interface carregada. Iniciando apresentação...");
            }
        },

        // Passo 2: Abra config
        {
            name: "Cena 2: Abrir Painel Config",
            duration: 2000,
            action: async () => {
                const configBtn = document.getElementById('config-toggle');
                configBtn?.click();
                console.log("✓ Painel Config aberto");
            }
        },

        // Passo 3: Feche config
        {
            name: "Cena 3: Fechar Config",
            duration: 1500,
            action: async () => {
                const configBtn = document.getElementById('config-toggle');
                configBtn?.click();
                console.log("✓ Painel Config fechado");
            }
        },

        // Passo 4: Digite pergunta 1
        {
            name: "Cena 4: Digitar Pergunta 1",
            duration: 3000,
            action: async () => {
                const input = document.getElementById('message-input');
                if (input) {
                    input.value = "O que é algoritmo de busca binária?";
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log("✓ Pergunta digitada");
                }
            }
        },

        // Passo 5: Envie mensagem 1
        {
            name: "Cena 5: Enviar Mensagem 1",
            duration: 1000,
            action: async () => {
                const sendBtn = document.getElementById('send-btn');
                sendBtn?.click();
                console.log("✓ Mensagem enviada");
            }
        },

        // Passo 6: Aguarde resposta 1
        {
            name: "Cena 6: Aguardando Resposta 1",
            duration: 6000,
            action: async () => {
                console.log("✓ Aguardando resposta da IA...");
            }
        },

        // Passo 7: Mude para Tutor Socrático
        {
            name: "Cena 7: Mudar para Tutor Socrático",
            duration: 2000,
            action: async () => {
                const modeSelect = document.getElementById('mode-select');
                if (modeSelect) {
                    modeSelect.value = 'socratic';
                    modeSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log("✓ Modo alterado para Socrático");
                }
            }
        },

        // Passo 8: Digite pergunta 2
        {
            name: "Cena 8: Digitar Pergunta 2",
            duration: 2000,
            action: async () => {
                const input = document.getElementById('message-input');
                if (input) {
                    input.value = "Como funciona recursão?";
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log("✓ Pergunta 2 digitada");
                }
            }
        },

        // Passo 9: Envie mensagem 2
        {
            name: "Cena 9: Enviar Mensagem 2",
            duration: 1000,
            action: async () => {
                const sendBtn = document.getElementById('send-btn');
                sendBtn?.click();
                console.log("✓ Mensagem 2 enviada");
            }
        },

        // Passo 10: Aguarde resposta 2
        {
            name: "Cena 10: Aguardando Resposta 2",
            duration: 6000,
            action: async () => {
                console.log("✓ Aguardando resposta socrática...");
            }
        },

        // Passo 11: Mude provedor para OpenRouter
        {
            name: "Cena 11: Mudar Provedor",
            duration: 2000,
            action: async () => {
                const providerSelect = document.getElementById('provider-select');
                if (providerSelect) {
                    providerSelect.value = 'openrouter';
                    providerSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log("✓ Provedor alterado para OpenRouter");
                }
            }
        },

        // Passo 12: Aguarde carregar modelos
        {
            name: "Cena 12: Aguardando Modelos",
            duration: 2000,
            action: async () => {
                console.log("✓ Modelos OpenRouter carregando...");
            }
        },

        // Passo 13: Mude para Tutor Direto
        {
            name: "Cena 13: Voltar para Tutor Direto",
            duration: 1500,
            action: async () => {
                const modeSelect = document.getElementById('mode-select');
                if (modeSelect) {
                    modeSelect.value = 'direct';
                    modeSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log("✓ Modo alterado para Direto");
                }
            }
        },

        // Passo 14: Digite pergunta 3
        {
            name: "Cena 14: Digitar Pergunta 3",
            duration: 2000,
            action: async () => {
                const input = document.getElementById('message-input');
                if (input) {
                    input.value = "Escreva um haiku sobre programação";
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log("✓ Pergunta 3 digitada");
                }
            }
        },

        // Passo 15: Envie mensagem 3
        {
            name: "Cena 15: Enviar Mensagem 3",
            duration: 1000,
            action: async () => {
                const sendBtn = document.getElementById('send-btn');
                sendBtn?.click();
                console.log("✓ Mensagem 3 enviada");
            }
        },

        // Passo 16: Aguarde resposta 3
        {
            name: "Cena 16: Aguardando Resposta 3",
            duration: 6000,
            action: async () => {
                console.log("✓ Aguardando resposta criativa...");
            }
        },

        // Passo 17: Final
        {
            name: "Cena 17: Apresentação Completa",
            duration: 2000,
            action: async () => {
                console.log("🎉 Gravação concluída! Clique em parar gravação.");
                console.log("📊 Dicas: Converta para GIF usando FFmpeg ou ezgif.com");
            }
        }
    ],

    async run() {
        if (this.isRunning) {
            console.warn("⚠️ Script já está em execução!");
            return;
        }

        this.isRunning = true;
        console.clear();
        console.log("🎬 INICIANDO AUTOMAÇÃO DE GRAVAÇÃO");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`Total de passos: ${this.steps.length}`);
        console.log(`Duração estimada: ${Math.round(this.getTotalDuration() / 1000)}s`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("");

        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];
            console.log(`[${i + 1}/${this.steps.length}] ⏳ ${step.name}`);

            await step.action();
            
            if (i < this.steps.length - 1) {
                await this.wait(step.duration);
            } else {
                await this.wait(step.duration);
            }
        }

        this.isRunning = false;
        console.log("");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ AUTOMAÇÃO FINALIZADA!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    },

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    getTotalDuration() {
        return this.steps.reduce((acc, step) => acc + step.duration, 0);
    },

    stop() {
        this.isRunning = false;
        console.log("🛑 Automação interrompida");
    },

    reset() {
        const input = document.getElementById('message-input');
        const clearBtn = document.querySelector('[id="clear-chat-btn"]');
        
        if (input) input.value = '';
        if (clearBtn) clearBtn.click();
        
        console.log("🔄 Chat limpo e resetado");
    }
};

// ============================================================
// 🚀 INSTRUÇÕES DE USO
// ============================================================
console.log(`
╔════════════════════════════════════════════════════════════╗
║         🎬 AUTOMAÇÃO DE GRAVAÇÃO - CHAT TUTOR V2           ║
╚════════════════════════════════════════════════════════════╝

📋 COMANDOS:

1️⃣  Iniciar automação:
    recordingScript.run()

2️⃣  Parar automação:
    recordingScript.stop()

3️⃣  Resetar chat:
    recordingScript.reset()

4️⃣  Ver informações:
    console.log(recordingScript.steps)

⚙️  ANTES DE INICIAR:
   ✓ Tenha certeza que a API está respondendo rápido
   ✓ Clique em "Iniciar gravação" primeiro
   ✓ Execute recordingScript.run() no console
   ✓ Deixe executar até o final

⏱️  DURAÇÃO: ~${Math.round(recordingScript.getTotalDuration() / 1000)} segundos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Export para fácil acesso
window.recordingScript = recordingScript;
