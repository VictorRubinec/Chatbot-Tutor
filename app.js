// server.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const PORT = process.env.PORT || 3000;

require('dotenv').config();

console.log(process.env.BASE_PATH);

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
    console.log(`Server is running on port ${PORT}`);
    console.log(`App is available at: https://chatbot-r91ni7a0n-victorrubinecs-projects.vercel.app`);
});
