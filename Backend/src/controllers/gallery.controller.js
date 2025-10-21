import Gallery from "../models/gallery.model.js";

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
