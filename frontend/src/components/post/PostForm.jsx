import { useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

const PostForm = ({ groupId = null, onPostCreated }) => {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [previewType, setPreviewType] = useState(null); // 'image', 'video', or null
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (!selected) {
      setPreview("");
      setPreviewType(null);
      return;
    }

    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
      setPreviewType('image');
    } else if (selected.type.startsWith("video/") || selected.type === "video/quicktime") {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
      setPreviewType('video');
    } else {
      setPreview("");
      setPreviewType(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !file) return toast.error("Contenu requis");

    let uploadedUrl = "";
    let fileType = "";

    try {
      // (Optionnel) upload du fichier via backend
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await API.post("/upload", formData); // ⚠️ crée route upload
        uploadedUrl = res.data.url;
        fileType = file.type.startsWith("image/") ? "image" : "other";
      }

      const postRes = await API.post("/posts", {
        content,
        fileUrl: uploadedUrl,
        fileType,
        group: groupId,
      });

      toast.success("Post créé !");
      setContent("");
      setFile(null);
      setPreview("");
      if (onPostCreated) onPostCreated();
    } catch (err) {
      toast.error("Erreur lors de la publication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
      <textarea
        className="w-full p-2 border rounded resize-none mb-2"
        placeholder="Exprime-toi..."
        rows="3"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* Aperçu du fichier */}
      {preview && previewType === 'image' && (
        <img
          src={preview}
          alt="preview"
          className="max-h-48 object-cover rounded mb-2"
        />
      )}

      {preview && previewType === 'video' && (
        <video controls src={preview} className="max-h-64 rounded object-contain border mb-2" />
      )}

      {file && !preview && (
        <div className="text-sm text-gray-600 mb-2">📎 {file.name}</div>
      )}

      <div className="flex items-center justify-between">
        <label className="cursor-pointer text-blue-600 hover:underline text-sm">
          📎 Ajouter un fichier
          <input type="file" onChange={handleFileChange} className="hidden" />
        </label>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Publication..." : "Publier"}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
