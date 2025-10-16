import mongoose from "mongoose";

const appconfigSchema = new mongoose.Schema({
  appName: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  companyAddress: [
    (address = { type: String, require: false }),
    (googleMapLocation = { type: String, require: false }),
  ],
  facebookLink: {
    type: String,
    require: false,
  },
  instagramLink: {
    type: String,
    require: false,
  },
  twitterLink: {
    type: String,
    require: false,
  },
  youtubeLink: {
    type: String,
    require: false,
  },
  whatsAppLink: {
    type: String,
    require: false,
  },
  googleFormLink: {
    type: String,
    require: false,
  },
  linkedinLink: {
    type: String,
    require: false,
  },
  googleAppStoreLink: {
    type: String,
    require: false,
  },
  appleAppStoreLink: {
    type: String,
    require: false,
  },
});

const appConfig = mongoose.model("appConfig", appconfigSchema);