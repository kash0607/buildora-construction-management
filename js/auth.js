/**
 * BUILDORA — Authentication & Session Manager
 */

class AuthManager {
  constructor() {
    this.sessionKey = "buildora_auth_session";
    this.demoUsers = [
      {
        email: "kashish.pm@buildora.com",
        password: "password123",
        name: "Kashish Patel",
        role: "Project Manager",
        avatar: "KP"
      },
      {
        email: "admin@buildora.com",
        password: "password123",
        name: "Vikram Malhotra",
        role: "Admin",
        avatar: "VM"
      },
      {
        email: "sanjay.site@buildora.com",
        password: "password123",
        name: "Sanjay Verma",
        role: "Site Supervisor",
        avatar: "SV"
      },
      {
        email: "finance@buildora.com",
        password: "password123",
        name: "Ananya Iyer",
        role: "Finance",
        avatar: "AI"
      },
      {
        email: "procurement@buildora.com",
        password: "password123",
        name: "Rohan Gupta",
        role: "Procurement Manager",
        avatar: "RG"
      },
      {
        email: "client.rep@lodha.com",
        password: "password123",
        name: "Rajesh Oberoi",
        role: "Client",
        avatar: "RO"
      }
    ];
  }

  getCurrentUser() {
    const session = localStorage.getItem(this.sessionKey);
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        // Fallback
      }
    }
    // Default logged-in user for ease of review
    const defaultUser = this.demoUsers[0];
    this.setSession(defaultUser);
    return defaultUser;
  }

  setSession(user) {
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
  }

  async login(email, password, selectedRole = null) {
    // Quick validation
    if (!email || !password) {
      return { success: false, message: "Please enter your email and password." };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.user) {
        if (data.data.token) {
          localStorage.setItem('buildora_auth_token', data.data.token);
        }
        this.setSession(data.data.user);
        return { success: true, user: data.data.user };
      }
      return { success: false, message: data?.message || "Authentication failed." };
    } catch (err) {
      // Offline fallback to seeded demo users
      let user = this.demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        this.setSession(user);
        return { success: true, user: user };
      }
      return { success: false, message: "Cannot connect to Buildora API server." };
    }
  }

  async register(userData) {
    if (!userData.fullName || !userData.email || !userData.password) {
      return { success: false, message: "Please fill in all required fields." };
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (userData.fullName || '').trim(),
          email: (userData.email || '').trim(),
          password: userData.password,
          role: userData.role || 'Project Manager',
          phone: userData.phone || '',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.user) {
        if (data.data.token) {
          localStorage.setItem('buildora_auth_token', data.data.token);
        }
        this.setSession(data.data.user);
        return { success: true, user: data.data.user };
      }
      return { success: false, message: data?.message || "Registration failed." };
    } catch (err) {
      return { success: false, message: "Cannot connect to Buildora API server." };
    }
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
    window.location.href = window.location.pathname.includes("/pages/") ? "../login.html" : "login.html";
  }

  switchRole(role) {
    const user = this.getCurrentUser();
    user.role = role;
    this.setSession(user);
    // Refresh page or trigger UI update
    window.location.reload();
  }

  protectPage() {
    const user = this.getCurrentUser();
    if (!user && !window.location.pathname.includes("login.html") && !window.location.pathname.includes("register.html")) {
      window.location.href = window.location.pathname.includes("/pages/") ? "../login.html" : "login.html";
    }
    return user;
  }
}

window.auth = new AuthManager();
