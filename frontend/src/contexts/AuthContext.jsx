import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../Firebase";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase user
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null); // Mongo user

  // Écoute les changements d'état de connexion Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          localStorage.setItem('token', token);
          try {
            const { data } = await axios.get(
              "http://localhost:5001/api/auth/me",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setUser(currentUser); // On garde l'objet Firebase
            setUserData(data);    // On stocke les infos Mongo
          } catch (error) {
            console.error("Erreur récupération user Mongo :", error);
            setUser(currentUser);
            setUserData(null);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du token :", error);
          setUser(currentUser);
          setUserData(null);
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Connexion
  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res;
    } catch (error) {
      throw error;
    }
  };

  //  Inscription + synchronisation vers MongoDB
  const signUp = async (email, password, firstName, lastName, country) => {
    try {
      const fullName = `${firstName} ${lastName}`;
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(res.user, { displayName: fullName });

      const token = await res.user.getIdToken();

      await axios.post(
        "http://localhost:5001/api/auth/sync",
        {
          firebaseUid: res.user.uid,
          email: res.user.email,
          username: fullName,
          imageUrl: res.user.photoURL || "",
          country,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res;
    } catch (error) {
      throw error;
    }
  };

  //  Déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    signOut(auth);
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,      // Firebase user (getIdToken, etc.)
        userData,  // Mongo user (role, _id, etc.)
        login,
        signUp,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
