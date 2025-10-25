require('dotenv').config();

module.exports = {
  /**
   * Admin user configuration
   * It is recommended to use environment variables to set the username and password in a production environment.
   */
  admin: {
    // Default admin username
    username: process.env.ADMIN_USERNAME || 'admin',
    // Default admin password
    password: process.env.ADMIN_PASSWORD || '123456'
  },
  /**
   * Server configuration
   */
  server: {
    // Server port
    port: process.env.PORT || 3000,
    // JWT secret key, it is strongly recommended to use a more complex key in a production environment
    jwtSecret: process.env.JWT_SECRET || 'nav-item-jwt-secret-2024-secure-key'
  }
};