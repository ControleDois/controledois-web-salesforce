import { FormGroup } from "@angular/forms";

export interface FixedHeader {
  title?: string;
  routerBack?: string;
  showBackButton?: boolean;
  showSearchButton?: boolean;
  search?: any;
}
