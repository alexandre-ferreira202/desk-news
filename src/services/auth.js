// Se o backend for o mesmo servidor do TanStack Start, use "" ou "/"
// Se for um backend Express separado na porta 3000, use "http://localhost:3000"
const API_URL = "http://localhost:3005";

// Fazer login
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    // O fetch não rejeita em erros HTTP (404, 500, etc)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: errorData.message || `Erro ${response.status}: Falha na comunicação com o servidor.` 
      };
    }

    const data = await response.json();
    
    if (data.success) {
      // Guardar token
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
    }
    return data;
  } catch (error) {
    // Aqui cai se o servidor estiver desligado (Erro de conexão)
    console.error("Erro de conexão:", error);
    return { success: false, message: "Não foi possível conectar ao servidor. Verifique se o backend está rodando." };
  }
};

// Fazer pedidos autenticados
export const apiRequest = async (endpoint, options = {}) => {
  // Retorna uma resposta fake amigável se estiver no servidor (SSR)
  if (typeof window === "undefined") {
    return { 
      ok: false, 
      status: 500, 
      json: async () => ({ success: false, message: "Aguardando hidratação no cliente..." }) 
    };
  }
  
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers
      }
    });

    if (response.status === 401) {
      logout(); // Token expirado ou inválido
    }

    return response;
  } catch (error) {
    console.error(`Erro na requisição ${endpoint}:`, error);
    throw error;
  }
};

// Logout
export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

// Verificar se está logado
export const isLoggedIn = () => {
  return typeof window !== "undefined" && !!localStorage.getItem("token");
};