import appConfig from "../models/appConfig.model.js";
// Get
export const getAppConfig = async (req, res) => {
  try {
    const app_config_data = await appConfig.findOne();

    if (!app_config_data) {
      return res.status(404).json({
        message: "App Config Data not found...",
      });
    }
    return res.status(200).json({
      message: "App Config Fetched...",
      app_config_data,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const modifyAppConfig = async (req, res) => {
  try {
    const { appName, email, phoneNumber } = req.body;

    if (!appName || !email || !phoneNumber) {
      return res.status(401).json({ message: "All fields are required" });
    }

    let app = await appConfig.findOne();
    if (!app) {
      // Create New
      app = await appConfig.create({
        appName,
        email,
        phoneNumber,
      });
    } else {
      // Update existing
      app = await appConfig.findByIdAndUpdate(
        app._id,
        {
          appName,
          email,
          phoneNumber,
        },
        { new: true }
      );
    }

    return res.status(201).json({ message: "App Config Data Update" }, { app });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error - App Config Controller",
      error,
    });
  }
};
