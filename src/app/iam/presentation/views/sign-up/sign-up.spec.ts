import { HttpErrorResponse } from "@angular/common/http";
import { signal } from "@angular/core";
import { of, throwError } from "rxjs";
import { SignUpComponent } from "./sign-up";

describe("SignUpComponent", () => {
    function createComponent() {
        const authStore = {
            loading: vi.fn(() => false),
            signUp: vi.fn(),
            signIn: vi.fn(),
        };
        const router = { navigate: vi.fn() };
        const component = Object.create(SignUpComponent.prototype) as any;
        component.authStore = authStore;
        component.router = router;
        component.errorKey = signal<string | null>(null);
        return { component, authStore, router, getError: () => component.errorKey() };
    }

    function fillValidForm(component: any): void {
        component.username = "nurse.maria";
        component.firstName = "María";
        component.lastName = "Quispe";
        component.phone = "987654321";
        component.age = 30;
        component.email = "maria@example.com";
        component.password = "NursePulse1!";
        component.confirmPassword = "NursePulse1!";
        component.selectedRole = "ROLE_NURSE";
    }

    it.each([
        ["too short", "Short1!"],
        ["too long", "NursePulsePassword123!"],
        ["without uppercase", "nursepulse123!"],
        ["without number", "NursePulse!!"],
        ["without special character", "NursePulse1234"],
    ])("rejects a password %s", (_description, password) => {
        const { component, authStore, getError } = createComponent();
        fillValidForm(component);
        component.password = password;
        component.confirmPassword = password;

        component.submit();

        expect(authStore.signUp).not.toHaveBeenCalled();
        expect(getError()).toBe("access.errors.passwordLength");
    });

    it("rejects an invalid phone and invalid names", () => {
        const { component, authStore, getError } = createComponent();
        fillValidForm(component);
        component.phone = "9876";
        component.firstName = "María123";

        component.submit();

        expect(authStore.signUp).not.toHaveBeenCalled();
        expect(getError()).toBe("access.errors.nameFormat");
    });

    it("submits the complete payload and signs in after registration", () => {
        const { component, authStore, router } = createComponent();
        fillValidForm(component);
        authStore.signUp.mockReturnValue(of({ id: 1, username: "nurse.maria", roles: ["ROLE_NURSE"] }));
        authStore.signIn.mockReturnValue(of({ id: 1, username: "nurse.maria", roles: ["ROLE_NURSE"] }));

        component.submit();

        expect(authStore.signUp).toHaveBeenCalledWith(expect.objectContaining({
            username: "nurse.maria",
            firstName: "María",
            lastName: "Quispe",
            phone: "987654321",
            age: 30,
            email: "maria@example.com",
            role: "ROLE_NURSE",
        }));
        expect(authStore.signIn).toHaveBeenCalledWith({
            username: "nurse.maria",
            password: "NursePulse1!",
        });
        expect(router.navigate).toHaveBeenCalledWith(["/dashboard"]);
    });

    it("maps a duplicate username response", () => {
        const { component, authStore, getError } = createComponent();
        fillValidForm(component);
        authStore.signUp.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));

        component.submit();

        expect(getError()).toBe("access.errors.usernameTaken");
    });
});