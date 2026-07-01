import { useState, useEffect, useCallback } from "react";
import type { UserRole } from "@/types";

const USERS_KEY = "tianyuan-users";
const SESSION_KEY = "tianyuan-session";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "tianyuan-salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = raw ? JSON.parse(raw) : [];
    // Ensure all users have a role field (migration for existing data)
    let needsSave = false;
    for (const u of users) {
      if (!u.role) {
        u.role = "user";
        needsSave = true;
      }
    }
    if (needsSave) {
      saveUsers(users);
    }
    return users;
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function saveSession(userId: string | null) {
  if (userId) {
    localStorage.setItem(SESSION_KEY, userId);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

async function ensureAdminExists() {
  const users = loadUsers();
  if (users.length === 0) {
    const adminHash = await hashPassword("admin123");
    const adminUser: StoredUser = {
      id: generateId(),
      username: "admin",
      passwordHash: adminHash,
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    users.push(adminUser);
    saveUsers(users);
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureAdminExists().then(() => {
      const userId = loadSession();
      if (userId) {
        const users = loadUsers();
        const found = users.find((u) => u.id === userId);
        if (found) {
          setUser({
            id: found.id,
            username: found.username,
            role: found.role || "user",
            createdAt: found.createdAt,
          });
        } else {
          saveSession(null);
        }
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setError(null);
    const users = loadUsers();
    const found = users.find((u) => u.username === username);
    if (!found) {
      setError("用户名不存在");
      return false;
    }
    const hash = await hashPassword(password);
    if (hash !== found.passwordHash) {
      setError("密码错误");
      return false;
    }
    saveSession(found.id);
    setUser({
      id: found.id,
      username: found.username,
      role: found.role || "user",
      createdAt: found.createdAt,
    });
    return true;
  }, []);

  const register = useCallback(async (username: string, password: string): Promise<boolean> => {
    setError(null);
    if (username.trim().length < 2) {
      setError("用户名至少 2 个字符");
      return false;
    }
    if (password.length < 4) {
      setError("密码至少 4 个字符");
      return false;
    }
    const users = loadUsers();
    if (users.some((u) => u.username === username)) {
      setError("用户名已被注册");
      return false;
    }
    const hash = await hashPassword(password);
    const newUser: StoredUser = {
      id: generateId(),
      username: username.trim(),
      passwordHash: hash,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    saveSession(newUser.id);
    setUser({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      createdAt: newUser.createdAt,
    });
    return true;
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAdmin = user?.role === "admin";

  const getAllUsers = useCallback((): StoredUser[] => {
    return loadUsers().map(({ passwordHash: _, ...rest }) => rest) as unknown as StoredUser[];
  }, []);

  const updateUserRole = useCallback((userId: string, newRole: UserRole) => {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;
    users[idx].role = newRole;
    saveUsers(users);
    // If updating current user, refresh
    setUser((prev) => prev?.id === userId ? { ...prev, role: newRole } : prev);
    return true;
  }, []);

  const deleteUser = useCallback((userId: string) => {
    if (userId === user?.id) return false; // Can't delete self
    const users = loadUsers();
    const filtered = users.filter((u) => u.id !== userId);
    if (filtered.length === users.length) return false;
    saveUsers(filtered);
    return true;
  }, [user]);

  return {
    user,
    isLoading,
    error,
    isAdmin,
    login,
    register,
    logout,
    clearError,
    getAllUsers,
    updateUserRole,
    deleteUser,
  };
}
