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
