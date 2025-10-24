import Service from "../models/service.model.js";
import {
  destroyFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinaryService.js";

// Get All Services - Protective (Admin)
// Admin : Get All Services (Paginated, Searchable and Sortable)

export const getAllServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    // Search Filter (by title, subHeading or description)
    const filter = search
      ? {
          $or: [
            { title: new RegExp(search, "i") },
            { subHeading: new RegExp(search, "i") },
            { description: new RegExp(search, "i") },
          ],
        }
      : {};

    const [services, totalCount] = await Promise.all([
      Service.find(filter)
        .populate("createdBy updatedBy", "name email")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .select("title subHeading description thumbnail isActive createdAt")
        .lean(),

      Service.countDocuments(filter),
    ]);

    if (!services.length) {
      return res
        .status(404)
        .json({ message: "No services found.", data: [], total: 0 });
    }

    return res.status(200).json({
      message: "services fetched successfully.",
      data: services,
      pagination: {
        total: totalCount,
        page: Number(page),
        pages: Math.ceil(totalCount / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Internal Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get All Active Service - Public
export const getAllActiveServices = async (req, res) => {
  try {
    // Uses static method defined in model (for performance & reuse)
    const services = await Service.fetchActive(12);

    if (!services.length) {
      return res
        .status(404)
        .json({ message: "No active services found.", data: [] });
    }

    return res.status(200).json({
      message: "Active services fetched successfully.",
      data: services,
      count: services.length,
    });
  } catch (error) {
    console.error("Internal Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "ID is required.",
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        message: `Service not found with ${id}`,
      });
    }

    return res.status(200).json({
      message: "Service fetch successfully.",
      data: service,
    });
  } catch (error) {
    console.error("Internal Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * ✅ Create or Update Service (Protected)
 */
export const modifyService = async (req, res) => {
  try {
    const { id, title, subHeading, description, isActive } = req.body;

    // Basic Validation
    if (!title?.trim() || !description?.trim() || !subHeading?.trim()) {
      return res.status(400).json({
        message: "Title, subHeading & Description are required.",
      });
    }

    let thumbnailUrl = null;

    // Upload Thumbnail if Provided
    if (req.files?.thumbnail?.[0]?.path) {
      const uploadThumbnail = await uploadToCloudinary(
        req.files.thumbnail[0].path,
        "service/thumbnail"
      );
      thumbnailUrl = uploadThumbnail.secure_url;
    }

    // --- 🧩 UPDATE Existing Service ---
    if (id) {
      const service = await Service.findById(id);
      if (!service) {
        return res.status(404).json({
          message: `Service not found with ID: ${id}`,
        });
      }

      // If new thumbnail uploaded → delete old one
      if (thumbnailUrl && service.thumbnail) {
        try {
          const oldPublicId = service.thumbnail.split("/").pop().split(".")[0];
          await destroyFromCloudinary(`service/thumbnail/${oldPublicId}`);
        } catch (e) {
          console.warn("⚠️ Failed to delete old image:", e.message);
        }
      }

      // Update only changed fields
      service.title = title || service.title;
      service.subHeading = subHeading || service.subHeading;
      service.description = description || service.description;
      service.thumbnail = thumbnailUrl || service.thumbnail;
      service.isActive = isActive ?? service.isActive;
      service.updatedBy = req.user?._id;

      await service.save();

      return res.status(200).json({
        message: "✅ Service updated successfully.",
        data: service,
      });
    }

    // --- 🆕 CREATE New Service ---
    const existing = await Service.findOne({ title });
    if (existing) {
      return res.status(400).json({
        message: "❌ Service with this title already exists.",
      });
    }

    const service = await Service.create({
      title,
      subHeading,
      description,
      thumbnail: thumbnailUrl,
      isActive,
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      message: "✅ Service created successfully.",
      data: service,
    });
  } catch (error) {
    console.error("❌ Error in modifyService:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Destroy Service by ID
export const destroyServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required." });
    }

    // Find Service by ID
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    // Delete from Cloudinary if thumbnail exists
    if (service.thumbnail) {
      const publicId = service.thumbnail.split("/").pop().split(".")[0];
      await destroyFromCloudinary(`service/thumbnail/${publicId}`);
    }

    // Delete from DB
    await Service.findByIdAndDelete(id);

    return res.status(200).json({ message: "Service deleted successfully." });
  } catch (error) {
    console.error("Internal Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
