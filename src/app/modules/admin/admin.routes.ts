import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ShoppingCartComponent } from './pages/shopping-cart/shopping-cart.component';
import { ProductsComponent } from './pages/products/products.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { PeopleComponent } from './pages/people/people.component';
import { SaleComponent } from './pages/sale/sale.component';
import { MyCompaniesComponent } from './pages/my-companies/my-companies.component';
import { SaleReportViewComponent } from './pages/reports/sale-report-view/sale-report-view.component';
import { HelperComponent } from './pages/helper/helper.component';
import { ChartsComponent } from './pages/charts/charts.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: { animation: 'DashboardPage' }
  },
  {
    path: 'shopping-cart',
    component: ShoppingCartComponent,
    data: { animation: 'ShoppingCartPage' }
  },
  {
    path: 'products',
    component: ProductsComponent,
    data: { animation: 'ProductsPage' }
  },
  {
    path: 'my-profile',
    component: MyProfileComponent,
    data: { animation: 'MyProfilePage' }
  },
  {
    path: 'people',
    component: PeopleComponent,
    data: { animation: 'PeoplePage' }
  },
  {
    path: 'sale',
    component: SaleComponent,
    data: { animation: 'SalePage' }
  },
  {
    path: 'my-companies',
    component: MyCompaniesComponent,
    data: { animation: 'MyCompaniesPage' }
  },
  {
    path: 'sale-report-view/:id',
    component: SaleReportViewComponent,
    data: { animation: 'SaleReportViewPage' }
  },
  {
    path: 'helper',
    component: HelperComponent
  },
  {
    path: 'charts',
    component: ChartsComponent
  }
];
