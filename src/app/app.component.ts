import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="app-header">
      <nav class="nav-container">
        <h1 class="logo">Farm Dashboard</h1>
        <ul class="nav-links">
          <li><a routerLink="/dashboard">Dashboard</a></li>
          <li><a routerLink="/reports/daily">Reports</a></li>
        </ul>
      </nav>
    </header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-header {
      background: #2c3e50;
      color: white;
      padding: 0 20px;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 60px;
    }
    .logo {
      font-size: 1.5rem;
      margin: 0;
    }
    .nav-links {
      list-style: none;
      display: flex;
      gap: 20px;
      margin: 0;
      padding: 0;
    }
    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .nav-links a:hover {
      background-color: rgba(255,255,255,0.1);
    }
    .main-content {
      padding: 20px;
    }
  `]
})
export class AppComponent {}
