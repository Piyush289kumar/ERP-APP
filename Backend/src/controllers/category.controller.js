import slugify from "slugify";
import Category from "../models/blogs/category.model.js";

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
      image,
      icon,
      translations,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Category name is required..." });
    }

    // Generate Slug via Category Name if Slug is missing
    const slug = slugify(name, { lower: true, strict: true });

    // Check if Category already exists when creating new
    if (!id) {
      const existing = await Category.findOne({ slug });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Category with this name already exists." });
      }
    }

    let category;

    // If `id` exists -> Update Category
    if (id) {
      category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found.." });
      }

      // Update Fields
      category.name = name || category.name;
      category.slug = slug || category.slug;
      category.description = description || category.description;
      category.parentCategory = parentCategory || category.parentCategory;
      category.seo = seo || category.seo;
      category.isActive = isActive ?? category.isActive;
      category.isFeatured = isFeatured ?? category.isFeatured;
      category.showInMenu = showInMenu ?? category.showInMenu;
      category.image = image || category.image;
      category.icon = icon || category.icon;
      category.translations = translations || category.translations;
      category.updatedBy = req.user._id;

      await category.save();

      return res.status(200).json({
        message: "Category updated successfully.",
        category,
      });
    } else {
      // Else -> Create a New Category

      category = await Category.create({
        name,
        slug,
        description,
        parentCategory: parentCategory || null,
        seo,
        isActive,
        isFeatured,
        showInMenu,
        image,
        icon,
        translations,
        createdBy: req.user._id,
      });

      // If Sub-Category -> Add Reference to Parent
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
