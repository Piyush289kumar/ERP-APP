import slugify from "slugify";
import Blog from "../models/blogs/blog.model.js";
import {
  uploadToCloudinary,
  destroyFromCloudinary,
} from "../utils/cloudinaryService.js";

/* Helper: Format mongoose validation errors */
const formatErrors = (err) => {
  const errors = {};
  if (err.errors) {
    for (const [key, val] of Object.entries(err.errors)) {
      errors[key] = val.message;
    }
  }
  return errors;
};

/* ================================
   🟢 PUBLIC CONTROLLERS
   ================================ */
export const getAllActiveBlogs = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const search = req.query.search?.trim() || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

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
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Active blogs fetched successfully",
      data: blogs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate("category", "name slug")
      .lean();

    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    res.status(200).json({ success: true, data: blog });
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/* ================================
   🔒 ADMIN CONTROLLERS
   ================================ */
export const getAllBlogs = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const search = req.query.search?.trim() || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { "seo.metaKeywords": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate("category", "name slug")
      .populate("createdBy updatedBy", "name email")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      data: blogs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createBlog = async (req, res) => {
  const uploaded = { thumbnail: null, gallery: [] };

  try {
    const { title, category, isActive = true, isFeature = false } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { title: "Title is required" },
      });
    }

    const slug = slugify(title, { lower: true, strict: true });
    if (await Blog.findOne({ slug })) {
      return res.status(400).json({
        success: false,
        message: "A blog with this title already exists.",
      });
    }

    // Upload thumbnail
    let thumbnailUrl = null;
    if (req.files?.thumbnail?.[0]?.path) {
      const upload = await uploadToCloudinary(req.files.thumbnail[0].path, "blog/thumbnails");
      thumbnailUrl = upload.secure_url;
      uploaded.thumbnail = upload.public_id;
    }

    // Upload gallery
    const galleryImages = [];
    if (req.files?.gallery_images?.length) {
      for (const file of req.files.gallery_images) {
        const up = await uploadToCloudinary(file.path, "blog/gallery");
        galleryImages.push(up.secure_url);
        uploaded.gallery.push(up.public_id);
      }
    }

    const blog = await Blog.create({
      title: title.trim(),
      slug,
      category: category || null,
      thumbnail: thumbnailUrl,
      gallery_images: galleryImages,
      isActive: isActive === "true" || isActive === true,
      isFeature: isFeature === "true" || isFeature === true,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: "Blog created successfully", data: blog });
  } catch (err) {
    console.error("Error creating blog:", err);

    // Rollback cloud uploads
    if (uploaded.thumbnail) await destroyFromCloudinary(uploaded.thumbnail);
    for (const id of uploaded.gallery) await destroyFromCloudinary(id);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatErrors(err),
      });
    }

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    // Thumbnail replace
    if (req.files?.thumbnail?.[0]?.path) {
      if (blog.thumbnail) {
        const id = blog.thumbnail.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`blog/thumbnails/${id}`);
      }
      const up = await uploadToCloudinary(req.files.thumbnail[0].path, "blog/thumbnails");
      blog.thumbnail = up.secure_url;
    }

    // Replace gallery
    if (req.files?.gallery_images?.length) {
      for (const img of blog.gallery_images) {
        const id = img.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`blog/gallery/${id}`);
      }
      const uploads = [];
      for (const file of req.files.gallery_images) {
        const up = await uploadToCloudinary(file.path, "blog/gallery");
        uploads.push(up.secure_url);
      }
      blog.gallery_images = uploads;
    }

    // Update fields
    const { title, category, isActive, isFeature } = req.body;
    if (title) {
      blog.title = title.trim();
      blog.slug = slugify(title, { lower: true, strict: true });
    }

    blog.category = category || blog.category;
    blog.isActive = isActive ?? blog.isActive;
    blog.isFeature = isFeature ?? blog.isFeature;
    blog.updatedBy = req.user._id;

    await blog.save();
    res.status(200).json({ success: true, message: "Blog updated successfully", data: blog });
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const partiallyUpdateBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    Object.entries(req.body).forEach(([k, v]) => {
      if (v !== undefined && k !== "_id") blog[k] = v;
    });

    blog.updatedBy = req.user._id;
    await blog.save();

    res.status(200).json({ success: true, message: "Blog partially updated", data: blog });
  } catch (err) {
    console.error("Error partially updating blog:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const destroyBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    // Clean up Cloudinary
    if (blog.thumbnail) {
      const id = blog.thumbnail.split("/").pop().split(".")[0];
      await destroyFromCloudinary(`blog/thumbnails/${id}`);
    }
    for (const img of blog.gallery_images || []) {
      const id = img.split("/").pop().split(".")[0];
      await destroyFromCloudinary(`blog/gallery/${id}`);
    }

    await Blog.deleteOne({ slug: req.params.slug });
    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
