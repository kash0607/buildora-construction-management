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

    // Match demo user or create a session with the selected role
    let user = this.demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Allow any demo login
      user = {
        email: email,
        name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase()),
        role: selectedRole || "Project Manager",
        avatar: email.substring(0, 2).toUpperCase()
      };
    } else if (selectedRole) {
      user.role = selectedRole;
    }

    this.setSession(user);
    return { success: true, user: user };
  }

  async register(userData) {
    if (!userData.fullName || !userData.email || !userData.password) {
      return { success: false, message: "Please fill in all required fields." };
    }

    const newUser = {
      name: userData.fullName,
      email: userData.email,
      role: userData.role || "Project Manager",
      phone: userData.phone || "",
      avatar: userData.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    };

    this.setSession(newUser);
    return { success: true, user: newUser };
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
