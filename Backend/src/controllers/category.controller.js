import slugify from "slugify";
import Category from "../models/blogs/category.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryService.js";

export const getCategories = async (req, res) => {
  try {
    // Extract query params (with defaults)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Calculate how many to skip
    const skip = (page - 1) * limit;

    // Fetch total count for pagination
    const total = await Category.countDocuments();

    // Fetch paginated categories
    const categories = await Category.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      message: "Categories fetched successfully.",
      data: categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};

// POST Request
export const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      parentCategory,
      seo,
      isActive,
      isFeatured,
      showInMenu,
      translations,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });
    const existing = await Category.findOne({ slug });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists." });
    }

    let imageUrl = null;
    let iconUrl = null;

    // Upload image if provided
    if (req.files?.image?.[0]?.path) {
      const uploadImg = await uploadToCloudinary(
        req.files.image[0].path,
        "categories/images"
      );
      imageUrl = uploadImg.secure_url;
    }

    // Upload icon if provided
    if (req.files?.icon?.[0]?.path) {
      const uploadIcon = await uploadToCloudinary(
        req.files.icon[0].path,
        "categories/icons"
      );
      iconUrl = uploadIcon.secure_url;
    }

    // Create new category
    const category = await Category.create({
      name,
      slug,
      description,
      parentCategory:
        parentCategory && parentCategory !== "none" && parentCategory !== ""
          ? parentCategory
          : null,
      seo,
      isActive,
      isFeatured,
      showInMenu,
      image: imageUrl,
      icon: iconUrl,
      translations,
      createdBy: req.user._id,
    });

    // Link with parent if it exists and valid
    if (parentCategory && parentCategory !== "none") {
      const parent = await Category.findById(parentCategory);
      if (parent) {
        parent.subCategories.push(category._id);
        await parent.save();
      }
    }

    return res.status(201).json({
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    console.error("Error While Create Category:", error.message);

    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};

// PUT Request
// NEW: Handles updating an existing category (for PUT requests)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL parameter
    const {
      name,
      description,
      parentCategory,
      seo,
      isActive,
      isFeatured,
      showInMenu,
      translations,
    } = req.body;

    let category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Handle image update
    if (req.files?.image?.[0]?.path) {
      // If a new image is uploaded and an old one exists, delete it first
      if (category.image) {
        try {
          const oldPublicId = category.image.split("/").pop().split(".")[0];
          await destroyFromCloudinary(`categories/images/${oldPublicId}`);
        } catch (e) {
          console.warn("Old image deletion failed, continuing...", e.message);
        }
      }
      const uploadImg = await uploadToCloudinary(
        req.files.image[0].path,
        "categories/images"
      );
      category.image = uploadImg.secure_url;
    }

    // Handle icon update
    if (req.files?.icon?.[0]?.path) {
      // If a new icon is uploaded and an old one exists, delete it first
      if (category.icon) {
        try {
          const oldPublicId = category.icon.split("/").pop().split(".")[0];
          await destroyFromCloudinary(`categories/icons/${oldPublicId}`);
        } catch (e) {
          console.warn("Old icon deletion failed, continuing...", e.message);
        }
      }
      // Corrected from req.files.image[0].path to req.files.icon[0].path
      const uploadIcon = await uploadToCloudinary(
        req.files.icon[0].path,
        "categories/icons"
      );
      category.icon = uploadIcon.secure_url;
    }

    // Update fields
    if (name) {
      category.name = name;
      category.slug = slugify(name, { lower: true, strict: true });
    }
    category.description = description ?? category.description;
    category.parentCategory = parentCategory ?? category.parentCategory;
    category.seo = seo ?? category.seo;
    category.isActive = isActive ?? category.isActive;
    category.isFeatured = isFeatured ?? category.isFeatured;
    category.showInMenu = showInMenu ?? category.showInMenu;
    category.image = imageUrl;
    category.icon = iconUrl;
    category.translations = translations ?? category.translations;
    category.updatedBy = req.user._id;

    await category.save();

    return res.status(200).json({
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};

// NEW: Handles partial updates for a category (for PATCH requests)
export const partiallyUpdateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // Contains only the fields to update, e.g., { isActive: false }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Dynamically apply updates from the request body
    Object.keys(updateData).forEach((key) => {
      category[key] = updateData[key];
    });

    // If the name is being updated, also update the slug
    if (updateData.name) {
      category.slug = slugify(updateData.name, { lower: true, strict: true });
    }

    category.updatedBy = req.user._id;
    await category.save();

    return res.status(200).json({
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};

export const destroyCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Category ID is required." });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Optional: Delete associated images from Cloudinary before deleting the document
    if (category.image) {
      try {
        const oldImagePublicId = category.image.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`categories/images/${oldImagePublicId}`);
      } catch (e) {
        console.warn(
          "Could not delete category image from Cloudinary:",
          e.message
        );
      }
    }
    if (category.icon) {
      try {
        const oldIconPublicId = category.icon.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`categories/icons/${oldIconPublicId}`);
      } catch (e) {
        console.warn(
          "Could not delete category icon from Cloudinary:",
          e.message
        );
      }
    }

    // Remove reference from parent category
    if (category.parentCategory) {
      const parent = await Category.findById(category.parentCategory);
      if (parent) {
        parent.subCategories = parent.subCategories.filter(
          (subId) => subId.toString() !== category._id.toString()
        );
        await parent.save();
      }
    }

    // This is the key correction: use findByIdAndDelete
    await Category.findByIdAndDelete(category._id);

    return res
      .status(200)
      .json({ message: "Category deleted successfully.", id });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};
