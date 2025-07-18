import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Assure-toi que c'est bien vers le contexte Firebase
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";
import Logo from "../assets/header/ICC-.png";
import Google from "../assets/login/Google.png";
import Facebook from "../assets/login/Facebook.webp";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const { login, signUp, userData, loginWithGoogle, loginWithFacebook } = useAuth(); // Ajout des fonctions ici
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      // Attendre un court instant pour s'assurer que les données utilisateur sont chargées
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur de connexion détaillée:", error);
      let errorMessage = "Une erreur est survenue lors de la connexion";

      if (error.code === "auth/invalid-credential") {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Trop de tentatives de connexion. Veuillez réessayer plus tard";
      }

      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, firstName, lastName, country);
      console.log("Tentative d'inscription avec :", { email, password, firstName, lastName, country });

      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte.",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur d'inscription :", error);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message || error.code,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast({
        title: "Connexion Google réussie",
        description: "Bienvenue !",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur de connexion Google :", error);
      let errorMessage = "Une erreur est survenue lors de la connexion avec Google";
      
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "La fenêtre de connexion a été fermée";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "La connexion a été annulée";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "La fenêtre de connexion a été bloquée par votre navigateur";
      }

      toast({
        variant: "destructive",
        title: "Erreur Google",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      await loginWithFacebook();
      toast({
        title: "Connexion Facebook réussie",
        description: "Bienvenue !",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur de connexion Facebook :", error);
      let errorMessage = "Une erreur est survenue lors de la connexion avec Facebook";
      
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "La fenêtre de connexion a été fermée";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "La connexion a été annulée";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "La fenêtre de connexion a été bloquée par votre navigateur";
      }

      toast({
        variant: "destructive",
        title: "Erreur Facebook",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={Logo} alt="Logo" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My ICC Online</h1>
          <p className="text-gray-600">Votre réseau social par groupes</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Se connecter</CardTitle>
                <CardDescription>Entrez vos identifiants</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
                <div className="flex flex-row mt-4 gap-2">
                  <Button
                    variant="outline"
                    className=" flex items-center justify-center gap-2 h-30 w-60"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <img 
                      src={Google} 
                      className="h-10 w-10" 
                      alt="Google" 
                    />
                    
                  </Button>

                  <Button
                    variant="outline"
                    className="w-60 h-30 flex items-center justify-center gap-2"
                    onClick={handleFacebookLogin}
                    disabled={loading}
                  >
                    <img 
                      src={Facebook} 
                      className="h-10 w-10" 
                      alt="Facebook" 
                    />
                    
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>S'inscrire</CardTitle>
                <CardDescription>
                  Créez votre compte pour rejoindre la communauté
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lastname">Nom</Label>
                      <Input
                        id="lastname"
                        type="text"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstname">Prénom</Label>
                      <Input
                        id="firstname"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2"
                      autoComplete="country"
                      required
                    >
                      <option value="">Choisir un pays</option>
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Congo">Congo</option>
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="Canada">Canada</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password-signup">Mot de passe</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Inscription..." : "S'inscrire"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
