const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const auth = require("../middlewares/authMiddleware");

router.post("/", auth, postController.createPost);
router.get("/group/:groupId", auth, postController.getPostsByGroup);
router.get("/dashboard", auth, postController.getDashboardPosts);
router.patch("/:id", auth, postController.updatePost);
router.delete("/:id", auth, postController.deletePost);
router.post("/:id/like", auth, postController.likePost);
router.post("/:id/unlike", auth, postController.unlikePost);


// Comment routes
router.post("/:id/comments", auth, postController.addComment);
router.delete("/:id/comments/:commentId", auth, postController.deleteComment);
router.patch("/:id/comments/:commentId", auth, postController.editComment);
router.patch("/:id/comments/:commentId/hide", auth, postController.hideComment);
router.get("/:id/comments", auth, postController.getComments);
router.get("/:id/comments/:commentId", auth, postController.getComment);

module.exports = router;
