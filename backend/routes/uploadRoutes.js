const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const crypto = require('crypto');
const fs = require('fs');

// 📂 Config multer pour stocker les fichiers temporairement
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = 'uploads/temp/';
    // Créer le dossier temp s'il n'existe pas
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  // Utiliser le nom original pour le fichier temporaire (le hachage se fait après)
  filename: (req, file, cb) => cb(null, file.originalname.replace(/\s+/g, "_")),
});

const upload = multer({ storage });

// 🔁 Upload d'un fichier avec déduplication par hachage
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé" });
  }

  const tempFilePath = req.file.path; // Chemin du fichier temporaire
  const uploadDir = 'uploads/'; // Dossier de destination finale

  // Créer le dossier uploads s'il n'existe pas
  if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    // ➡️ 1. Calculer le hash du fichier
    const fileBuffer = fs.readFileSync(tempFilePath);
    const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const fileExtension = path.extname(req.file.originalname);
    const finalFileName = hash + fileExtension;
    const finalFilePath = path.join(uploadDir, finalFileName); // Chemin final du fichier

    // ➡️ 2. Vérifier si un fichier avec ce hash existe déjà
    if (fs.existsSync(finalFilePath)) {
      // ➡️ Doublon trouvé : Supprimer le fichier temporaire et renvoyer l'URL existante
      fs.unlinkSync(tempFilePath); // Supprimer le fichier temporaire
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${finalFileName}`;
      return res.status(200).json({ url: fileUrl, message: "Fichier déjà existant, URL réutilisée." });
    } else {
      // ➡️ Nouveau fichier : Déplacer le fichier temporaire vers le dossier final (renommé avec le hash)
      fs.renameSync(tempFilePath, finalFilePath); // Renommer/déplacer le fichier
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${finalFileName}`;
      console.log(`✅ Fichier uploadé et renommé : ${finalFilePath}`);
      console.log(`🔗 URL du fichier : ${fileUrl}`);
      return res.status(200).json({ url: fileUrl, message: "Nouveau fichier téléchargé." });
    }

  } catch (error) {
    console.error("Erreur lors du traitement de l'upload :", error);
    // ⚠️ Gérer le cas où le fichier temporaire pourrait exister après une erreur
    if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath); // Essayer de supprimer le fichier temporaire en cas d'erreur
    }
    res.status(500).json({ message: "Échec du traitement de l'upload." });
  }
});

module.exports = router;
