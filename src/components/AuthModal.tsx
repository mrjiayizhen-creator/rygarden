import { useState, type FormEvent } from "react";
import { X, User, Lock, Loader2, LogIn, UserPlus, Eye, EyeOff, Flower2 } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onRegister: (username: string, password: string) => Promise<boolean>;
  error: string | null;
  onClearError: () => void;
}

type Mode = "login" | "register";

export function AuthModal({ open, onClose, onLogin, onRegister, error, onClearError }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!open) return null;

  const displayError = error || localError;

  const switchMode = (m: Mode) => {
    setMode(m);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setLocalError(null);
    onClearError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim()) {
      setLocalError("请输入用户名");
      return;
    }
    if (!password) {
      setLocalError("请输入密码");
      return;
    }

    if (mode === "register") {
      if (password !== confirmPassword) {
        setLocalError("两次输入的密码不一致");
        return;
      }
    }

    setIsSubmitting(true);
    const success = mode === "login"
      ? await onLogin(username.trim(), password)
      : await onRegister(username.trim(), password);
    setIsSubmitting(false);

    if (success) {
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 pt-8 pb-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur mb-3">
            <Flower2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">
            {mode === "login" ? "欢迎回来" : "加入田园管家"}
          </h2>
          <p className="text-sm text-emerald-100 mt-1">
            {mode === "login" ? "登录你的账户" : "创建账户开始记录田园生活"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              mode === "login"
                ? "text-emerald-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            登录
            {mode === "login" && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => switchMode("register")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              mode === "register"
                ? "text-emerald-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            注册
            {mode === "register" && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Error */}
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {displayError}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              用户名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); onClearError(); }}
                placeholder="输入用户名"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); onClearError(); }}
                placeholder="输入密码"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (register only) */}
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); onClearError(); }}
                  placeholder="再次输入密码"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === "login" ? "登录中..." : "注册中..."}
              </>
            ) : (
              <>
                {mode === "login" ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {mode === "login" ? "登录" : "注册"}
              </>
            )}
          </button>

          {/* Guest hint */}
          <p className="text-center text-xs text-muted-foreground">
            或
            {" "}
            <button
              type="button"
              onClick={onClose}
              className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
            >
              以游客身份继续浏览
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
