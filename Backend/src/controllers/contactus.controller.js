import ContactUs from "../models/contactus.model.js";

// Submit Contact Form - Public
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

// Get All Contact us messages - Protected

export const getAllContactUs = async (req, res) => {
  try {
    const contactUs = await ContactUs.find().sort({ createdAt: -1 }).lean();
    if (!contactUs) {
      return res.status(404).json({
        status: "error",
        message: "Contact us message not found.",
        data: contactUs,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Contact us message feched successflly.",
      data: contactUs,
    });
  } catch (error) {
    console.error("❌ Error while get all contact us message:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get single contact us message by ID

export const getContactUsById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "ID is required for Contact us message found.",
        data: contactUs,
      });
    }

    const contactUs = await ContactUs.findById(id).lean();
    if (!contactUs) {
      return res.status(404).json({
        status: "error",
        message: `Contact us message not found with id : ${id}`,
        data: contactUs,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Contact us message feched by ID successflly.",
      data: contactUs,
    });
  } catch (error) {
    console.error("❌ Error while feching contact us by id :", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ===============================================
// 🗑 Delete Contact Us Message by ID - Admin
// ===============================================
export const destroyContactUsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Contact Us message ID is required.",
      });
    }

    const contactUs = await ContactUs.findByIdAndDelete(id);

    if (!contactUs) {
      return res.status(404).json({
        status: "error",
        message: `Contact Us message not found with ID: ${id}`,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Contact Us message deleted successfully.",
      data: contactUs,
    });
  } catch (error) {
    console.error("❌ Error while deleting Contact Us message:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// ===============================================
// 📝 Admin Respond to Contact Us Message
// ===============================================
export const respondToContactUs = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Contact Us message ID is required.",
      });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Response message cannot be empty.",
      });
    }

    const contactUs = await ContactUs.findById(id);

    if (!contactUs) {
      return res.status(404).json({
        status: "error",
        message: `Contact Us message not found with ID: ${id}`,
      });
    }

    // Save single response
    contactUs.response = {
      message: message.trim(),
      respondedBy: req.user._id,
      respondedAt: new Date(),
    };

    // Optionally, push to replies array for history
    contactUs.replies.push({
      message: message.trim(),
      respondedBy: req.user._id,
    });

    // Update status
    contactUs.status = "answered";

    await contactUs.save();

    return res.status(200).json({
      status: "success",
      message: "Response added successfully.",
      data: contactUs,
    });
  } catch (error) {
    console.error("❌ Error responding to Contact Us message:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }

};