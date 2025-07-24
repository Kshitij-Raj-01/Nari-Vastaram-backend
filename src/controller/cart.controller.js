const cartService = require("../services/cart.service");

const findUserCart = async (req, res) => {
    const user = req.user;
    try{
        const cart = await cartService.findUserCart(user._id);
        return res.status(200).send(cart);
    }catch(error){
        return res.status(500).send({error: error.message});
    }
}

const addItemToCart = async (req, res) => {
    const user = req.user;
    try{
        const cartItem = await cartService.addCartItem(user._id, req.body);
        return res.status(200).send(cartItem);
    }catch(error){
        return res.status(500).send({error: error.message});
    }
}

const mergeGuestCart = async (req, res) => {
  const userId = req.user._id;
  const items = req.body.items;

  try {
    await cartService.mergeGuestCartItems(userId, items);
    return res.status(200).json({ message: "Guest cart merged." });
  } catch (err) {
    console.error("Merge cart error:", err);
    return res.status(500).json({ message: "Failed to merge cart." });
  }
};

module.exports = {
    findUserCart,
    addItemToCart,
    mergeGuestCart
}
