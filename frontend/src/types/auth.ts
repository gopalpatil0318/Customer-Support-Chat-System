export interface SignUpData {
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'agent' | 'admin';
  }
  
  export interface SignInData {
    email: string;
    password: string;
    role:string;
  }
  
  export interface AuthResponse {
    message: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    token: string;
  }
  
  