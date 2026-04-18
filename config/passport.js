const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
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




passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const email = profile.emails?.[0]?.value;

        let user = await UserModel.findOne({
          $or: [
            { githubId: profile.id },
            { email: email },
          ],
        });

        if (!user) {
          user = await UserModel.create({
            firstName: profile.displayName?.split(" ")[0] || "User",
            lastName: profile.displayName?.split(" ")[1] || "",
            email: email,
            githubId: profile.id,
            imageUrl: profile.photos?.[0]?.value,
            accountType: "Student",
          });
        } else {
          user.githubId = profile.id;

          if (!user.imageUrl || user.imageUrl === "default-profile.png") {
            user.imageUrl = profile.photos?.[0]?.value;
          }

          await user.save();
        }

        return cb(null, user);

      } catch (error) {
        console.error("Error in GitHub Login:", error);
        return cb(error, null);
      }
    }
  )
);