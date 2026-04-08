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
        const response = axios.get("/tenants");
        return response;
    }
    profile() {
        const response = axios.get("/users/me");
        return response;
    }
    updateProfile(payload: any) {
        const response = axios.patch("/users/me", payload);
        return response;
    }
    saveTenant(payload: any) {
        const response = axios.post(`/users/me/saved-tenants/${payload}`);
        return response;
    }
    deleteSaveTenant(payload: any) {
        const response = axios.delete(`/users/me/saved-tenants/${payload}`);
        return response;
    }
    savedTenants() {
        const response = axios.get("/users/me/saved-tenants");
        return response;
    }
    servicestenant(payload: any) {
        const response = axios.get(`/services/tenant/${payload}`);
        return response;
    }
    servicesSlot(payload: any) {
        const response = axios.get(`/bookings/availability`, { params: payload });
        return response;
    }
    createBooking(payload: any) {
        const response = axios.post(`/bookings`, payload);
        return response;
    }
    savedPets() {
        const response = axios.get(`/pets`);
        return response;
    }
    updateSavedPet(payload: any) {
        const response = axios.patch(`/pets/${payload.id}`, payload);
        return response;
    }
    deleteSavedPet(id: any) {
        const response = axios.delete(`/pets/${id}`);
        return response;
    }
}

const authApi = new AuthApiFetch();

export default authApi;
