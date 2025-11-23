import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
    healthCheck: async () => {
        try {
            const response = await fetch(`${API_URL}/health`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API Health Check Failed:', error);
            return null;
        }
    },

    auth: {
        login: async (address: string, signature: string, message: string) => {
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address, signature, message })
                });
                if (!response.ok) throw new Error('Login failed');
                return await response.json();
            } catch (error) {
                toast.error("Backend Login Failed");
                throw error;
            }
        }
    }
};
