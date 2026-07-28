const User = require("../../models/User");

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "inactive", "suspended"].includes(status)) {
      return res.redirect("/admin/users");
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { accountStatus: status },
      { new: true, select: "_id name email role accountStatus" }
    );

    if (!updatedUser) return res.redirect("/admin/users");

    return res.json({ success: true, data: updatedUser });

  } catch (err) {
    console.error("UPDATE USER STATUS ERROR:", err);
    return res.redirect("/admin/users");
  }
};
