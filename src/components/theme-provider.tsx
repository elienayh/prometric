import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type ThemeCtx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const STORAGE_KEY = "prometric-theme";
const Ctx = createContext<ThemeCtx | null>(null);

function readInitial(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
  root.style.colorScheme = t;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readInitial());

  useEffect(() => { applyTheme(theme); }, [theme]);

  // Sincroniza entre abas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = (t: Theme) => {
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
    setThemeState(t);
  };

  return (
    <Ctx.Provider value={{ theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used inside <ThemeProvider />");
  return v;
}

// Script inline para aplicar tema antes do primeiro paint (evita FOUC)
export const themeBootScript = `
(function(){try{
  var k='${STORAGE_KEY}';
  var s=localStorage.getItem(k);
  var t=(s==='light'||s==='dark')?s:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  var r=document.documentElement;
  if(t==='dark')r.classList.add('dark');else r.classList.remove('dark');
  r.style.colorScheme=t;
}catch(e){}})();
`;
