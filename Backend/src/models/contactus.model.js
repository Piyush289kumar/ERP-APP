import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ===============================================
// 🧩 Contact Us Schema (Future-Proof + Admin Reply Support)
// ===============================================
const contactUsSchema = new Schema(
  {
    // 👤 User Details
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,15}$/, "Invalid phone number format"],
    },

    subject: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 2000,
    },

    // 🌐 Meta info
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },

    // 🧠 Dynamic fields for future scalability
    meta: {
      type: Map,
      of: Schema.Types.Mixed, // Allow any type (String, Number etc)
      default: {},
    },

    // 🧍 Linked User (optional)
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🚦 Status tracking
    status: {
      type: String,
      enum: ["new", "in_progress", "answered", "closed"],
      default: "new",
    },

    // 🧵 Admin Response (single response version)
    response: {
      message: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
      respondedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      respondedAt: {
        type: Date,
      },
    },

    // 📜 Optional: Support multiple replies in the future
    replies: [
      {
        message: {
          type: String,
          trim: true,
          maxlength: 2000,
        },
        respondedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        respondedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "contact_us",
  }
);

// ===============================================
// ⚙️ Indexing for scalability
// ===============================================
contactUsSchema.index({ email: 1, createdAt: -1 });
contactUsSchema.index({ status: 1 });

// ===============================================
// 🧠 Hooks (optional automation)
// ===============================================

// Auto-update status when admin replies
contactUsSchema.pre("save", function (next) {
  if (this.response?.message && this.status !== "answered") {
    this.status = "answered";
    this.response.respondedAt = new Date();
  }
  next();
});

// ===============================================
// 📦 Model Export
// ===============================================
const ContactUs = model("ContactUs", contactUsSchema);
export default ContactUs;
