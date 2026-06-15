export type ThemeName = "dark" | "light";

export const THEME_COOKIE_NAME = "jmr_theme";

export function parseThemeValue(value: string | undefined): ThemeName | undefined {
  if (value === "dark" || value === "light") {
    return value;
  }

  return undefined;
}
