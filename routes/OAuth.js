const express = require("express");
const passport = require('passport');
const jwt = require("jsonwebtoken");
const router = express.Router();


// route for google login 
// step 1
// redirect to google login
router.get('/google', passport.authenticate("google", {scope: ["profile", "email"]}));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      const token = jwt.sign(
        {
          id: req.user._id,
          email: req.user.email,
          accountType: req.user.accountType,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.redirect(
        `${process.env.CLIENT_URL}/oauth-success?token=${token}`
      );

    } catch (error) {
      console.error("OAuth Callback Error:", error);
      res.redirect(
        `${process.env.CLIENT_URL}/login?error=oauth_failed`
      );
    }
  }
);
module.exports = router