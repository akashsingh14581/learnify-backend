const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserModel = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await UserModel.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value },
          ],
        });

        if (!user) {
          user = await UserModel.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            googleId: profile.id,
            imageUrl: profile.photos[0].value,
            accountType: "Student",
          });
        } else {
          user.googleId = profile.id;

          if (!user.imageUrl || user.imageUrl === "default-profile.png") {
            user.imageUrl = profile.photos[0].value;
          }

          await user.save();
        }

        return cb(null, user);

      } catch (error) {
        console.error("Error in Google Login:", error);
        return cb(error, null);
      }
    }
  )
);