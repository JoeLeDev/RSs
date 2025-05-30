const Post = require("../models/Post");
const mongoose = require("mongoose");
const User = require("../models/User");

// Créer un post
exports.createPost = async (req, res) => {
  const { content, fileUrl, fileType, group } = req.body;

  try {
    const post = await Post.create({
      content,
      fileUrl,
      fileType,
      group: group || null,
      author: req.user._id,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création du post" });
  }
};

// Récupérer les posts d'un groupe
exports.getPostsByGroup = async (req, res) => {
  const groupId = mongoose.Types.ObjectId.createFromHexString(
    req.params.groupId
  );
  const page = parseInt(req.query.page) || 1;
  const initialLimit = 10;
  const loadMoreLimit = 5;

  const limit = page === 1 ? initialLimit : loadMoreLimit;
  const skip = page === 1 ? 0 : initialLimit + (page - 2) * loadMoreLimit;

  try {
    const posts = await Post.find({ group: groupId })
      .populate("author", "username email")
      .populate("comments.author", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ group: groupId });
    const hasMore = skip + posts.length < total;

    res.json({ posts, hasMore });
    console.log("Group ID:", req.params.groupId);
    console.log("Page:", req.query.page);
  } catch (err) {
    console.error("Erreur getPostsByGroup:", err);
    res.status(500).json({ message: "Erreur de récupération" });
  }
};

// Récupérer les posts du dashboard (sans groupe)
exports.getDashboardPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const initialLimit = 10;
  const loadMoreLimit = 5;

  const limit = page === 1 ? initialLimit : loadMoreLimit;
  const skip = page === 1 ? 0 : initialLimit + (page - 2) * loadMoreLimit;

  try {
    const posts = await Post.find({ group: null })
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ group: null });
    const hasMore = skip + posts.length < total;

    res.json({ posts, hasMore });
  } catch {
    res.status(500).json({ message: "Erreur de récupération" });
  }
};

// Modifier un post
exports.updatePost = async (req, res) => {
  const { content, fileUrl, fileType } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    console.log("Post author:", post.author.toString());
    console.log("User ID:", req.user._id);
    // Seul l'auteur peut modifier
    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    post.content = content || post.content;
    post.fileUrl = fileUrl || post.fileUrl;
    post.fileType = fileType || post.fileType;

    await post.save();
    res.json(post);
  } catch {
    res.status(500).json({ message: "Erreur lors de la modification" });
  }
};

// Supprimer un post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const isOwner = post.author.toString() === req.user._id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await Post.deleteOne({ _id: req.params.id });
    res.json({ message: "Post supprimé" });
  } catch {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

// Récupérer un commentaire
exports.getComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });
    const comment = post.comments.id(commentId);
    if (!comment)
      return res.status(404).json({ message: "Commentaire introuvable" });
    await post.populate("comments.author", "username");
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

// Récupérer tous les commentaires d'un post
exports.getComments = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });
    await post.populate("comments.author", "username");
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

// ➕ Ajouter un commentaire
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    const comment = {
      content: req.body.content,
      author: req.user._id,
    };

    post.comments.push(comment);
    await post.save();

    await post.populate("comments.author", "username");

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire" });
  }
};

// ✏️ Modifier un commentaire
exports.editComment = async (req, res) => {
  const { id, commentId } = req.params;
  const { content } = req.body;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post introuvable" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    if (comment.author && comment.author.toString() !== req.user._id) {
      return res.status(403).json({ 
        message: "Tu ne peux modifier que ton propre commentaire" 
      });
    }

    comment.content = content;
    await post.save();

    await post.populate('comments.author', 'username');

    res.json(post.comments.id(commentId));
  } catch (error) {
    console.error("Erreur lors de la modification du commentaire:", error);
    res.status(500).json({ message: error.message });
  }
};

// ❌ Supprimer un commentaire
exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post introuvable" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    const isAuthor = comment.author && comment.author.toString() === req.user._id;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    post.comments = post.comments.filter(c => c && c._id && c._id.toString() !== commentId);
    await post.save();

    res.json({ message: "Commentaire supprimé" });
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🙈 Masquer un commentaire (auteur du post uniquement)
exports.hideComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post introuvable" });

    if (post.author.toString() !== req.user._id) {
      return res.status(403).json({
        message: "Seul l'auteur du post peut masquer les commentaires",
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment)
      return res.status(404).json({ message: "Commentaire introuvable" });

    comment.hidden = true;
    await post.save();

    res.json({ message: "Commentaire masqué" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du masquage" });
  }
};

// 👍 Like un post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    if (!req.user._id) {
      return res.status(400).json({ message: "Utilisateur non reconnu (ID MongoDB manquant)" });
    }

    // Vérifier si l'utilisateur a déjà liké le post
    const hasLiked = post.likes.some(likeId => likeId && likeId.toString() === req.user._id);
    if (hasLiked) {
      return res.status(400).json({ message: "Vous avez déjà liké ce post" });
    }

    post.likes.push(req.user._id);
    await post.save();

    await post.populate('author', 'username email');
    await post.populate('comments.author', 'username');

    res.json(post);
  } catch (error) {
    console.error("Erreur lors du like:", error);
    res.status(500).json({ message: error.message });
  }
};

// 👎 Unlike un post
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    // Log pour debug
    console.log('req.user._id:', req.user._id);
    console.log('post.likes:', post.likes.map(l => l && l.toString()));

    // Vérifier si l'utilisateur a liké le post
    const hasLiked = post.likes.some(likeId => likeId && likeId.toString() === req.user._id);
    if (!hasLiked) {
      return res.status(400).json({ message: "Vous n'avez pas liké ce post" });
    }

    post.likes = post.likes.filter(id => id && id.toString() !== req.user._id);
    await post.save();

    await post.populate('author', 'username email');
    await post.populate('comments.author', 'username');

    res.json(post);
  } catch (error) {
    console.error("Erreur lors du unlike:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.syncUser = async (req, res) => {
  const { firebaseUid, email, username, imageUrl } = req.body;

  try {
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        email,
        username,
        imageUrl: imageUrl || "",
        role: "user",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur syncUser :", error);
    res.status(500).json({ message: "Erreur lors de la synchronisation" });
  }
};
