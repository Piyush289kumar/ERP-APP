import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required."],
      trim: true,
      minlength: [1, "Comment cannot be empty."],
      maxlength: [2000, "Comment cannot exceed 2000 characters."],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Virtual Field for nested replies
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

// Method : Like/Unlike Comment
commentSchema.method.toggleLink = function (userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.dislikes.push(userId);
    this.likes = this.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    this.dislikes.splice(index, 1);
  }
  return this.save();
};

// Virtual for JSON output
commentSchema.set("toJSON", { virtuals: true });
commentSchema.set("toObject", { virtuals: true });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
