import { axios, multiPartAxiosInstance } from "../Utils/config";

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
    tenantsList(params?: any) {
        const response = axios.get("/tenants", { params });
        return response;
    }
    tenantDetail(id: string) {
        const response = axios.get(`/tenants/${id}`);
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
    paymentOrder(payload: any) {
        const response = axios.post(`/payments/orders`, payload);
        return response;
    }
    paymentVerify(payload: any) {
        const response = axios.post(`/payments/verify`, payload);
        return response;
    }
    paymentHistory() {
        const response = axios.get(`/payments/me`);
        return response;
    }
    myBookings() {
        const response = axios.get(`/bookings/my`);
        return response;
    }
    cancelBookinng(id: any) {
        const response = axios.patch(`/bookings/${id}/cancel`);
        return response;
    }
    DeleteAccount() {
        const response = axios.delete(`/user/me`);
        return response;
    }
    shopReviews(id: any) {
        const response = axios.get(`/reviews/tenant/${id}`);
        return response;
    }
    addReviewNormal(id: any, payload: any) {
        const response = axios.post(`/reviews/tenant/${id}`, payload);
        return response;
    }
    addReviewBooking(id: any, payload: any) {
        const response = axios.post(`/reviews/booking/${id}`, payload);
        return response;
    }
    deleteReview(id: any) {
        const response = axios.delete(`/reviews/${id}`);
        return response;
    }
    updateReview(id: any, payload: any) {
        const response = axios.patch(`/reviews/${id}`, payload);
        return response;
    }
    uploadsAvatar(payload: any) {
        const response = multiPartAxiosInstance.post(`/uploads/user/avatar`, payload);
        return response;
    }
}

const authApi = new AuthApiFetch();

export default authApi;
