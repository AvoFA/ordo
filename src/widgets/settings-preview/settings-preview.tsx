"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";
import { useTheme } from "@/shared/theme/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Sun, Moon, Laptop, Globe, Clock, Trash2, User, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function SettingsPreview() {
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  
  // Simulated Workspace settings
  const [sessionDuration, setSessionDuration] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ordo_session_duration") ?? "45";
    }
    return "45";
  });
  
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ordo_sound_enabled") !== "false";
    }
    return true;
  });

  const handleSessionDurationChange = (duration: string) => {
    setSessionDuration(duration);
    localStorage.setItem("ordo_session_duration", duration);
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem("ordo_sound_enabled", String(enabled));
  };

  const handleResetWorkspace = () => {
    if (confirm(t("settings.resetConfirm"))) {
      localStorage.clear();
      alert(t("settings.resetSuccess"));
      window.location.reload();
    }
  };

  const activeTheme = mounted ? (theme ?? "system") : "system";

  return (
    <div className="w-full space-y-8 max-w-5xl mx-auto">
      {/* Title Header */}
      <section className="space-y-1">
        <p className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-primary/75">
          {t("nav.systemGroup")}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {t("settings.title")}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl">
          {t("settings.subtitle")}
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-[1fr_300px] items-start">
        {/* Left Column: Preferences */}
        <div className="space-y-6">
          {/* Appearance Section */}
          <Card className="rounded-xl border border-border/30 bg-card shadow-sm p-5 gap-0">
            <CardHeader className="p-0 pb-4 mb-4 border-b border-border/10">
              <div className="flex items-center gap-2">
                <Sun className="h-4.5 w-4.5 text-primary/70" />
                <CardTitle className="text-sm font-bold text-foreground">
                  {t("settings.themeTitle")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {t("settings.themeDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: "light", icon: Sun, title: t("settings.lightTheme"), desc: t("settings.lightThemeDesc") },
                  { value: "system", icon: Laptop, title: t("settings.systemTheme"), desc: t("settings.systemThemeDesc") },
                  { value: "dark", icon: Moon, title: t("settings.darkTheme"), desc: t("settings.darkThemeDesc") },
                ] as const).map((option) => {
                  const isActive = activeTheme === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 group cursor-pointer",
                        isActive
                          ? "bg-secondary/20 border-primary/40 text-foreground font-semibold shadow-xs"
                          : "bg-card border-border/40 text-muted-foreground hover:bg-secondary/10 hover:text-foreground"
                      )}
                    >
                      <option.icon className={cn(
                        "h-5 w-5 mb-2 transition-transform duration-300 group-hover:scale-110",
                        isActive ? "text-primary" : "text-muted-foreground/60"
                      )} />
                      <span className="text-xs font-bold">{option.title}</span>
                      <span className="text-[9px] text-muted-foreground/60 mt-0.5 hidden sm:inline">{option.desc}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Localization Section */}
          <Card className="rounded-xl border border-border/30 bg-card shadow-sm p-5 gap-0">
            <CardHeader className="p-0 pb-4 mb-4 border-b border-border/10">
              <div className="flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-primary/70" />
                <CardTitle className="text-sm font-bold text-foreground">
                  {t("settings.languageTitle")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {t("settings.languageDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex rounded-lg border border-border/50 bg-secondary/10 p-0.5 max-w-xs">
                {(["en", "uk"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLocale(lang)}
                    className={cn(
                      "flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                      locale === lang
                        ? "bg-background shadow-xs text-foreground font-bold"
                        : "text-muted-foreground/75 hover:text-foreground"
                    )}
                  >
                    {lang === "en" ? t("settings.langEn") : t("settings.langUk")}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workspace Study Preferences */}
          <Card className="rounded-xl border border-border/30 bg-card shadow-sm p-5 gap-0">
            <CardHeader className="p-0 pb-4 mb-4 border-b border-border/10">
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-primary/70" />
                <CardTitle className="text-sm font-bold text-foreground">
                  {t("settings.preferencesTitle")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {t("settings.preferencesDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-5">
              {/* Session block length selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t("settings.focusBlockLabel")}
                </label>
                <div className="grid grid-cols-4 gap-2 max-w-sm">
                  {["15", "25", "45", "60"].map((duration) => {
                    const isSelected = sessionDuration === duration;
                    return (
                      <button
                        key={duration}
                        onClick={() => handleSessionDurationChange(duration)}
                        className={cn(
                          "py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                            : "bg-card border-border/50 text-muted-foreground hover:bg-secondary/15 hover:text-foreground"
                        )}
                      >
                        {duration}m
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound toggle */}
              <div className="flex items-center justify-between py-2 border-t border-border/10 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t("settings.audioAlertsTitle")}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t("settings.audioAlertsDesc")}</p>
                </div>
                <div className="flex rounded-lg border border-border/50 bg-secondary/15 p-0.5">
                  <button
                    onClick={() => handleSoundToggle(true)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase",
                      soundEnabled ? "bg-background text-foreground shadow-xs" : "text-muted-foreground/60"
                    )}
                  >
                    {t("settings.on")}
                  </button>
                  <button
                    onClick={() => handleSoundToggle(false)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase",
                      !soundEnabled ? "bg-background text-foreground shadow-xs" : "text-muted-foreground/60"
                    )}
                  >
                    {t("settings.off")}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Profile & Danger Zone */}
        <div className="space-y-6">
          {/* Profile overview card */}
          <Card className="rounded-xl border border-border/30 bg-card shadow-sm p-5 gap-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-3 border-b border-border/10 mb-4">
              <User className="h-3.5 w-3.5" />
              {t("settings.profileTitle")}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-bold text-sm">
                  DL
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-foreground truncate">Demo Learner</h3>
                  <p className="text-[10px] text-muted-foreground truncate">demo@ordo.app</p>
                </div>
              </div>
              
              <div className="rounded-lg bg-secondary/20 border border-border/10 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  {t("settings.personalWorkspaceTitle")}
                </div>
                <p className="text-[10px] text-muted-foreground">{t("settings.personalWorkspaceDesc")}</p>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="rounded-xl border border-destructive/20 bg-destructive/[0.02] shadow-sm p-5 gap-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-destructive pb-3 border-b border-destructive/10 mb-4">
              <ShieldAlert className="h-3.5 w-3.5" />
              {t("settings.dangerZoneTitle")}
            </div>
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t("settings.dangerZoneDesc")}
              </p>
              <Button
                onClick={handleResetWorkspace}
                variant="destructive"
                className="w-full justify-center gap-2 text-xs font-bold h-9 rounded-lg"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("settings.resetWorkspaceBtn")}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
