import mongoose from "mongoose";
import slugify from "slugify";

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, trim: true, default: null },
    metaDescription: { type: String, trim: true, default: null },
    metaKeywords: [{ type: String, trim: true, default: null }],
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: [true, "Blog title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      require: [true, "Slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },

    thumbnail: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
        },
        message: "Invalid image URL format for thumbnail",
      },
    },
    gallery_images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
          },
          message: "Invalid image URL in gallery",
        },
      },
    ],

    video_link: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          return (
            !v ||
            /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+/.test(
              v
            )
          );
        },
        message: "Invalid video URL",
      },
    },

    read_time: {
      type: String,
      default: null,
      match: [
        /^[0-9]+( min| hr)?$/,
        "Invalid read time format (e.g., '5 min')",
      ],
    },

    short_description: {
      type: String,
      default: " ",
      trim: true,
      maxlength: [300, "Short description cannot exceed 300 characters."],
    },
    description: { type: String, default: " ", trim: true },

    seo: seoSchema,

    isActive: { type: Boolean, default: true, index: true },
    isFeature: { type: Boolean, default: true, index: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

// Auto-Generate Slug (Pre Save hook)
blogSchema.pre("validate", function (next) {
  if (this.title && this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Virtual Fields

// Blog URL
blogSchema.virtual("url").get(function () {
  return `/blog/${this.slug}`;
});

// Blog Comments
blogSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "blog",
});

// Static : Fetch all active blogs
blogSchema.statics.getActiveBlogs = function () {
  return this.find({ isActive: true })
    .populate("category")
    .sort({ createdAt: -1 });
};

// Instance : Mark a blog as featured
blogSchema.methods.markFeatured = function () {
  this.isFeature = true;
  return this.save();
};

// Indexes
blogSchema.index({
  title: "text",
  description: "text",
  "seo.metaKeywords": "text",
});

// Virtuals Convertation
blogSchema.set("toJSON", { virtuals: true });
blogSchema.set("toObject", { virtuals: true });

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
