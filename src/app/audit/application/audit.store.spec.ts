import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { NEVER, of } from "rxjs";
import { AuthStore } from "@iam/application/auth.store";
import { User, UserRole } from "@iam/domain/model/user.entity";
import { AuditAction } from "../domain/model/audit-log.entity";
import { AuditApiEndpoint } from "../infrastructure/audit-api-endpoint";
import { AuditStore } from "./audit.store";

describe("AuditStore clinical registration", () => {
  let roles: UserRole[];
  let api: {
    create: ReturnType<typeof vi.fn>;
    getAll: ReturnType<typeof vi.fn>;
    exportPdf: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    roles = [];
    api = {
      create: vi.fn(() => NEVER),
      getAll: vi.fn(() => NEVER),
      exportPdf: vi.fn(() => NEVER),
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

  it("reloads the audit list after a successful PDF export", () => {
    roles.push("ROLE_DOCTOR");
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    api.exportPdf.mockReturnValue(of(new Blob(["%PDF"])));
    const store = TestBed.inject(AuditStore);

    store.exportPdf();

    expect(api.exportPdf).toHaveBeenCalledTimes(1);
    expect(api.getAll).toHaveBeenCalledTimes(1);
    expect(store.exportingPdf()).toBe(false);
  });

  it("does not export the audit PDF without a doctor or admin role", () => {
    roles.push("ROLE_NURSE");
    const store = TestBed.inject(AuditStore);

    store.exportPdf();

    expect(api.exportPdf).not.toHaveBeenCalled();
  });
});
