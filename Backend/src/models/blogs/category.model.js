import mongooes from "mongoose";

const categorySchema = new mongooes.Schema(
  {
    slug: { type: String, require: true },
    name: { type: String, require: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Category = mongooes.model("Category", categorySchema);
export default Category;
