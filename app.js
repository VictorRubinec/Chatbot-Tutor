// server.js

const express = require("express");
const cors = require("cors");
const path = require("path");

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

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

app.listen(PORT, () => {
    console.log(`O SERVIDOR ESTÁ RODANDO NA PORTA ${PORT}`);
    console.log(`Aplicação disponível em: http://${HOST}:${PORT}`);
});
