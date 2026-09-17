import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { AuthenticationApiEndpoint } from "../infrastructure/authentication-api-endpoint";
import { TokenStorage } from "../infrastructure/token.storage";
import { ViewModeStore } from "@shared/application/view-mode.store";
import { AuthStore } from "./auth.store";

describe("AuthStore authentication", () => {
    let api: {
        signIn: ReturnType<typeof vi.fn>;
        signUp: ReturnType<typeof vi.fn>;
    };
    let storage: {
        getToken: ReturnType<typeof vi.fn>;
        getUser: ReturnType<typeof vi.fn>;
        saveSession: ReturnType<typeof vi.fn>;
        clear: ReturnType<typeof vi.fn>;
    };
    let viewModeStore: { setMode: ReturnType<typeof vi.fn>; clearMode: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        api = { signIn: vi.fn(), signUp: vi.fn() };
        storage = {
            getToken: vi.fn(() => null),
            getUser: vi.fn(() => null),
            saveSession: vi.fn(),
            clear: vi.fn(),
        };
        viewModeStore = { setMode: vi.fn(), clearMode: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                AuthStore,
                { provide: AuthenticationApiEndpoint, useValue: api },
                { provide: TokenStorage, useValue: storage },
                { provide: ViewModeStore, useValue: viewModeStore },
            ],
        });
    });

    it("signs in, stores the JWT, and selects the role view", () => {
        api.signIn.mockReturnValue(of({
            id: 3,
            username: "nurse.maria",
            roles: ["ROLE_NURSE"],
            token: "jwt-token",
        }));
        const store = TestBed.inject(AuthStore);

        store.signIn({ username: "nurse.maria", password: "NursePulse123!" }).subscribe();

        expect(api.signIn).toHaveBeenCalledWith({
            username: "nurse.maria",
            password: "NursePulse123!",
        });
        expect(storage.saveSession).toHaveBeenCalledWith("jwt-token", {
            id: "3",
            username: "nurse.maria",
            roles: ["ROLE_NURSE"],
        });
        expect(store.token()).toBe("jwt-token");
        expect(store.isAuthenticated()).toBe(true);
        expect(viewModeStore.setMode).toHaveBeenCalledWith("nurse");
        expect(store.loading()).toBe(false);
    });

    it("registers a user with the complete sign-up payload", () => {
        api.signUp.mockReturnValue(of({
            id: 4,
            username: "doctor.luis",
            roles: ["ROLE_DOCTOR"],
        }));
        const store = TestBed.inject(AuthStore);
        const request = {
            username: "doctor.luis",
            password: "DoctorPulse1!",
            firstName: "Luis",
            lastName: "Mendoza",
            phone: "987654321",
            age: 35,
            email: "luis@example.com",
            role: "ROLE_DOCTOR" as const,
        };

        store.signUp(request).subscribe();

        expect(api.signUp).toHaveBeenCalledWith(request);
        expect(store.loading()).toBe(false);
    });

    it("clears the JWT session on logout", () => {
        const store = TestBed.inject(AuthStore);

        store.signOut();

        expect(storage.clear).toHaveBeenCalledTimes(1);
        expect(viewModeStore.clearMode).toHaveBeenCalledTimes(1);
        expect(store.token()).toBeNull();
        expect(store.user()).toBeNull();
        expect(store.isAuthenticated()).toBe(false);
    });
});