import { Component, inject } from "@angular/core";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

type AppLanguage = "es" | "en";

@Component({
  selector: "app-language-switcher",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./language-switcher.html",
  styleUrl: "./language-switcher.css",
})
export class LanguageSwitcherComponent {
  private readonly storageKey = "pulse-report-language";
  protected readonly translate = inject(TranslateService);
  protected readonly languages: AppLanguage[] = ["es", "en"];

  protected currentLanguage(): string {
    return this.translate.getCurrentLang() || "es";
  }

  protected useLanguage(language: AppLanguage): void {
    this.translate.use(language);
    localStorage.setItem(this.storageKey, language);
    document.documentElement.lang = language;
  }
}
