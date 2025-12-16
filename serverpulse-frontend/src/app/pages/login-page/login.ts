import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  submitted = false;
  errorMessage = '';
  showError = false;
  
  // Dummy credentials for testing
  private readonly DUMMY_USERS = [
    { email: 'admin@serverpulse.com', password: 'admin123', role: 'Administrator' },
    { email: 'user@serverpulse.com', password: 'user1234', role: 'User' }
  ];

  constructor(private fb: FormBuilder, @Inject(DOCUMENT) private document: Document, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Prevent body scrolling while on the login page
    try {
      // disable scrolling on both html and body to cover different browsers/setups
      (this.document.documentElement as HTMLElement).style.overflow = 'hidden';
      this.document.body.style.overflow = 'hidden';
    } catch (e) {
      // ignore in non-browser environments
    }
  }

  ngOnDestroy(): void {
    // Restore body scrolling when leaving the login page
    try {
      (this.document.documentElement as HTMLElement).style.overflow = '';
      this.document.body.style.overflow = '';
    } catch (e) {
      // ignore in non-browser environments
    }
  }

  continueWithGoogle(): void {
    console.log('Continue with Google');
    // Implement Google OAuth logic here
  }

  continueWithApple(): void {
    console.log('Continue with Apple');
    // Implement Apple OAuth logic here
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      // Check against dummy credentials
      const user = this.DUMMY_USERS.find(
        u => u.email === email && u.password === password
      );

      if (user) {
        console.log('Login successful!', { email: user.email, role: user.role });
        // Store user info in localStorage for demo purposes
        localStorage.setItem('currentUser', JSON.stringify({ email: user.email, role: user.role }));
        // Redirect to dashboard page
        this.router.navigate(['/dashboard']);
      } else {
        console.log('Invalid credentials');
        this.errorMessage = 'Invalid email or password. Please try again.';
        this.showError = true;
        
        // Auto-hide error after 4 seconds
        setTimeout(() => {
          this.showError = false;
        }, 4000);
      }
    } else {
      // mark fields touched so Angular validators run and we display errors
      this.markFormGroupTouched(this.loginForm);
    }
  }

  forgotPassword(): void {
    console.log('Forgot password clicked');
    // Navigate to forgot password page
  }

  signUp(): void {
    console.log('Sign up clicked');
    // Navigate to sign up page
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}