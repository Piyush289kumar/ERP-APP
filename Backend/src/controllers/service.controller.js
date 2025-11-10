import slugify from "slugify";
import Service from "../models/service.model.js";
import {
  destroyFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinaryService.js";

/**
 * 🟢 Get All Services (Admin)
 */
export const getServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const filter = search
      ? {
          $or: [
            { title: new RegExp(search, "i") },
            { subHeading: new RegExp(search, "i") },
            { description: new RegExp(search, "i") },
          ],
        }
      : {};

    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter)
      .populate("createdBy updatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      message: "Services fetched successfully.",
      data: services,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};

/**
 * 🟢 Get Active Services (Public)
 */
export const getAllActiveServices = async (req, res) => {
  try {
    const services = await Service.fetchActive(12);
    if (!services.length)
      return res.status(404).json({ message: "No active services found." });

    res.status(200).json({
      message: "Active services fetched successfully.",
      data: services,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};

/**
 * 🟢 Get Service by ID
 */
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id)
      .populate("createdBy updatedBy", "name email")
      .lean();

    if (!service)
      return res.status(404).json({ message: "Service not found." });

    res.status(200).json({
      message: "Service fetched successfully.",
      data: service,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};

/**
 * 🟢 Create Service
 */
export const createService = async (req, res) => {
  try {
    const { title, subHeading, description, isActive } = req.body;

    if (!title || !description)
      return res
        .status(400)
        .json({ message: "Title and description are required." });

    // Prevent duplicate titles
    const existing = await Service.findOne({ title });
    if (existing)
      return res.status(400).json({ message: "Service title already exists." });

    let thumbnailUrl = null;
    if (req.files?.thumbnail?.[0]?.path) {
      const uploadThumb = await uploadToCloudinary(
        req.files.thumbnail[0].path,
        "service/thumbnail"
      );
      thumbnailUrl = uploadThumb.secure_url;
    }

    const service = await Service.create({
      title,
      subHeading,
      description,
      thumbnail: thumbnailUrl,
      isActive,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      message: "Service created successfully.",
      data: service,
    });
  } catch (error) {
    console.error("Error while creating service:", error.message);
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};

/**
 * 🟢 Update Service (PUT)
 */
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subHeading, description, isActive } = req.body;

    const service = await Service.findById(id);
    if (!service)
      return res.status(404).json({ message: "Service not found." });

    let thumbnailUrl = service.thumbnail;

    // Handle new thumbnail
    if (req.files?.thumbnail?.[0]?.path) {
      if (service.thumbnail) {
        try {
          const oldPublicId = service.thumbnail.split("/").pop().split(".")[0];
          await destroyFromCloudinary(`service/thumbnail/${oldPublicId}`);
        } catch (err) {
          console.warn("Failed to delete old thumbnail:", err.message);
        }
      }

      const uploadThumb = await uploadToCloudinary(
        req.files.thumbnail[0].path,
        "service/thumbnail"
      );
      thumbnailUrl = uploadThumb.secure_url;
    }

    // Update fields
    service.title = title ?? service.title;
    service.subHeading = subHeading ?? service.subHeading;
    service.description = description ?? service.description;
    service.isActive = isActive ?? service.isActive;
    service.thumbnail = thumbnailUrl;
    service.updatedBy = req.user?._id;

    await service.save();

    res
      .status(200)
      .json({ message: "Service updated successfully.", data: service });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};

/**
 * 🟢 Partial Update (PATCH)
 */
export const partiallyUpdateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const service = await Service.findById(id);
    if (!service)
      return res.status(404).json({ message: "Service not found." });

    // Dynamically apply updates
    for (const [key, value] of Object.entries(updates)) {
      if (key !== "_id" && value !== undefined) {
        service[key] = value;
      }
    }

    service.updatedBy = req.user?._id;
    await service.save();

    res.status(200).json({
      message: "Service updated successfully.",
      data: service,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Error", error: error.message });
  }
};

/**
 * 🟢 Delete Service (with Cloudinary Cleanup)
 */
export const destroyServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🧩 Find the service
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    // 🧹 1️⃣ Delete the thumbnail image from Cloudinary (if exists)
    if (service.thumbnail) {
      try {
        const thumbPublicId = service.thumbnail.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`service/thumbnail/${thumbPublicId}`);
      } catch (err) {
        console.warn("⚠️ Failed to delete thumbnail:", err.message);
      }
    }

    // 🧹 2️⃣ Delete embedded images from description (Cloudinary editor-images)
    if (service.description) {
      const regex = /https:\/\/res\.cloudinary\.com\/[^"]+\/upload\/[^"]+/g;
      const imageUrls = service.description.match(regex) || [];

      for (const url of imageUrls) {
        try {
          // Extract Cloudinary public_id (everything after `/upload/`)
          const parts = url.split("/");
          const uploadIndex = parts.indexOf("upload");
          if (uploadIndex !== -1) {
            const publicId = parts
              .slice(uploadIndex + 1)
              .join("/")
              .split(".")[0];
            if (publicId) {
              await destroyFromCloudinary(publicId);
              console.log(`🗑️ Deleted embedded image: ${publicId}`);
            }
          }
        } catch (err) {
          console.warn("⚠️ Failed to delete embedded image:", err.message);
        }
      }
    }

    // 🗑️ 3️⃣ Delete the service record itself
    await Service.findByIdAndDelete(id);

    res.status(200).json({
      message: "Service and all associated images deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting service:", error.message);
    res.status(500).json({
      message: "Internal Error",
      error: error.message,
    });
  }
};
