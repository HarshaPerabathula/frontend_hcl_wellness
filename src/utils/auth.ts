// Legacy auth utils - now handled by Redux
export const getToken = (): string | null => localStorage.getItem('token');
export const setToken = (token: string): void => localStorage.setItem('token', token);
export const removeToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
export const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');
export const setUser = (user: any): void => localStorage.setItem('user', JSON.stringify(user));
export const isAuthenticated = (): boolean => !!getToken();
export const isPatient = (): boolean => getUser()?.role === 'patient';
export const isProvider = (): boolean => getUser()?.role === 'provider';