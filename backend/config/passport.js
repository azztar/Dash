// backend/config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user"); // Importa el modelo de usuario

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/auth/google/callback", // URL de redirección después de autenticar
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Buscar un usuario existente por su googleId
                let user = await User.findOne({ where: { googleId: profile.id } });

                if (user) {
                    // Si el usuario existe, devuélvelo
                    return done(null, user);
                }

                // Si el usuario no existe, créalo en la base de datos
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName || null, // Opcional: guarda el nombre del usuario
                });

                return done(null, user);
            } catch (error) {
                console.error("Error al buscar o crear usuario:", error);
                return done(error, null);
            }
        },
    ),
);

// Serializar y deserializar el usuario
passport.serializeUser((user, done) => {
    done(null, user.id); // Guarda solo el ID del usuario en la sesión
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id); // Busca el usuario por su ID
        done(null, user);
    } catch (error) {
        console.error("Error al deserializar usuario:", error);
        done(error, null);
    }
});
