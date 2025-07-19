const Product = require("../models/product.model");

async function createProduct(reqData) {
  const product = new Product({
    title: reqData.title,
    color: reqData.color,
    description: reqData.description,
    discountedPrice: reqData.discountedPrice,
    discountPercent: reqData.discountPercent,
    imageUrl: reqData.imageUrl,
    brand: reqData.brand,
    price: reqData.price,
    sizes: reqData.size, // Array of { name, quantity }
    quantity: reqData.quantity,
    categories: reqData.category,
    highlights: reqData.highlights, // ✅ New
    details: reqData.details, // ✅ New
  });

  return await product.save();
}


async function deleteProduct(productId) {
  await Product.findByIdAndDelete(productId);
  return "Product deleted Successfully";
}

async function updateProduct(productId, reqData) {
  return await Product.findByIdAndUpdate(productId, reqData, { new: true });
}

async function findProductById(id) {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found with id: " + id);
  return product;
}

async function getAllProducts(reqQuery) {
  let {
    category, color, sizes,
    minPrice, maxPrice, minDiscount,
    sort, stock, pageNumber, pageSize
  } = reqQuery;

  pageNumber = parseInt(pageNumber) || 1;
  pageSize = parseInt(pageSize) || 10;

  let query = Product.find();

  // 🔎 Filter by category name from flat array
  if (category) {
    query = query.where("categories").in([category]);
  }

  // 🎨 Filter by color (supports multiple comma-separated values)
  if (color) {
    const keywords = color
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);
  
    // Build regex for each keyword (e.g. "white" => /white/i)
    const regexes = keywords.map(k => new RegExp(k, "i"));
  
    // Match any element in the array that partially matches any keyword
    query = query.where("color").elemMatch({ $in: regexes });
  }
  
  

  // 📏 Filter by sizes (matches size.name)
  if (sizes) {
    const sizesSet = new Set(sizes.split(",").map(s => s.trim()));
    query = query.where("sizes.name").in([...sizesSet]);
  }

  // 💰 Price range
  if (minPrice && maxPrice) {
    query = query.where("discountedPrice").gte(minPrice).lte(maxPrice);
  }

  // 🎁 Minimum discount
  if (minDiscount) {
    query = query.where("discountPercent").gt(minDiscount);
  }

  // 🧺 Stock filter
  if (stock === "in_stock") {
    query = query.where("quantity").gt(0);
  } else if (stock === "out_of_stock") {
    query = query.where("quantity").lt(1);
  }

  // 🔀 Sorting
  if (sort) {
    switch (sort.toLowerCase()) {
      case "price: low to high":
        query = query.sort({ discountedPrice: 1 });
        break;
      case "price: high to low":
        query = query.sort({ discountedPrice: -1 });
        break;
      case "newest":
        query = query.sort({ createdAt: -1 });
        break;
    }
  }

  const totalProducts = await Product.countDocuments(query.clone());
  const skip = (pageNumber - 1) * pageSize;
  const products = await query.skip(skip).limit(pageSize).exec();
  const totalPages = Math.ceil(totalProducts / pageSize);
  console.log("Service : ",products)

  return { content: products, currentPage: pageNumber, totalPages };
}

async function createMultipleProduct(products) {
  for (let product of products) {
    await createProduct(product);
  }
}

// Find similar products by category
async function getSimilarProducts(productId) {
  const currentProduct = await Product.findById(productId);
  if (!currentProduct) {
    throw new Error("Product not found");
  }

  const similarProducts = await Product.find({
    _id: { $ne: productId },
    categories: { $in: currentProduct.categories },
  }).limit(10);

  return similarProducts;
}



module.exports = {
  createProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  findProductById,
  createMultipleProduct,
  getSimilarProducts
};
