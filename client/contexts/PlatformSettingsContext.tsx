import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { switchAppLanguage } from "@/i18n/runtime";
import { applyGlobalDateFormatting } from "@/utils/platformDateTime";

export type DateTimeFormat = "iso" | "european" | "us";
export type AppLanguage = "en" | "es" | "fr" | "de" | "zh" | "ja" | "ar";

export interface PlatformSettings {
  systemName: string;
  timezone: string;
  dateTimeFormat: DateTimeFormat;
  language: AppLanguage;
  maintenanceMode: boolean;
  themeColor: string;
  updatedAt: string;
}

interface PlatformSettingsContextValue {
  settings: PlatformSettings;
  saveSettings: (next: Omit<PlatformSettings, "updatedAt">) => PlatformSettings;
  t: (key: string) => string;
}

const STORAGE_KEY = "platform_settings_v1";
const DEFAULT_THEME_COLOR = "#7c3aed";
const LEGACY_DEFAULT_BLUE = "#2563eb";

const DEFAULT_SETTINGS: PlatformSettings = {
  systemName: "OSS Platform",
  timezone: "UTC",
  dateTimeFormat: "iso",
  language: "en",
  maintenanceMode: false,
  themeColor: DEFAULT_THEME_COLOR,
  updatedAt: new Date().toISOString(),
};

const DICTIONARY: Record<AppLanguage, Record<string, string>> = {
  en: { dashboard: "Dashboard", analyticsManagement: "Analytics Management", alarmManagement: "Alarm Management", automationAi: "Automation & AI", topologyNetwork: "Topology & Network", commandCenter: "Command Center", activityAudit: "Activity & Audit", reports: "Reports", accessControl: "Access Control", settings: "Settings", maintenanceMode: "Maintenance Mode", networkOps: "Network Ops", saveSettings: "Save Settings", reset: "Reset", generalPlatformSettings: "General Platform Settings", systemName: "System Name", defaultTimezone: "Default Timezone", systemDateTimeFormat: "System-wide Date/Time Format", defaultLanguage: "Default Language", livePreview: "Live Preview" },
  es: { dashboard: "Panel", analyticsManagement: "Gestión de analítica", alarmManagement: "Gestión de alarmas", automationAi: "Automatización e IA", topologyNetwork: "Topología y red", commandCenter: "Centro de mando", activityAudit: "Actividad y auditoría", reports: "Informes", accessControl: "Control de acceso", settings: "Configuración", maintenanceMode: "Modo de mantenimiento", networkOps: "Operaciones de red", saveSettings: "Guardar configuración", reset: "Restablecer", generalPlatformSettings: "Configuración general de la plataforma", systemName: "Nombre del sistema", defaultTimezone: "Zona horaria predeterminada", systemDateTimeFormat: "Formato global de fecha/hora", defaultLanguage: "Idioma predeterminado", livePreview: "Vista previa en vivo" },
  fr: { dashboard: "Tableau de bord", analyticsManagement: "Gestion analytique", alarmManagement: "Gestion des alarmes", automationAi: "Automatisation et IA", topologyNetwork: "Topologie et réseau", commandCenter: "Centre de commande", activityAudit: "Activité et audit", reports: "Rapports", accessControl: "Contrôle d’accès", settings: "Paramètres", maintenanceMode: "Mode maintenance", networkOps: "Opérations réseau", saveSettings: "Enregistrer", reset: "Réinitialiser", generalPlatformSettings: "Paramètres généraux de la plateforme", systemName: "Nom du système", defaultTimezone: "Fuseau horaire par défaut", systemDateTimeFormat: "Format global date/heure", defaultLanguage: "Langue par défaut", livePreview: "Aperçu en direct" },
  de: { dashboard: "Dashboard", analyticsManagement: "Analyseverwaltung", alarmManagement: "Alarmverwaltung", automationAi: "Automatisierung & KI", topologyNetwork: "Topologie & Netzwerk", commandCenter: "Leitstand", activityAudit: "Aktivität & Audit", reports: "Berichte", accessControl: "Zugriffskontrolle", settings: "Einstellungen", maintenanceMode: "Wartungsmodus", networkOps: "Netzbetrieb", saveSettings: "Einstellungen speichern", reset: "Zurücksetzen", generalPlatformSettings: "Allgemeine Plattformeinstellungen", systemName: "Systemname", defaultTimezone: "Standardzeitzone", systemDateTimeFormat: "Systemweites Datums-/Zeitformat", defaultLanguage: "Standardsprache", livePreview: "Live-Vorschau" },
  zh: { dashboard: "仪表盘", analyticsManagement: "分析管理", alarmManagement: "告警管理", automationAi: "自动化与AI", topologyNetwork: "拓扑与网络", commandCenter: "指挥中心", activityAudit: "活动与审计", reports: "报表", accessControl: "访问控制", settings: "设置", maintenanceMode: "维护模式", networkOps: "网络运维", saveSettings: "保存设置", reset: "重置", generalPlatformSettings: "通用平台设置", systemName: "系统名称", defaultTimezone: "默认时区", systemDateTimeFormat: "全局日期/时间格式", defaultLanguage: "默认语言", livePreview: "实时预览" },
  ja: { dashboard: "ダッシュボード", analyticsManagement: "分析管理", alarmManagement: "アラーム管理", automationAi: "自動化とAI", topologyNetwork: "トポロジーとネットワーク", commandCenter: "コマンドセンター", activityAudit: "アクティビティと監査", reports: "レポート", accessControl: "アクセス制御", settings: "設定", maintenanceMode: "メンテナンスモード", networkOps: "ネットワーク運用", saveSettings: "設定を保存", reset: "リセット", generalPlatformSettings: "全般プラットフォーム設定", systemName: "システム名", defaultTimezone: "デフォルトタイムゾーン", systemDateTimeFormat: "システム全体の日付/時刻形式", defaultLanguage: "既定の言語", livePreview: "ライブプレビュー" },
  ar: { dashboard: "لوحة التحكم", analyticsManagement: "إدارة التحليلات", alarmManagement: "إدارة الإنذارات", automationAi: "الأتمتة والذكاء الاصطناعي", topologyNetwork: "الطوبولوجيا والشبكة", commandCenter: "مركز القيادة", activityAudit: "النشاط والتدقيق", reports: "التقارير", accessControl: "التحكم بالوصول", settings: "الإعدادات", maintenanceMode: "وضع الصيانة", networkOps: "عمليات الشبكة", saveSettings: "حفظ الإعدادات", reset: "إعادة تعيين", generalPlatformSettings: "إعدادات المنصة العامة", systemName: "اسم النظام", defaultTimezone: "المنطقة الزمنية الافتراضية", systemDateTimeFormat: "تنسيق التاريخ/الوقت على مستوى النظام", defaultLanguage: "اللغة الافتراضية", livePreview: "معاينة مباشرة" },
};

const PlatformSettingsContext = createContext<PlatformSettingsContextValue | null>(null);

function parseStoredSettings(raw: string | null): PlatformSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<PlatformSettings>;
    const normalizedThemeColor = (() => {
      if (!parsed.themeColor) return DEFAULT_THEME_COLOR;
      return parsed.themeColor.toLowerCase() === LEGACY_DEFAULT_BLUE ? DEFAULT_THEME_COLOR : parsed.themeColor;
    })();

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      themeColor: normalizedThemeColor,
      updatedAt: parsed.updatedAt ?? DEFAULT_SETTINGS.updatedAt,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function hexToHslChannels(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "262 83% 58%";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function PlatformSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(() => parseStoredSettings(typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null));

  useEffect(() => {
    const primary = hexToHslChannels(settings.themeColor);
    switchAppLanguage(settings.language);
    applyGlobalDateFormatting(settings.timezone, settings.dateTimeFormat);
    document.documentElement.setAttribute("data-timezone", settings.timezone);
    document.documentElement.setAttribute("data-date-time-format", settings.dateTimeFormat);
    document.documentElement.setAttribute("data-maintenance-mode", String(settings.maintenanceMode));
    document.documentElement.style.setProperty("--primary", primary);
    document.documentElement.style.setProperty("--accent", primary);
    document.documentElement.style.setProperty("--ring", primary);
    document.documentElement.style.setProperty("--sidebar-primary", primary);
    document.documentElement.style.setProperty("--sidebar-accent", primary);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value = useMemo<PlatformSettingsContextValue>(() => ({
    settings,
    saveSettings: (next) => {
      switchAppLanguage(next.language);
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
