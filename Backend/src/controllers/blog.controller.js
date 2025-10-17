import Blog from "../models/blogs/blog.model.js";

export const getAllFeatureBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    if (!blogs) {
      return res.status(404).json({ message: "Blogs not found." });
    }
    return res.status(200).json({ message: "Blog found.", data: blogs });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
