import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { NEVER } from "rxjs";
import { AuditStore } from "@audit/application/audit.store";
import { AuthStore } from "@iam/application/auth.store";
import { User, UserRole } from "@iam/domain/model/user.entity";
import { PatientStore } from "@patient/application/patient.store";
import { NotificationApiEndpoint } from "../infrastructure/notification-api-endpoint";
import { NotificationStore } from "./notification.store";

describe("NotificationStore alert permissions", () => {
  let api: {
    resolve: ReturnType<typeof vi.fn>;
  };
  let roles: UserRole[];

  beforeEach(() => {
    roles = [];
    api = {
      resolve: vi.fn(() => NEVER),
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationStore,
        { provide: NotificationApiEndpoint, useValue: api },
        { provide: AuditStore, useValue: { register: vi.fn() } },
        {
          provide: PatientStore,
          useValue: { patients: signal([]).asReadonly() },
        },
        {
          provide: AuthStore,
          useValue: {
            user: signal(new User("1", "clinical.user", roles)).asReadonly(),
            hasAnyRole: (allowedRoles: UserRole[]) =>
              allowedRoles.some((role) => roles.includes(role)),
          },
        },
      ],
    });
  });

  it("does not call the close endpoint for a nurse", () => {
    roles.push("ROLE_NURSE");
    const store = TestBed.inject(NotificationStore);

    store.resolve("alert-1");

    expect(api.resolve).not.toHaveBeenCalled();
    expect(store.actionErrorKey()).toBe("alerts.closeForbidden");
  });

  it.each<UserRole>(["ROLE_DOCTOR", "ROLE_ADMIN"])(
    "allows %s to close an alert and prevents duplicate requests",
    (role) => {
      roles.push(role);
      const store = TestBed.inject(NotificationStore);

      store.resolve("alert-1");
      store.resolve("alert-1");

      expect(api.resolve).toHaveBeenCalledTimes(1);
      expect(api.resolve).toHaveBeenCalledWith("alert-1", "clinical.user");
      expect(store.isActionPending("alert-1")).toBe(true);
    },
  );
});
