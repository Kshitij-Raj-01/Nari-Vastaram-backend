const productService = require("../services/product.service");

const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        return res.status(201).send(product);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    const productId = req.params.id;
    try {
        const result = await productService.deleteProduct(productId);
        return res.status(200).send(result);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

const updateProduct = async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await productService.updateProduct(productId, req.body);
        return res.status(200).send(product);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

const findProductById = async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await productService.findProductById(productId);
        return res.status(200).send(product);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const product = await productService.getAllProducts(req.query);
        return res.status(200).send(product);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

const createMultipleProduct = async (req, res) => {
    try {
        await productService.createMultipleProduct(req.body);
        return res.status(201).send({ message: "Products Created Successfully" });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// 🌸 The new controller for similar products
const getSimilarProducts = async (req, res) => {
    const productId = req.params.productId;
    try {
        const products = await productService.getSimilarProducts(productId);
        return res.status(200).send(products);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

module.exports = {
    createProduct,
    deleteProduct,
    updateProduct,
    findProductById,
    getAllProducts,
    createMultipleProduct,
    getSimilarProducts, // 💫 Don't forget this line!
};
