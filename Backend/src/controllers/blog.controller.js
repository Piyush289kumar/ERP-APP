import slugify from "slugify";
import Blog from "../models/blogs/blog.model.js";

// Fetch all blogs (with filters, pagination, and search)
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category, isActive } = req.query;
    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === "true";

    // Text Search (on Title, Description, MetaKeywords)
    if (search) query.$text = { $search: search };

    const blogs = await Blog.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      message: "Blogs fetched successfully.",
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
      data: blogs,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Fetch all featured blogs

export const getAllFeatureBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isFeature: true, isActive: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(10);

    if (!blogs.length) {
      return res.status(404).json({ message: "No featured blogs found." });
    }

    return res
      .status(200)
      .json({ message: "Featured blogs fetched successfully.", data: blogs });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get a single blog by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug })
      .populate("category", "name slug")
      .populate("createdBy", "name email");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    res.status(200).json({ message: "Blog fetched successfully.", data: blog });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Create or Update a blog (by ID if exists)

export const modifyBlogBySlug = async (req, res) => {
  try {
    const {
      id,
      title,
      category,
      thumbnail,
      gallery_images,
      video_link,
      read_time,
      short_description,
      description,
      seo,
      isActive,
      isFeature,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    // Generate Slug via Blog Title if Slug is missing
    const slug = slugify(title, { lower: true, strict: true });

    // Check if Blog already exists when Creating new
    if (!id) {
      const existing = await Blog.findOne({ slug });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Blog with this name already exits." });
      }
    }

    let blog;
    // If `id` exists -> Update Blog
    if (id) {
      blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({ message: "Blog is not found." });
      }

      // Update Fields
      blog.title = title || blog.title;
      blog.slug = slug || blog.slug;
      blog.description = description || blog.description;
      blog.category = category || blog.category;
      blog.thumbnail = thumbnail || blog.thumbnail;
      blog.gallery_images = gallery_images || blog.gallery_images;
      blog.video_link = video_link || blog.video_link;
      blog.read_time = read_time || blog.read_time;
      blog.short_description = short_description || blog.short_description;
      blog.description = description || blog.description;
      blog.seo = seo || blog.seo;
      blog.isActive = isActive ?? blog.isActive;
      blog.isFeature = isFeature ?? blog.isFeature;
      blog.updatedBy = req.user._id;

      await blog.save();

      return res.status(200).json({
        message: "Blog updated successfully.",
        blog,
      });
    } else {
      // Else -> Create a New Category

      blog = await Blog.create({
        title,
        slug,
        category,
        thumbnail,
        gallery_images,
        video_link,
        read_time,
        short_description,
        description,
        seo,
        isActive,
        isFeature,
        createdBy: req.user._id,
      });

      return res.status(201).json({
        message: "Blog created successfully.",
        blog,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete blog by slug

export const destroyBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ message: "Valid slug is required." });
    }

    const deleteBlog = await Blog.findOneAndDelete({ slug });
    if (!deleteBlog) {
      return res
        .status(404)
        .json({ message: `No blog found with slug: ${slug}.` });
    }

    return res.status(200).json({ message: "Blog delete successfully.", slug });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
