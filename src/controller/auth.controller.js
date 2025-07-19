const userService = require("../services/user.service");
const jwtProvider = require("../config/jwtProvider");
const bcrypt = require("bcrypt");
const cartService = require("../services/cart.service")

const register = async (req, res) => {
    try {
      const user = await userService.createUser(req.body);
      const jwt = jwtProvider.generateToken(user._id);
  
      await cartService.createCart(user);
  
      return res.status(200).send({ jwt, message: "Register success 💖" });
    } catch (error) {
      if (error.message.includes("already exists")) {
        return res.status(400).send({ error: error.message }); // 💌 Custom message
      }
      return res.status(500).send({ error: "Something went wrong. Please try again later. 💔" });
    }
  };
  
  
  

const login = async(req,res) => {
    const { password, email } = req.body;
    console.log("Incoming Login:", email);

    try {
        const user = await userService.getUserByEmail(email);
        console.log("Fetched User:", user);

        if(!user){
            return res.status(404).send({ message: `User not found with email: ${email}` });
        }

        if (!user.password) {
            return res.status(500).send({ message: "User password not found in DB" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid){
            return res.status(401).send({message: "Invalid Password..."})
        }

        const jwt = jwtProvider.generateToken(user._id);
        return res.status(200).send({jwt, message: "login success"})

    } catch(error) {
        console.error("Login Error:", error.message);
        return res.status(500).send({error: error.message})
    }
}


module.exports = { register, login }