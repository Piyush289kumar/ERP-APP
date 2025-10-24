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
 * ✅ Create or Update Testimonial (Protected)
 */
export const modifyTestimonial = async (req, res) => {
  try {
    const { id, name, designation, description, rating, isActive } = req.body;

    // Basic Validation
    if (!name?.trim() || !description?.trim() || !rating) {
      return res.status(400).json({
        message: "Name, Description & Rating are required.",
      });
    }

    let avatarUrl = null;

    // Upload Avatar if Provided
    if (req.files?.avatar?.[0]?.path) {
      const uploadAvatar = await uploadToCloudinary(
        req.files.avatar[0].path,
        "testimonial/avatar"
      );
      avatarUrl = uploadAvatar.secure_url;
    }

    // --- 🧩 UPDATE Existing Testimonial ---
    if (id) {
      const testimonial = await Testimonial.findById(id);
      if (!testimonial) {
        return res.status(404).json({
          message: `Testimonial not found with ID: ${id}`,
        });
      }

      // If new avatar uploaded → delete old one
      if (avatarUrl && testimonial.avatar) {
        try {
          const oldPublicId = testimonial.avatar.split("/").pop().split(".")[0];
          await destroyFromCloudinary(`testimonial/avatar/${oldPublicId}`);
        } catch (e) {
          console.warn("⚠️ Failed to delete old image:", e.message);
        }
      }

      // Update only changed fields
      testimonial.name = name || testimonial.name;
      testimonial.designation = designation || testimonial.designation;
      testimonial.description = description || testimonial.description;
      testimonial.avatar = avatarUrl || testimonial.avatar;
      testimonial.rating = rating || testimonial.rating;
      testimonial.isActive = isActive ?? testimonial.isActive;
      testimonial.updatedBy = req.user?._id;

      await testimonial.save();

      return res.status(200).json({
        message: "✅ Testimonial updated successfully.",
        data: testimonial,
      });
    }

    // --- 🆕 CREATE New Testimonial ---
    const existing = await Testimonial.findOne({ name });
    if (existing) {
      return res.status(400).json({
        message: "❌ Testimonial with this name already exists.",
      });
    }

    const testimonial = await Testimonial.create({
      name,
      designation,
      description,
      avatar: avatarUrl,
      rating,
      isActive,
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      message: "✅ Testimonial created successfully.",
      data: testimonial,
    });
  } catch (error) {
    console.error("❌ Error in modifyTestimonial:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Destroy Testimonial by ID
export const destroyTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required." });
    }

    // Find testimonial by ID
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found." });
    }

    // Delete from Cloudinary if avatar exists
    if (testimonial.avatar) {
      const publicId = testimonial.avatar.split("/").pop().split(".")[0];
      await destroyFromCloudinary(`testimonial/avatar/${publicId}`);
    }

    // Delete from DB
    await Testimonial.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Testimonial deleted successfully." });
  } catch (error) {
    console.error("Internal Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
