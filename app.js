// server.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const PORT = 3000;

var app = express();

const indexRouter = require("./src/routes/indexRoute.js");
const functionsRouter = require("./src/routes/functionsRoute.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.use("/", indexRouter);
app.use("/functions", functionsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
