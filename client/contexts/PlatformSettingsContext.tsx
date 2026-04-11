import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type DateTimeFormat = "iso" | "european" | "us";
export type AppLanguage = "en" | "es" | "fr" | "de" | "zh" | "ja" | "ar";

export interface PlatformSettings {
  systemName: string;
  timezone: string;
  dateTimeFormat: DateTimeFormat;
  language: AppLanguage;
  maintenanceMode: boolean;
  updatedAt: string;
}

interface PlatformSettingsContextValue {
  settings: PlatformSettings;
  saveSettings: (next: Omit<PlatformSettings, "updatedAt">) => PlatformSettings;
  t: (key: string) => string;
}

const STORAGE_KEY = "platform_settings_v1";

const DEFAULT_SETTINGS: PlatformSettings = {
  systemName: "OSS Platform",
  timezone: "UTC",
  dateTimeFormat: "iso",
  language: "en",
  maintenanceMode: false,
  updatedAt: new Date().toISOString(),
};

const DICTIONARY: Record<AppLanguage, Record<string, string>> = {
  en: { dashboard: "Dashboard", settings: "Settings", maintenanceMode: "Maintenance Mode", networkOps: "Network Ops", saveSettings: "Save Settings", reset: "Reset" },
  es: { dashboard: "Panel", settings: "Configuración", maintenanceMode: "Modo de mantenimiento", networkOps: "Operaciones de red", saveSettings: "Guardar configuración", reset: "Restablecer" },
  fr: { dashboard: "Tableau de bord", settings: "Paramètres", maintenanceMode: "Mode maintenance", networkOps: "Opérations réseau", saveSettings: "Enregistrer", reset: "Réinitialiser" },
  de: { dashboard: "Dashboard", settings: "Einstellungen", maintenanceMode: "Wartungsmodus", networkOps: "Netzbetrieb", saveSettings: "Einstellungen speichern", reset: "Zurücksetzen" },
  zh: { dashboard: "仪表盘", settings: "设置", maintenanceMode: "维护模式", networkOps: "网络运维", saveSettings: "保存设置", reset: "重置" },
  ja: { dashboard: "ダッシュボード", settings: "設定", maintenanceMode: "メンテナンスモード", networkOps: "ネットワーク運用", saveSettings: "設定を保存", reset: "リセット" },
  ar: { dashboard: "لوحة التحكم", settings: "الإعدادات", maintenanceMode: "وضع الصيانة", networkOps: "عمليات الشبكة", saveSettings: "حفظ الإعدادات", reset: "إعادة تعيين" },
};

const PlatformSettingsContext = createContext<PlatformSettingsContextValue | null>(null);

function parseStoredSettings(raw: string | null): PlatformSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<PlatformSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      updatedAt: parsed.updatedAt ?? DEFAULT_SETTINGS.updatedAt,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function PlatformSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(() => parseStoredSettings(typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null));

  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.setAttribute("data-timezone", settings.timezone);
    document.documentElement.setAttribute("data-date-time-format", settings.dateTimeFormat);
    document.documentElement.setAttribute("data-maintenance-mode", String(settings.maintenanceMode));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value = useMemo<PlatformSettingsContextValue>(() => ({
    settings,
    saveSettings: (next) => {
      const merged: PlatformSettings = { ...next, updatedAt: new Date().toISOString() };
      setSettings(merged);
      return merged;
    },
    t: (key) => DICTIONARY[settings.language]?.[key] ?? DICTIONARY.en[key] ?? key,
  }), [settings]);

  return <PlatformSettingsContext.Provider value={value}>{children}</PlatformSettingsContext.Provider>;
}

export function usePlatformSettings() {
  const context = useContext(PlatformSettingsContext);
  if (!context) throw new Error("usePlatformSettings must be used inside PlatformSettingsProvider");
  return context;
}

