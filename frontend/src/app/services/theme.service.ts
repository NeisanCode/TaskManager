import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'taskmanager-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  isDark = signal(false);

  constructor() {
    this.isDark.set(localStorage.getItem(STORAGE_KEY) === 'dark');
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDark.update((isDark) => !isDark);
    localStorage.setItem(STORAGE_KEY, this.isDark() ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.isDark()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

}