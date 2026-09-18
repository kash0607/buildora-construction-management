/**
 * Input validators for Authentication endpoints
 */

export function validateRegisterInput(data) {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Full name is required';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required';
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoginInput(data) {
  const errors = {};

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
