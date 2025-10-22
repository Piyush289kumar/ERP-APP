import Testimonial from "../models/testimonial.model.js";

// Get All Testimonials - Protective (Admin)
// Admin : Get All Testimonials (Paginated, Searchable and Sortable)

export const getAllTestimonials = async (req, res) => {
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

    // Search Filter (by name, designation, rating or description)
    const filter = search
      ? {
          $or: [
            { name: new RegExp(search, "i") },
            { designation: new RegExp(search, "i") },
            { description: new RegExp(search, "i") },
            { rating: new RegExp(search, "i") },
          ],
        }
      : {};

    const [testimonials, totalCount] = await Promise.all([
      Testimonial.find(filter)
        .populate("createdBy updatedBy", "name email")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .select("name designation description rating avatar isActive createdAt")
        .lean(),

      Testimonial.countDocuments(filter),
    ]);

    if (!testimonials.length) {
      return res
        .status(404)
        .json({ message: "No testimonials found.", data: [], total: 0 });
    }

    return res.status(200).json({
      message: "Testimonials fetched successfully.",
      data: testimonials,
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

// Get All Active Testimonials - Public
export const getAllActiveTestimonials = async (req, res) => {
  try {
    // Uses static method defined in model (for performance & reuse)
    const testimonials = await Testimonial.fetchActive(12);

    if (!testimonials.length) {
      return res
        .status(404)
        .json({ message: "No active testimonials found.", data: [] });
    }

    return res.status(200).json({
      message: "Active testimonials fetched successfully.",
      data: testimonials,
      count: testimonials.length,
    });
  } catch (error) {
    console.error("Internal Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
