const express = require("express");
const cors = require("cors");
const path = require("path");
const https = require("https");
const fs = require("fs");

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const DOMAIN = process.env.DOMAIN || "localhost";

const PROJETO = process.env.DEBUG || "desenvolvimento";

var app = express();

const indexRouter = require("./src/routes/indexRoute.js");
const functionsRouter = require("./src/routes/functionsRoute.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

const base_path = process.env.BASE_PATH || "/";

app.use(base_path, indexRouter);
app.use(`${base_path}functions`, functionsRouter);

if (PROJETO === "desenvolvimento") {
  // Criando um servidor HTTP
  app.listen(PORT, () => {
    console.log(`O servidor está rodando na porta ${PORT}`);
    console.log(`Aplicação disponível em: http://${HOST}:${PORT}`);
    console.log(`Nome do domínio: ${DOMAIN}`);
  });
} else if (PROJETO === "produção") {

  const privateKeyPath = `/etc/letsencrypt/live/${DOMAIN}/privkey.pem`;
  const certificatePath = `/etc/letsencrypt/live/${DOMAIN}/fullchain.pem`;

  // Configurações para o servidor HTTPS
  const httpsOptions = {
    key: fs.readFileSync(privateKeyPath),
    cert: fs.readFileSync(certificatePath)
  };

  const server = https.createServer(httpsOptions, app);

  // Criando um servidor HTTPS
  server.listen(PORT, () => {
    console.log(`O servidor está rodando na porta ${PORT}`);
    console.log(`Aplicação disponível em: http://${HOST}:${PORT}`);
    console.log(`Nome do domínio: ${DOMAIN}`);
  });
}


