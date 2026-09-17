import { HttpErrorResponse } from "@angular/common/http";
import { signal } from "@angular/core";
import { SignInComponent } from "./sign-in";

describe("SignInComponent", () => {
    function createComponent() {
        const authStore = {
            loading: vi.fn(() => false),
            signIn: vi.fn(),
        };
        const router = { navigate: vi.fn() };
        const component = Object.create(SignInComponent.prototype) as any;
        component.authStore = authStore;
        component.router = router;
        component.errorKey = signal<string | null>(null);
        return { component, authStore, router, getError: () => component.errorKey() };
    }

    it("rejects an empty username or password without calling the API", () => {
        const { component, authStore, getError } = createComponent();
        component.username = " ";
        component.password = "";

        (component as any).submit();

        expect(authStore.signIn).not.toHaveBeenCalled();
        expect(getError()).toBe("access.errors.required");
    });

    it("trims the username, signs in, and navigates to dashboard", () => {
        const { component, authStore, router } = createComponent();
        authStore.signIn.mockReturnValue({ subscribe: (observer: { next: () => void }) => observer.next() });
        component.username = "  nurse.maria  ";
        component.password = "NursePulse123!";

        (component as any).submit();

        expect(authStore.signIn).toHaveBeenCalledWith({
            username: "nurse.maria",
            password: "NursePulse123!",
        });
        expect(router.navigate).toHaveBeenCalledWith(["/dashboard"]);
    });

    it("maps invalid credentials to the translated error", () => {
        const { component, authStore, getError } = createComponent();
        authStore.signIn.mockReturnValue({
            subscribe: (observer: { error: (value: unknown) => void }) =>
                observer.error(new HttpErrorResponse({ status: 401 })),
        });
        component.username = "nurse.maria";
        component.password = "wrong-password";

        (component as any).submit();

        expect(getError()).toBe("access.errors.invalidCredentials");
    });
});