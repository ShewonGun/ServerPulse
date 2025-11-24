import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Check if running in browser
  if (!isPlatformBrowser(platformId)) {
    return true; // Allow during SSR, will be checked again on client
  }
  
  const currentUser = localStorage.getItem('currentUser');
  
  if (currentUser) {
    return true;
  }
  
  // Redirect to login if not authenticated
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Check if running in browser
  if (!isPlatformBrowser(platformId)) {
    return true; // Allow during SSR, will be checked again on client
  }
  
  const currentUserStr = localStorage.getItem('currentUser');
  
  if (!currentUserStr) {
    router.navigate(['/login']);
    return false;
  }
  
  try {
    const currentUser = JSON.parse(currentUserStr);
    
    // Check if user has Administrator role
    if (currentUser.role === 'Administrator') {
      return true;
    }
    
    // Redirect to dashboard if not admin
    router.navigate(['/dashboard']);
    return false;
  } catch (e) {
    router.navigate(['/login']);
    return false;
  }
};
