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
        const component = Object.create(SignUpComponent.prototype) as any;
        component.authStore = authStore;
        component.errorKey = signal<string | null>(null);
        component.registeredEmail = signal<string | null>(null);
        return { component, authStore, getError: () => component.errorKey() };
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

    it("submits the complete payload and shows the verify-email screen, without signing in", () => {
        const { component, authStore } = createComponent();
        fillValidForm(component);
        authStore.signUp.mockReturnValue(of({ id: 1, username: "nurse.maria", roles: ["ROLE_NURSE"] }));

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
        expect(authStore.signIn).not.toHaveBeenCalled();
        expect(component.registeredEmail()).toBe("maria@example.com");
    });

    it("maps a duplicate username response", () => {
        const { component, authStore, getError } = createComponent();
        fillValidForm(component);
        authStore.signUp.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));

        component.submit();

        expect(getError()).toBe("access.errors.usernameTaken");
    });

    it("maps a duplicate email conflict to its own error key", () => {
        const { component, authStore, getError } = createComponent();
        fillValidForm(component);
        authStore.signUp.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 409,
            error: { code: "USER_CONFLICT", message: "User already exists", details: "Email already exists" },
        })));

        component.submit();

        expect(getError()).toBe("access.errors.emailTaken");
    });

    it("maps a duplicate phone conflict to its own error key", () => {
        const { component, authStore, getError } = createComponent();
        fillValidForm(component);
        authStore.signUp.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 409,
            error: { code: "USER_CONFLICT", message: "User already exists", details: "Phone already exists" },
        })));

        component.submit();

        expect(getError()).toBe("access.errors.phoneTaken");
    });

    it("shows the real backend message for an unmapped error status", () => {
        const { component, authStore, getError } = createComponent();
        fillValidForm(component);
        authStore.signUp.mockReturnValue(throwError(() => new HttpErrorResponse({
            status: 500,
            error: { code: "UNEXPECTED_ERROR", message: "Unexpected error in sign-up", details: "Database connection timed out" },
        })));

        component.submit();

        expect(getError()).toBe("Database connection timed out");
    });
});