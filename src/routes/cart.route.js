const express = require("express");
const router = express.Router();

const cartController = require("../controller/cart.controller");
const authenticate = require("../middleware/authenticate");

router.get("/", authenticate, cartController.findUserCart);
router.put("/add", authenticate, cartController.addItemToCart);
router.post("/merge", authenticate, cartController.mergeGuestCart);

module.exports = router;
