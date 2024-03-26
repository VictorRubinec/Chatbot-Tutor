var express = require("express");
var router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const functionsController = require("../controllers/functionsController.js");

router.get("/", function (req, res) {
    functionsController.testar(req, res);
});

router.post("/chat", function (req, res) {
    functionsController.respostaGPT(req, res);
});

router.post("/transcribe-audio", upload.single('audio'), function (req, res) {
    functionsController.transcreverAudio(req, res);
});

router.post("/falar-audio", function (req, res) {
    functionsController.falarAudio(req, res);
});

module.exports = router;