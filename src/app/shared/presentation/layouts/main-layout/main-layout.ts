import { Component, inject } from "@angular/core";
import {
  RouterOutlet,
  ActivatedRoute,
  Router,
  NavigationEnd,
} from "@angular/router";
import { SidebarComponent } from "../../components/sidebar/sidebar";
import { HeaderComponent } from "../../components/header/header";
import { filter, map } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
import { TranslatePipe } from "@ngx-translate/core";
import { ViewModeStore } from "../../../application/view-mode.store";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, TranslatePipe],
  templateUrl: "./main-layout.html",
  styleUrl: "./main-layout.css",
})
export class MainLayoutComponent {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  protected readonly viewModeStore = inject(ViewModeStore);
  protected readonly currentYear = new Date().getFullYear();

  pageTitle = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) route = route.firstChild;
        return route.snapshot.data["titleKey"] ?? "common.dashboard";
      }),
    ),
    { initialValue: "common.dashboard" },
  );
}
