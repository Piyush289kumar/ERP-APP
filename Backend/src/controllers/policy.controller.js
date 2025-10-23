import Policy from "../models/policy.model.js";
import slugify from "slugify";

// ===============================================
// 🧩 Get All Policies (Admin Protected)
// ===============================================
export const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({})
      .populate("createdBy updatedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (!policies.length) {
      return res.status(404).json({ message: "No policies found." });
    }

    return res.status(200).json({
      message: "✅ Policies fetched successfully.",
      count: policies.length,
      data: policies,
    });
  } catch (error) {
    console.error("❌ Error fetching all policies:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ===============================================
// 🟢 Get All Active Policies (Public)
// ===============================================
export const getAllActivePolicies = async (req, res) => {
  try {
    const activePolicies = await Policy.find({ isActive: true })
      .select("title slug description")
      .lean();

    if (!activePolicies.length) {
      return res.status(404).json({ message: "No active policies found." });
    }

    return res.status(200).json({
      message: "✅ Active policies fetched successfully.",
      count: activePolicies.length,
      data: activePolicies,
    });
  } catch (error) {
    console.error("❌ Error fetching active policies:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ===============================================
// 🔍 Get Active Policy by Slug (Public)
// ===============================================
export const getActivePoliciesBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug?.trim()) {
      return res.status(400).json({ message: "Slug is required." });
    }

    const policy = await Policy.findOne({ slug, isActive: true }).lean();
    if (!policy) {
      return res
        .status(404)
        .json({ message: `Policy not found with slug: ${slug}` });
    }

    return res.status(200).json({
      message: "✅ Policy fetched successfully.",
      data: policy,
    });
  } catch (error) {
    console.error("❌ Error fetching policy by slug:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ===============================================
// ✏️ Create or Update Policy (Admin Protected)
// ===============================================
export const modifyPolicy = async (req, res) => {
  try {
    const { id, title, slug, description, isActive } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Policy title is required." });
    }

    // Auto-generate slug if not provided
    const generatedSlug = slug
      ? slugify(slug, { lower: true, strict: true })
      : slugify(title, { lower: true, strict: true });

    if (id) {
      // 🧭 Update Existing Policy
      const policy = await Policy.findById(id);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found." });
      }

      // Prevent duplicate slug
      const duplicate = await Policy.findOne({
        slug: generatedSlug,
        _id: { $ne: id },
      });
      if (duplicate) {
        return res
          .status(400)
          .json({ message: "Another policy with this slug already exists." });
      }
      
      // Update Fileds
      policy.title = title || policy.title;
      policy.slug = generatedSlug || policy.slug;
      policy.description = description || policy.description;
      policy.isActive = isActive ?? policy.isActive;
      policy.updatedBy = req.user?._id;

      await policy.save();

      return res.status(200).json({
        message: "✅ Policy updated successfully.",
        data: policy,
      });
    } else {
      // 🆕 Create New Policy
      const exists = await Policy.findOne({ slug: generatedSlug });
      if (exists) {
        return res
          .status(400)
          .json({ message: "Policy with this slug already exists." });
      }

      const newPolicy = await Policy.create({
        title,
        slug: generatedSlug,
        description,
        isActive: typeof isActive === "boolean" ? isActive : true,
        createdBy: req.user?._id,
      });

      return res.status(201).json({
        message: "✅ Policy created successfully.",
        data: newPolicy,
      });
    }
  } catch (error) {
    console.error("❌ Error while modifying policy:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
