import Gallery from "../models/gallery.model.js";
import {
  destroyFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinaryService.js";

// Get All Gallery (Admin)

export const getAllGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find()
      .populate("category", "name slug")
      .populate("createdBy updatedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (!gallery.length) {
      return res.status(404).json({ message: "No gallery records found." });
    }

    return res
      .status(200)
      .json({ message: "All galleries fetched successfully.", data: gallery });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get All Active Gallery  (Public)

export const getAllActiveGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find({ isActive: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();
    if (!gallery) {
      return res.status(404).json({ message: "No active gallery found." });
    }

    return res.status(200).json({
      message: "Active galleries fetched successfully.",
      data: gallery,
    });
  } catch (error) {
    console.error("Error fetching active gallery:", error);

    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get Active Gallery By ID  (Public)

export const getGalleryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Gallery Id is required." });
    }

    const gallery = await Gallery.findById(id)
      .populate("category", "name slug")
      .lean();

    if (!gallery) {
      return res.status(404).json({ message: "No gallery by ID found." });
    }

    return res.status(200).json({
      message: "Galleries fetched by ID successfully.",
      data: gallery,
    });
  } catch (error) {
    console.error("Error fetching gallery by ID:", error);

    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Create or Update Gallery (Protected)

export const modifyGallery = async (req, res) => {
  try {
    const { id, title, category, isActive } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Gallery title is required." });
    }

    let galleryMediaUrl = null;

    // Upload new media if provided
    if (req.files?.galleryMedia?.[0]?.path) {
      const uploadGalleryMedia = await uploadToCloudinary(
        req.files.galleryMedia[0].path,
        "gallery/media"
      );
      galleryMediaUrl = uploadGalleryMedia.secure_url;
    }

    // If `ID` exists -> Update Gallery Record
    if (id) {
      const gallery = await Gallery.findById(id);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery Record not found" });
      }

      // If New Gallery Media uploaded, delete old one
      if (galleryMediaUrl && gallery.image) {
        try {
          const oldPublicId = gallery.image.split("/").pop().split(".")[0];
          await destroyFromCloudinary(`gallery/media/${oldPublicId}`);
        } catch (e) {
          console.warn("Failed to delete old image:", e.message);
        }
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

      const gallery = await Gallery.create({
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

// Delete Gallery by ID
export const destroyGalleryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Gallery ID is required." });
    }

    const gallery = await Gallery.findOneAndDelete(id);

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found." });
    }

    // Delete Cloudinary image if exists
    if (gallery.image) {
      try {
        const oldPublicId = gallery.image.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`gallery/media/${oldPublicId}`);
      } catch (err) {
        console.warn("Cloudinary cleanup failed:", err.message);
      }
    }

    return res
      .status(200)
      .json({ message: "Gallery Delete by ID successfully." });
  } catch (error) {
    console.error("Error while Delete Gallery by ID:", error.message);

    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
