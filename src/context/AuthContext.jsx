import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

// Read the saved user from localStorage.
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (
      !storedUser ||
      storedUser === "undefined" ||
      storedUser === "null"
    ) {
      localStorage.removeItem("user");
      return null;
    }

    const parsedUser = JSON.parse(storedUser);

    if (
      !parsedUser ||
      typeof parsedUser !== "object" ||
      Array.isArray(parsedUser)
    ) {
      localStorage.removeItem("user");
      return null;
    }

    return parsedUser;
  } catch (error) {
    console.error("Failed to read stored user:", error);
    localStorage.removeItem("user");
    return null;
  }
};

// Read the saved authentication token.
const getStoredToken = () => {
  try {
    const storedToken = localStorage.getItem("token");

    if (
      !storedToken ||
      storedToken === "undefined" ||
      storedToken === "null"
    ) {
      localStorage.removeItem("token");
      return null;
    }

    return storedToken;
  } catch (error) {
    console.error("Failed to read stored token:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUserState] = useState(getStoredUser);
  const [profileLoading, setProfileLoading] = useState(false);

  // Replace the user and persist the complete object.
  const setUser = (userData) => {
    if (
      userData !== null &&
      userData !== undefined &&
      (
        typeof userData !== "object" ||
        Array.isArray(userData)
      )
    ) {
      console.error(
        "setUser expects a user object or null."
      );
      return;
    }

    const nextUser = userData ?? null;

    try {
      if (nextUser === null) {
        localStorage.removeItem("user");
      } else {
        localStorage.setItem(
          "user",
          JSON.stringify(nextUser)
        );
      }
    } catch (error) {
      console.error("Failed to persist user:", error);
      return;
    }

    setUserState(nextUser);
  };

  // Merge updated fields into the current user.
  const updateUser = (updates) => {
    if (
      !updates ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      console.error(
        "updateUser expects a user object."
      );
      return;
    }

    const mergedUser = {
      ...(user || {}),
      ...updates,
    };

    setUser(mergedUser);
  };

  // Save the token and logged-in user's details.
  const login = (newToken, userData = null) => {
    if (
      !newToken ||
      newToken === "undefined" ||
      newToken === "null"
    ) {
      console.error(
        "Login failed: a valid token is required."
      );
      return;
    }

    try {
      localStorage.setItem("token", newToken);
    } catch (error) {
      console.error("Failed to persist token:", error);
      return;
    }

    setToken(newToken);

    if (
      userData &&
      typeof userData === "object" &&
      !Array.isArray(userData)
    ) {
      setUser(userData);
    } else {
      setUser(null);
    }
  };

  // Fetch the latest profile when an authenticated session exists.
  useEffect(() => {
    if (!token) {
      setProfileLoading(false);
      return;
    }

    let cancelled = false;

    const loadCurrentUser = async () => {
      setProfileLoading(true);

      try {
        const response = await api.get("/users/profile");

        if (
          !cancelled &&
          response.data &&
          typeof response.data === "object" &&
          !Array.isArray(response.data)
        ) {
          setUser(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load the current user profile:",
            error
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Clear the session.
  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      console.error(
        "Failed to clear stored session:",
        error
      );
    }

    setToken(null);
    setUserState(null);
    setProfileLoading(false);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        updateUser,
        login,
        logout,
        isAuthenticated,
        profileLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);