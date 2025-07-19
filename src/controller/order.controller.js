const orderService = require("../services/order.service");

const createOrder = async (req, res) => {
    const user = await req.user;
    try{
        let createdOrder = await orderService.createOrder(user, req.body);
        return res.status(201).send(createdOrder);
    } catch(error){
        return res.status(500).send({error: error.message});
    }
}

const findOrderById = async (req, res) => {
    const user = await req.user;
    try{
        let createdOrder = await orderService.findOrderById(req.params.id);

// ✨ Break circular structure before sending response
const safeOrder = JSON.parse(JSON.stringify(createdOrder));

return res.status(200).send(safeOrder);

    } catch(error){
        return res.status(500).send({error: error.message});
    }
}

const orderHistory = async (req, res) => {
    const user = await req.user;
    try{
        let createdOrder = await orderService.usersOrderHistory(user._id);
        return res.status(200).send(createdOrder);
    } catch(error){
        return res.status(500).send({error: error.message});
    }
}

const cancelOrder = async (req, res) => {
    try {
      const order = await orderService.cancelOrder(req.params.id);
      console.log("cancel : ",order)
      res.status(200).send(order);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  };
  
  const returnOrder = async (req, res) => {
    try {
      const order = await orderService.returnOrder(req.params.id);
      res.status(200).send(order);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  };

module.exports = {
    createOrder,
    findOrderById,
    orderHistory,
    cancelOrder,
    returnOrder
}