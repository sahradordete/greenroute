const bcrypt = require("bcrypt");
const User = require("../../models/User");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.redirect("/register?error=missing");
    }

    if (password.length < 8) {
      return res.redirect("/register?error=shortpassword");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.redirect("/register?error=invalidemail");
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with all required fields
    const newUser = new User({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "public",
      accountStatus: "active",
    });

    await newUser.save();

    req.session.user = {
      id: newUser._id.toString(),
      role: newUser.role,
      name: newUser.name,
      email: newUser.email,
    };

    return res.redirect("/journeys/new");
  } catch (err) {
    if (err.code === 11000) {
      // error 11000 means duplicate key in mongo
      return res.redirect("/register?error=exists");
    }
    return res.status(500).send("Error creating account");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.redirect("/login?error=missing");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.redirect("/login?error=notfound");
    }

    if (user.accountStatus && user.accountStatus !== "active") {
      return res.redirect("/login?error=suspended");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.redirect("/login?error=invalid");
    }

    req.session.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    };

    if (user.role === "admin") {
      return res.redirect("/admin");
    }

    return res.redirect("/journeys/new");
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).send("Server error");
  }
};

exports.logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("LOGOUT ERROR:", err);
        return res.redirect("/login");
      }
      res.clearCookie("connect.sid");
      return res.redirect("/login");
    });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.redirect("/login");
  }
};
