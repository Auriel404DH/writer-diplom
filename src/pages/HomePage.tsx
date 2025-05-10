import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

interface RootState {
  auth: {
    user: { name: string; email: string } | null;
    token: string | null;
  };
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  if (!token) {
    return (
      <div className="p-6 text-center">
        You must be logged in to view this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Welcome, {user?.name}!
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          You are successfully logged in. Feel free to explore!
        </p>

        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default HomePage;
