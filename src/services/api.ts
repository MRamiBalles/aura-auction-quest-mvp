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
                                    },

                                    anticheat: {
                                        validateMove: async (data: {
                                            prevLat: number; prevLon: number; prevTime: number;
                                            currLat: number; currLon: number; currTime: number;
                                        }) => {
                                            try {
                                                const response = await fetch(`${API_URL}/anticheat/validate-move`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(data)
                                                });
                                                if (!response.ok) {
                                                    const error = await response.json();
                                                    throw new Error(error.message || 'Movement validation failed');
                                                }
                                                return await response.json();
                                            } catch (error) {
                                                console.error('Anti-Cheat Validation Error:', error);
                                                throw error;
                                            }
                                        }
                                    },

                                    game: {
                                        claimReward: async (data: {
                                            address: string;
                                            signature: string;
                                            message: string;
                                            prevLat: number; prevLon: number; prevTime: number;
                                            currLat: number; currLon: number; currTime: number;
                                        }) => {
                                            try {
                                                const response = await fetch(`${API_URL}/game/claim`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(data)
                                                });
                                                if (!response.ok) {
                                                    const error = await response.json();
                                                    throw new Error(error.message || 'Claim failed');
                                                }
                                                return await response.json();
                                            } catch (error) {
                                                console.error('Game Claim Error:', error);
                                                throw error;
                                            }
                                        }
                                    }
                                };
