import { axios } from "../Utils/config";

class AuthApiFetch {
    authToken(payload: any) {
        const response = axios.post("/auth/google/verify-token", payload);
        return response;
    }
    register(payload: any) {
        const response = axios.post("/auth/user/register", payload);
        return response;
    }
    login(payload: any) {
        const response = axios.post("/auth/user/login", payload);
        return response
    }
    verificationCode(payload: any) {
        const response = axios.post("auth/user/resend-verification-code", payload);
        return response
    }
    verifyEmail(payload: any) {
        const response = axios.post("/auth/user/verify-email", payload);
        return response
    }
    forgotPassword(payload: any) {
        const response = axios.post("/auth/user/forgot-password", payload);
        return response;
    }
    resetPassword(payload: any) {
        const response = axios.post("/auth/user/reset-password", payload);
        return response;
    }
    tenantsList() {
        const response = axios.get("tenants");
        return response;
    }
    profile() {
        const response = axios.get("users/me");
        return response;
    }
}

const authApi = new AuthApiFetch();

export default authApi;
