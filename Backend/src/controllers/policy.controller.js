import Policy from "../models/policy.model.js";

// Get all policies
export const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find()
      .populate("createdBy updatedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();
    if (!policies) {
      return res.status(404).json({ message: "Policies not found." });
    }

    return res
      .status(200)
      .json({ message: "Policies fetch successfully.", data: policies });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all active policies
export const getAllActivePolicies = async (req, res) => {
  try {
    const policies = await Policy.find({ isActive: true }).lean();
    if (!policies) {
      return res.status(404).json({ message: "Active policies not found." });
    }

    return res
      .status(200)
      .json({ message: "Active policies fetch successfully.", data: policies });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get Active Policy by Slug
export const getActivePoliciesBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ message: "Slug is required." });
    }

    const policy = await Policy.findOne({ slug }).lean();
    if (!policy) {
      return res
        .status(404)
        .json({ message: `Policy not found with slug : ${slug}` });
    }

    return res
      .status(200)
      .json({ message: "Policy fetched by slug successfully.", data: policy });
  } catch (error) {
    console.error("Error while fetch Active policy by slug.");
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Create new or Update Policy
export const modifyPolicy = async (req, res) => {
  try {
    const {
      id, // Optional for update
      title,
      slug,
      description,
      isActive,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Policy Title is required." });
    }

    // If id exist then update
    if (id) {
      const existing = await Policy.findOne({ slug });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Policy with this title is already exist." });
      }

      const policy = await Policy.findOne({ slug });
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }

      // Update Fileds
      policy.title = title || policy.title;
      policy.slug = slug || policy.slug;
      policy.description = description || policy.description;
      policy.isActive = isActive ?? policy.isActive;
      policy.updatedBy = req.user?._id;

      await policy.save();
      return res
        .status(200)
        .json({ message: "Policy updated successfully.", data: policy });
    } else {
      // Create New Record
      const policy = await Policy.create({
        title,
        slug,
        description,
        isActive,
        createdBy: req.user._id,
      });

      return res
        .status(201)
        .json({ message: "Policy created successfully.", data: policy });
    }
  } catch (error) {
    console.error("Error while Modify Policy");

    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
