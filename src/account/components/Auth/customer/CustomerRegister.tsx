// src/account/components/Auth/customer/CustomerRegister.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import type { RegisterData } from '../../../types/user';
import { getUrl } from '../../../../services/getUrl';
import styles from './CustomerRegister.module.scss';

const CustomerRegister: React.FC = () => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    message: string;
    requiresEmailVerification?: boolean;
    requiresAdminApproval?: boolean;
  } | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const message = urlParams.get('message');
    
    if (verified === 'true' && message) {
      setRegistrationResult({
        success: true,
        message: decodeURIComponent(message),
      });
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one letter and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'password') {
      if (formData.confirmPassword) {
        const match = value === formData.confirmPassword;
        setPasswordMatch(match);
        if (!match && formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else if (match) {
          setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
      }
    } else if (name === 'confirmPassword') {
      const match = value === formData.password;
      setPasswordMatch(match);
      if (!match && value) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (match) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await register(formData);
      
      setRegistrationResult({
        success: true,
        message: result.message,
        requiresEmailVerification: result.requiresEmailVerification,
        requiresAdminApproval: result.requiresAdminApproval,
      });
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
      });
      setPasswordMatch(null);
      
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        submit: err.message || 'Registration failed. Please try again.',
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'password' || name === 'confirmPassword') {
      handlePasswordChange(e);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return null;
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;
    
    if (strength <= 2) return { text: 'Weak', color: '#ef4444', width: '33%' };
    if (strength <= 4) return { text: 'Medium', color: '#f59e0b', width: '66%' };
    return { text: 'Strong', color: '#10b981', width: '100%' };
  };

  const passwordStrength = getPasswordStrength();

  if (registrationResult?.success) {
    return (
      <div className={styles.registerContainer}>
        <div className={styles.registerCard}>
          <div className={styles.registerCardInner}>
            <div className={styles.registerHeader}>
              <div className={styles.registerSuccessIcon}>✅</div>
              <h2 className={styles.registerTitle}>Registration Successful!</h2>
            </div>
            
            <div className={styles.registerSuccessMessage}>
              <p>{registrationResult.message}</p>
              
              {registrationResult.requiresEmailVerification && (
                <div className={styles.registerInfoBox}>
                  <p>📧 <strong>Check your email</strong></p>
                  <p>We've sent a verification link to your email address. Please verify your email to continue.</p>
                </div>
              )}
              
              {registrationResult.requiresAdminApproval && (
                <div className={styles.registerInfoBox}>
                  <p>⏳ <strong>Pending Admin Approval</strong></p>
                  <p>Your registration has been submitted. An administrator will review and approve your account shortly.</p>
                </div>
              )}
              
              {!registrationResult.requiresEmailVerification && !registrationResult.requiresAdminApproval && (
                <div className={styles.registerInfoBox}>
                  <p>🎉 <strong>Account created successfully!</strong></p>
                  <p>You can now log in to your account.</p>
                </div>
              )}
            </div>
            
            <div className={styles.registerActions}>
              <Link to={getUrl('/login')[0]} className={styles.registerButtonLink}>
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerCardInner}>
          <div className={styles.registerHeader}>
            <h2 className={styles.registerTitle}>Create your customer account</h2>
            <p className={styles.registerSubtitle}>Join our community today</p>
          </div>

          <form className={styles.registerForm} onSubmit={handleSubmit}>
            {errors.submit && (
              <div className={styles.registerError}>
                <div className={styles.registerErrorIcon}>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className={styles.registerErrorText}>{errors.submit}</div>
              </div>
            )}

            <div className={styles.registerInputGroup}>
              <div className={styles.registerField}>
                <label htmlFor="firstName" className={styles.registerLabel}>
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`${styles.registerInput} ${errors.firstName ? styles.error : ''}`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className={styles.registerFieldError}>{errors.firstName}</p>}
              </div>

              <div className={styles.registerField}>
                <label htmlFor="lastName" className={styles.registerLabel}>
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`${styles.registerInput} ${errors.lastName ? styles.error : ''}`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className={styles.registerFieldError}>{errors.lastName}</p>}
              </div>

              <div className={styles.registerField}>
                <label htmlFor="email" className={styles.registerLabel}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.registerInput} ${errors.email ? styles.error : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className={styles.registerFieldError}>{errors.email}</p>}
              </div>

              <div className={styles.registerField}>
                <label htmlFor="password" className={styles.registerLabel}>
                  Password
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`${styles.registerInput} ${errors.password ? styles.error : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggleBtn}
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className={styles.passwordToggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className={styles.passwordToggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className={styles.registerFieldError}>{errors.password}</p>}
                
                {formData.password && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.passwordStrengthBar}>
                      <div 
                        className={styles.passwordStrengthFill} 
                        style={{ 
                          width: passwordStrength?.width,
                          backgroundColor: passwordStrength?.color,
                        }}
                      />
                    </div>
                    <p className={styles.passwordStrengthText} style={{ color: passwordStrength?.color }}>
                      Password strength: {passwordStrength?.text}
                    </p>
                  </div>
                )}
                
                <p className={styles.registerHint}>Must be at least 6 characters with letters and numbers</p>
              </div>

              <div className={styles.registerField}>
                <label htmlFor="confirmPassword" className={styles.registerLabel}>
                  Confirm Password
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${styles.registerInput} ${errors.confirmPassword ? styles.error : ''} ${passwordMatch === true && formData.confirmPassword ? styles.valid : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggleBtn}
                    onClick={toggleConfirmPasswordVisibility}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg className={styles.passwordToggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className={styles.passwordToggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className={styles.registerFieldError}>{errors.confirmPassword}</p>
                )}
                {passwordMatch === true && formData.confirmPassword && !errors.confirmPassword && (
                  <p className={styles.registerFieldSuccess}>✓ Passwords match</p>
                )}
              </div>

              <div className={styles.registerField}>
                <div className={styles.registerCheckboxWrapper}>
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className={styles.registerCheckbox}
                  />
                  <label htmlFor="remember-me" className={styles.registerCheckboxLabel}>
                    Remember me
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.registerTerms}>
              By creating an account, you agree to our{' '}
              <Link to={getUrl('/terms')[0]}>Terms of Service</Link> and{' '}
              <Link to={getUrl('/privacy')[0]}>Privacy Policy</Link>.
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={styles.registerButton}
              >
                {isLoading ? (
                  <span className={styles.registerButtonLoading}>
                    <svg
                      className={styles.registerSpinner}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className={styles.registerFooter}>
              Already have an account?{' '}
              <Link to={getUrl('/login')[0]}>Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
