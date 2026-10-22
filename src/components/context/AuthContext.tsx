import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  loginUser as loginUserApi,
  registerUser as registerUserApi,
  getProfile,
} from "../../api/authApi";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const response = await getProfile();

        if (response?.user) {
          const backendUser = response.user;

          setUser({
            id: Number(backendUser.id),
            name: backendUser.name,
            email: backendUser.email,
            role:
              backendUser.role === "admin"
                ? "admin"
                : "user",
          });
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to restore user:", error);

        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await loginUserApi({
        email,
        password,
      });

      if (
        !response?.success ||
        !response?.token ||
        !response?.user
      ) {
        return false;
      }

      localStorage.setItem("token", response.token);

      const backendUser = response.user;

      const userData: User = {
        id: Number(backendUser.id),
        name: backendUser.name,
        email: backendUser.email,
        role:
          backendUser.role === "admin"
            ? "admin"
            : "user",
      };

      setUser(userData);

      return true;
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await registerUserApi({
        name,
        email,
        password,
      });

      return response?.success === true;
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}