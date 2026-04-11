import type { AppLanguage } from "@/contexts/PlatformSettingsContext";

let currentLanguage: AppLanguage = "en";

export function switchAppLanguage(language: AppLanguage) {
  currentLanguage = language;
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }
}

export function getCurrentLanguage() {
  return currentLanguage;
}

