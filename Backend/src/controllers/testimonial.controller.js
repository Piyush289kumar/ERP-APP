import Testimonial from "../models/testimonial.model.js";
import {
  uploadToCloudinary,
  destroyFromCloudinary,
} from "../utils/cloudinaryService.js";

/* =====================================
   🔒 Get All Testimonials (Admin)
   ===================================== */
export const getTestimonials = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const filter = search
      ? {
          $or: [
            { name: new RegExp(search, "i") },
            { designation: new RegExp(search, "i") },
            { description: new RegExp(search, "i") },
          ],
        }
      : {};

    const total = await Testimonial.countDocuments(filter);

    const testimonials = await Testimonial.find(filter)
      .populate("createdBy updatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      message: "Testimonials fetched successfully.",
      data: testimonials,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Error", error: error.message });
  }
};

/* =====================================
   🔍 Get Testimonial by ID
   ===================================== */
export const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id)
      .populate("createdBy updatedBy", "name email")
      .lean();

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found." });
    }

    return res.status(200).json({
      message: "Testimonial fetched successfully.",
      data: testimonial,
    });
  } catch (error) {
    console.error("Error fetching testimonial:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Error", error: error.message });
  }
};

/* =====================================
   ➕ Create Testimonial
   ===================================== */
export const createTestimonial = async (req, res) => {
  try {
    const { name, designation, description, rating, isActive } = req.body;

    if (!name || !description || !rating) {
      return res
        .status(400)
        .json({ message: "Name, description, and rating are required." });
    }

    let avatarUrl = null;

    // Upload avatar (if provided)
    if (req.files?.avatar?.[0]?.path) {
      const uploaded = await uploadToCloudinary(
        req.files.avatar[0].path,
        "testimonials/avatar"
      );
      avatarUrl = uploaded.secure_url;
    }

    const testimonial = await Testimonial.create({
      name,
      designation,
      description,
      avatar: avatarUrl,
      rating,
      isActive,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Testimonial created successfully.",
      data: testimonial,
    });
  } catch (error) {
    console.error("Error creating testimonial:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Error", error: error.message });
  }
};

/* =====================================
   ✏️ Update Testimonial
   ===================================== */
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, description, rating, isActive } = req.body;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found." });
    }

    let avatarUrl = testimonial.avatar;

    // Handle avatar replacement
    if (req.files?.avatar?.[0]?.path) {
      if (testimonial.avatar) {
        try {
          const oldPublicId = testimonial.avatar.split("/").pop().split(".")[0];
          await destroyFromCloudinary(`testimonials/avatar/${oldPublicId}`);
        } catch (e) {
          console.warn("Error deleting old avatar:", e.message);
        }
      }
      const upload = await uploadToCloudinary(
        req.files.avatar[0].path,
        "testimonials/avatar"
      );
      avatarUrl = upload.secure_url;
    }

    testimonial.name = name ?? testimonial.name;
    testimonial.designation = designation ?? testimonial.designation;
    testimonial.description = description ?? testimonial.description;
    testimonial.avatar = avatarUrl;
    testimonial.rating = rating ?? testimonial.rating;
    testimonial.isActive = isActive ?? testimonial.isActive;
    testimonial.updatedBy = req.user._id;

    await testimonial.save();

    return res.status(200).json({
      message: "Testimonial updated successfully.",
      data: testimonial,
    });
  } catch (error) {
    console.error("Error updating testimonial:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Error", error: error.message });
  }
};

/* =====================================
   🔄 Partially Update Testimonial
   ===================================== */
export const partiallyUpdateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found." });
    }

    // Apply partial updates
    Object.entries(req.body).forEach(([key, value]) => {
      if (value !== undefined && key !== "_id") testimonial[key] = value;
    });

    testimonial.updatedBy = req.user._id;
    await testimonial.save();

    return res.status(200).json({
      message: "Testimonial updated successfully.",
      data: testimonial,
    });
  } catch (error) {
    console.error("Error partially updating testimonial:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Error", error: error.message });
  }
};

/* =====================================
   🗑️ Delete Testimonial
   ===================================== */
export const destroyTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found." });
    }

    // Delete avatar from Cloudinary if exists
    if (testimonial.avatar) {
      try {
        const publicId = testimonial.avatar.split("/").pop().split(".")[0];
        await destroyFromCloudinary(`testimonials/avatar/${publicId}`);
      } catch (e) {
        console.warn("Error deleting avatar:", e.message);
      }
    }

    await Testimonial.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Testimonial deleted successfully.", id });
  } catch (error) {
    console.error("Error deleting testimonial:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Error", error: error.message });
  }
};
