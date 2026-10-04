import { LanguageSwitcherComponent } from "./language-switcher";

/** US-37: the user switches between Spanish and English and the choice is remembered. */
describe("LanguageSwitcherComponent", () => {
  function create(current: string | undefined = undefined) {
    const translate = { use: vi.fn(), getCurrentLang: vi.fn(() => current) };
    const component = Object.create(LanguageSwitcherComponent.prototype) as {
      translate: typeof translate;
      languages: string[];
      storageKey: string;
      currentLanguage(): string;
      useLanguage(language: string): void;
    };
    component.translate = translate;
    component.languages = ["es", "en"];
    component.storageKey = "nurse-pulse-language";
    return { component, translate };
  }

  beforeEach(() => localStorage.clear());

  it("offers Spanish and English", () => {
    expect(create().component.languages).toEqual(["es", "en"]);
  });

  it("defaults to Spanish when no language is active", () => {
    expect(create().component.currentLanguage()).toBe("es");
  });

  it("switches the language, remembers it and updates the document", () => {
    const { component, translate } = create("es");

    component.useLanguage("en");

    expect(translate.use).toHaveBeenCalledWith("en");
    expect(localStorage.getItem("nurse-pulse-language")).toBe("en");
    expect(document.documentElement.lang).toBe("en");
  });
});
