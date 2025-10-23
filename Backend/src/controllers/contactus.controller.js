import ContactUs from "../models/contactus.model.js";

// Submit Contact Form
export const createContactUs = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      ipAddress,
      userAgent,
      meta,
      status,
    } = req.body;

    // Basic Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        status: "error",
        message: "Name, email and message are required.",
      });
    }

    // Create new contact message
    const contactUs = await ContactUs.create({
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.headers["user-agent"] || "",
      meta: meta || {},
      status,
      createdBy: req.user?._id || null, // Optional if user logged in
    });

    return res.status(201).json({
      status: "success",
      message: "Contact message submitted successfully.",
      data: contactUs,
    });
  } catch (error) {
    console.error("❌ Error while submiting contact us:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
