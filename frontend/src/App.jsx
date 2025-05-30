import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import GroupList from "./pages/GroupList";
import Acceuil from "./pages/Acceuil";
import GroupDetail from "./pages/GroupDetail";
import Navbar from "./components/Navbar.jsx";
import GroupMembersPage from "./pages/GroupMembersPage";
import { ToastContainer } from "react-toastify";
import { Toaster } from "@/components/ui/toaster";
import Auth from "./pages/Auth.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Toaster />
      {/* Routes */}
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Acceuil />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {" "}
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <PrivateRoute>
              {" "}
              <GroupList />{" "}
            </PrivateRoute>
          }
        />
        <Route
          path="/groups/:id"
          element={
            <PrivateRoute>
              {" "}
              <GroupDetail />{" "}
            </PrivateRoute>
          }
        />
        <Route
          path="/groups/:id/members"
          element={
            <PrivateRoute>
              {" "}
              <GroupMembersPage />{" "}
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
