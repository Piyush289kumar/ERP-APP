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

export const modifyCategory = async (req, res) => {
  try {
    const {
      id, // Optional for update
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

    // Prevent duplicate slug when creating
    if (!id) {
      const existing = await Category.findOne({ slug });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Category with this name already exists." });
      }
    }

    let category;
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

    // If updating
    if (id) {
      category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found." });
      }

      // If new image uploaded, delete old one
      if (imageUrl && category.image) {
        const oldImagePublicId = category.image.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`categories/images/${oldImagePublicId}`);
      }

      // If new icon uploaded, delete old one
      if (iconUrl && category.icon) {
        const oldIconPublicId = category.icon.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`categories/icons/${oldIconPublicId}`);
      }

      // Update fields
      category.name = name || category.name;
      category.slug = slug || category.slug;
      category.description = description || category.description;
      category.parentCategory = parentCategory || category.parentCategory;
      category.seo = seo || category.seo;
      category.isActive = isActive ?? category.isActive;
      category.isFeatured = isFeatured ?? category.isFeatured;
      category.showInMenu = showInMenu ?? category.showInMenu;
      category.image = imageUrl || category.image;
      category.icon = iconUrl || category.icon;
      category.translations = translations || category.translations;
      category.updatedBy = req.user._id;

      await category.save();

      return res.status(200).json({
        message: "Category updated successfully.",
        category,
      });
    } else {
      // Create new category
      category = await Category.create({
        name,
        slug,
        description,
        parentCategory: parentCategory || null,
        seo,
        isActive,
        isFeatured,
        showInMenu,
        image: imageUrl,
        icon: iconUrl,
        translations,
        createdBy: req.user._id,
      });

      // Link with parent if it exists
      if (parentCategory) {
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
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};

export const destroyCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params; // Use URL param

    if (!slug) {
      return res.status(400).json({ message: "Category slug is required." });
    }

    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
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

    await Category.findByIdAndDelete(category._id);

    return res
      .status(200)
      .json({ message: "Category is deleted successfully.", slug });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};
