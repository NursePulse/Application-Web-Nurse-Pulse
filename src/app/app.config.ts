import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "@iam/infrastructure/auth.interceptor";
import { provideTranslateService, TranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";

import { routes } from "./app.routes";

const PULSE_REPORT_LANGUAGE_KEY = "pulse-report-language";
type AppLanguage = "es" | "en";

function getStoredLanguage(): AppLanguage {
  const stored = localStorage.getItem(PULSE_REPORT_LANGUAGE_KEY);
  return stored === "en" || stored === "es" ? stored : "es";
}

function initializeLanguage(): void {
  const translate = inject(TranslateService);
  const language = getStoredLanguage();
  translate.addLangs(["es", "en"]);
  translate.use(language);
  document.documentElement.lang = language;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: "./i18n/",
        suffix: ".json",
      }),
      fallbackLang: "es",
      lang: "es",
    }),
    provideAppInitializer(initializeLanguage),
  ],
};
