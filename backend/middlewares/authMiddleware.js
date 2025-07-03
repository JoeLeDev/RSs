const admin = require("firebase-admin");
const serviceAccount = require("../config/myicconline-firebase-adminsdk-fbsvc-caeee6bf8e.json");
const User = require("../models/User");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userMongo = await User.findOne({ firebaseUid: decodedToken.user_id });
    if (!userMongo) {
      return res.status(401).json({ message: "Utilisateur MongoDB introuvable" });
    }
    req.user = {
      _id: userMongo._id.toString(),
      firebaseUid: userMongo.firebaseUid,
      email: userMongo.email,
      role: userMongo.role,
    };
    console.log('Utilisateur authentifié:', req.user);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};