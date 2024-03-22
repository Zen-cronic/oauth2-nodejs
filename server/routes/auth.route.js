const { Router } = require("express");
const { oauthHandler } = require("../controllers/auth.controller");

const router = Router();

router.get("/oauth", oauthHandler);

module.exports = router;
