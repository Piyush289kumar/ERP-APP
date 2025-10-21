import Gallery from "../models/gallery.model.js";
import {
  destroyFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinaryService.js";

// Get All Gallery
export const getAllGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find()
      .populate("Category", "name slug")
      .populate("User", "name slug")
      .sort({ createdAt: -1 });
    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found." });
    }

    return res.status(200).json({ message: "Gallery Fetched.", data: gallery });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get All Gallery
export const getAllActiveGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find({ isActive: true })
      .populate("Category", "name slug")
      .populate("User", "name slug")
      .sort({ createdAt: -1 });
    if (!gallery) {
      return res.status(404).json({ message: "Active Gallery not found." });
    }

    return res
      .status(200)
      .json({ message: "Active Gallery Fetched.", data: gallery });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Create or Update Gallery
export const modifyGallery = async (req, res) => {
  try {
    const { id, title, category, isActive } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Gallery Title is required." });
    }

    let gallery;
    let galleryMediaUrl = null;

    if (req.files?.galleryMedia?.[0]?.path) {
      const uploadGalleryMedia = await uploadToCloudinary(
        req.files.galleryMedia[0].path,
        "gallery/media"
      );
      galleryMediaUrl = uploadGalleryMedia.secure_url;
    }

    // If `ID` exists -> Update Gallery Record
    if (id) {
      gallery = await Gallery.findById(id);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery Record not found" });
      }

      // If New Gallery Media uploaded, delete old one
      if (galleryMediaUrl && gallery.image) {
        const oldPublicId = gallery.image.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`gallery/media/${oldPublicId}`);
      }

      // Update Fields
      gallery.title = title || gallery.title;
      gallery.category = category || gallery.category;
      gallery.image = galleryMediaUrl || gallery.image;
      gallery.isActive = isActive ?? gallery.isActive;
      gallery.updatedBy = req.user._id;

      await gallery.save();

      return res.status(200).json({
        message: "Gallery Media updated successfully.",
        gallery,
      });
    } else {
      // Else -> Create a New Gallery Record

      const existing = await Gallery.findOne({ title });
      if (existing) {
        return res.status(400).json({
          message: "Gallery Media already exists with this title.",
        });
      }

      gallery = await Gallery.create({
        title,
        category,
        image: galleryMediaUrl,
        isActive,
        createdBy: req.user._id,
      });

      return res.status(201).json({
        message: "Gallery Media created successfully.",
        gallery,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
