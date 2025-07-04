// Utilitaire pour savoir si l'ID correspond à l'utilisateur courant
export default function isOwnProfile(id, userData) {
  return !id || id === userData?._id || id === "me";
} 