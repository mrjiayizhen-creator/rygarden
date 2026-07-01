import { useState, useEffect, useCallback } from "react";

const USERS_KEY = "tianyuan-users";
const SESSION_KEY = "tianyuan-session";

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
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
    return raw ? JSON.parse(raw) : [];
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = loadSession();
    if (userId) {
      const users = loadUsers();
      const found = users.find((u) => u.id === userId);
      if (found) {
        setUser({
          id: found.id,
          username: found.username,
          createdAt: found.createdAt,
        });
      } else {
        saveSession(null);
      }
    }
    setIsLoading(false);
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
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    saveSession(newUser.id);
    setUser({
      id: newUser.id,
      username: newUser.username,
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

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
