import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { ViewModeStore } from "../../../application/view-mode.store";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [TranslatePipe, RouterLink, RouterLinkActive],
  templateUrl: "./sidebar.html",
  styleUrl: "./sidebar.css",
})
export class SidebarComponent {
  protected readonly viewModeStore = inject(ViewModeStore);
}
