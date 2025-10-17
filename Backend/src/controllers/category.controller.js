import Category from "../models/blogs/category.model.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    if (!categories) {
      return res.status(404).json({ message: "Categories  not found." });
    }

    return res.status(200).json({
      message: "Categories Found.",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error });
  }
};
