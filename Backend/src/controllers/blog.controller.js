import slugify from "slugify";
import Blog from "../models/blog.model.js";
import {
  uploadToCloudinary,
  destroyFromCloudinary,
} from "../utils/cloudinaryService.js";

/* ================================
   🟢 PUBLIC CONTROLLERS
   ================================ */

/**
 * @desc Get all active blogs (public)
 * @route GET /api/v1/blog?page=1&limit=10&search=&sortBy=createdAt&sortOrder=desc
 */
export const getAllActiveBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate("category", "name slug")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: "Active blogs fetched successfully.",
      data: blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching active blogs:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc Get single blog by slug (public)
 * @route GET /api/v1/blog/:slug
 */
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate("category", "name slug")
      .lean();

    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    res.status(200).json({
      success: true,
      message: "Blog fetched successfully.",
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/* ================================
   🔒 ADMIN CONTROLLERS
   ================================ */

/**
 * @desc Get all blogs (admin, paginated + search + sort)
 * @route GET /api/v1/blog/admin/all
 */
export const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "seo.metaKeywords": { $regex: search, $options: "i" } },
      ];
    }

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate("category", "name slug")
      .populate("createdBy updatedBy", "name email")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully.",
      data: blogs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc Create new blog
 * @route POST /api/v1/blog/admin
 */
export const createBlog = async (req, res) => {
  try {
    const { title, category, isActive = true, isFeature = false } = req.body;
    if (!title?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Title is required." });

    const slug = slugify(title, { lower: true, strict: true });
    const existing = await Blog.findOne({ slug });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Blog already exists." });

    let thumbnailUrl = null;
    if (req.files?.thumbnail?.[0]?.path) {
      const upload = await uploadToCloudinary(
        req.files.thumbnail[0].path,
        "blog/thumbnails"
      );
      thumbnailUrl = upload.secure_url;
    }

    const galleryImages = [];
    if (req.files?.gallery_images?.length) {
      for (const file of req.files.gallery_images) {
        const upload = await uploadToCloudinary(file.path, "blog/gallery");
        galleryImages.push(upload.secure_url);
      }
    }

    const blog = await Blog.create({
      title: title.trim(),
      slug,
      category: category || null,
      thumbnail: thumbnailUrl,
      gallery_images: galleryImages,
      isActive,
      isFeature,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully.",
      data: blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc Update blog (PUT)
 * @route PUT /api/v1/blog/admin/:slug
 */
export const updateBlog = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, category, isActive, isFeature } = req.body;

    const blog = await Blog.findOne({ slug });
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    // Handle thumbnail
    if (req.files?.thumbnail?.[0]?.path) {
      if (blog.thumbnail) {
        const oldPublicId = blog.thumbnail.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`blog/thumbnails/${oldPublicId}`);
      }
      const upload = await uploadToCloudinary(
        req.files.thumbnail[0].path,
        "blog/thumbnails"
      );
      blog.thumbnail = upload.secure_url;
    }

    // Handle gallery images
    if (req.files?.gallery_images?.length) {
      for (const img of blog.gallery_images || []) {
        const oldId = img.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`blog/gallery/${oldId}`);
      }

      const uploads = [];
      for (const file of req.files.gallery_images) {
        const upload = await uploadToCloudinary(file.path, "blog/gallery");
        uploads.push(upload.secure_url);
      }
      blog.gallery_images = uploads;
    }

    if (title) {
      blog.title = title.trim();
      blog.slug = slugify(title, { lower: true, strict: true });
    }

    blog.category = category || blog.category;
    blog.isActive = typeof isActive !== "undefined" ? isActive : blog.isActive;
    blog.isFeature =
      typeof isFeature !== "undefined" ? isFeature : blog.isFeature;
    blog.updatedBy = req.user._id;

    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog updated successfully.",
      data: blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc Partial update blog
 * @route PATCH /api/v1/blog/admin/:slug
 */
export const partiallyUpdateBlog = async (req, res) => {
  try {
    const { slug } = req.params;
    const updates = req.body;

    const blog = await Blog.findOne({ slug });
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    Object.entries(updates).forEach(([key, val]) => {
      if (val !== undefined && key !== "_id") blog[key] = val;
    });

    blog.updatedBy = req.user._id;
    await blog.save();

    res
      .status(200)
      .json({ success: true, message: "Blog partially updated.", data: blog });
  } catch (error) {
    console.error("Error partially updating blog:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc Delete blog by slug
 * @route DELETE /api/v1/blog/admin/:slug
 */
export const destroyBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    if (blog.thumbnail) {
      const id = blog.thumbnail.split("/").pop().split(".")[0];
      await destroyFromCloudinary(`blog/thumbnails/${id}`);
    }

    if (blog.gallery_images?.length) {
      for (const img of blog.gallery_images) {
        const id = img.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`blog/gallery/${id}`);
      }
    }

    await Blog.deleteOne({ slug });

    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully.", slug });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
