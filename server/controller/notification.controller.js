import Notification from "../models/Notification.js";
export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({ notifications });
};
