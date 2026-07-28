import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function readSavedUser() {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("accessToken")
  );

  const [user, setUser] = useState(readSavedUser);

  const login = (response) => {
    const loggedInUser = {
      id: response.userId,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
    };

    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setToken(response.accessToken);
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
