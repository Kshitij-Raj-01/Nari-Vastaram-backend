const CartItem = require("../models/cartItem.model");
const userService = require("../services/user.service");

async function updateCartItem(userId, cartItemId, cartItemData){
    try{
        const item = await findCartItemById(cartItemId);

        if(!item){
            throw new Error("Cart item not found : ",cartItemId);
        }
        const user = await userService.findUserById(item.userId)
        if(!user){
            throw new Error("user not found : ",userId);
        }

        if(user._id.toString()===userId.toString()){
            item.quantity = cartItemData.quantity;
            const updatedCartItem = await item.save();
            return updatedCartItem;
        }
        else{
            throw new Error("You can't update this cart item");
        }
    } catch(error){
        throw new Error(error.message)
    }
}

async function removeCartItem(userId, cartItemId){
    const cartItem = await findCartItemById(cartItemId);
    const user = await userService.findUserById(userId);

    if(user._id.toString()===cartItem.userId.toString()){
        await CartItem.findByIdAndDelete(cartItemId)
    }
    else{
        throw new Error("You can't remove another user's item");
    }
}

async function findCartItemById(cartItemId){
    const cartItem = await CartItem.findById(cartItemId).populate("product");
    if(cartItem){
        return cartItem;
    }
    else{
        throw new Error("cartitem not found with id : ",cartItemId);
    }
}

module.exports = { 
    updateCartItem,
    removeCartItem,
    findCartItemById
}