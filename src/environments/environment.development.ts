export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  auth0: {
    domain: 'dev-3hjjoohmgq1sgcdx.us.auth0.com',        // Ganti domain dev Auth0 kamu
    clientId: 'iM8ZSgkccuGlsp9XTcuCZKYMwHKgEJGv',    
    clientSecret: 'HdJMqI6Q9q83jKHjAG5a3E_u_lGnwJQbWCi0MaXHmzPH5hStobe5ycPNEJltqHev',     // Ganti client secret dev Auth0 kamu
    authorizationParams: {
      redirect_uri: 'http://localhost:4200'
    }
  }
};

// ini buat environment production
// export const environment = {
//   production: true,
//   apiUrl: 'https://api-sakuku.yourdomain.com/api/v1',   // nanti diisi URL GCP asli
// };