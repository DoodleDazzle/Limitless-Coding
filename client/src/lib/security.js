export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters`);
  if (!hasUpperCase) errors.push('Password must contain an uppercase letter');
  if (!hasLowerCase) errors.push('Password must contain a lowercase letter');
  if (!hasNumbers) errors.push('Password must contain a number');
  if (!hasSpecialChar) errors.push('Password must contain a special character');

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  return input.replace(/<[^>]*>/g, '');
};
