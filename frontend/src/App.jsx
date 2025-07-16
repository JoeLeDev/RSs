import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import GroupList from "./pages/GroupList";
import Acceuil from "./pages/Acceuil";
import GroupDetail from "./pages/GroupDetail";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Members from "./pages/Members";
import Parameters from "./pages/Settings";
import { ToastContainer } from "react-toastify";
import { Toaster } from "@/components/ui/toaster";
import Auth from "./pages/Auth.jsx";
import Profile from "./pages/Profile.jsx";
import Events from "./pages/Events.jsx";
import EventDetailPage from "./pages/EventDetailPage.jsx";
import Messenger from "./pages/Messenger.jsx";
import PostDetail from "./pages/PostDetail";

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Toaster />
      <main className="flex-grow">
        {/* Routes */}
        <Routes>
          <Route path="/login"
           element={
           <Auth />
           } />
          <Route
            path="/"
            element={
              <Acceuil />
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
                <Members />{" "}
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
          <Route
            path="/profile/:id"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute>
                <Events />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <PrivateRoute>
                <EventDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/messenger"
            element={
              <PrivateRoute>
                <Messenger />
              </PrivateRoute>
            }
          />
          <Route
            path="/messenger/:id"
            element={
              <PrivateRoute>
                <Messenger />
              </PrivateRoute>
            }
          />
          <Route
            path="/posts/:id"
            element={
              <PrivateRoute>
                <PostDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/members"
            element={
              <PrivateRoute>
                <Members />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Parameters />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
