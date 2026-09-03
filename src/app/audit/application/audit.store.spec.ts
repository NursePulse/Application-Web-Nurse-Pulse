import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { NEVER } from "rxjs";
import { AuthStore } from "@iam/application/auth.store";
import { User, UserRole } from "@iam/domain/model/user.entity";
import { AuditAction } from "../domain/model/audit-log.entity";
import { AuditApiEndpoint } from "../infrastructure/audit-api-endpoint";
import { AuditStore } from "./audit.store";

describe("AuditStore clinical registration", () => {
  let roles: UserRole[];
  let api: {
    create: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    roles = [];
    api = {
      create: vi.fn(() => NEVER),
    };

    TestBed.configureTestingModule({
      providers: [
        AuditStore,
        { provide: AuditApiEndpoint, useValue: api },
        {
          provide: AuthStore,
          useValue: {
            user: signal(new User("7", "clinical.user", roles)).asReadonly(),
            hasAnyRole: (allowedRoles: UserRole[]) =>
              allowedRoles.some((role) => roles.includes(role)),
          },
        },
      ],
    });
  });

  it.each<UserRole>(["ROLE_NURSE", "ROLE_DOCTOR", "ROLE_ADMIN"])(
    "registers an audit entry for %s",
    (role) => {
      roles.push(role);
      const store = TestBed.inject(AuditStore);

      store.register(AuditAction.CLINICAL_EVENT_REGISTERED, "Created event");

      expect(api.create).toHaveBeenCalledTimes(1);
      expect(api.create).toHaveBeenCalledWith(
        expect.objectContaining({
          performedBy: "clinical.user",
          entityType: "CLINICAL_EVENT",
          actionType: "CREATE",
        }),
      );
    },
  );

  it("does not register an audit entry without a clinical role", () => {
    const store = TestBed.inject(AuditStore);

    store.register(AuditAction.CLINICAL_EVENT_REGISTERED, "Created event");

    expect(api.create).not.toHaveBeenCalled();
  });
});
