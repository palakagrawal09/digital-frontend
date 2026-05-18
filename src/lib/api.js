import axios from 'axios';
export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, '') ||
  'http://localhost:8000';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const apiClient = {

  getContactPage: () => api.get("/contact"),

 updateContactPage: (data) => api.put("/contact", data),
  adminLogin: (username, password, otp = null) => api.post('/admin/login', { username, password, ...(otp ? { otp } : {}) }),
  adminVerify: () => api.get('/admin/verify'),

  // Admin management (super admin only)
  getAdminUsers: () => api.get('/admin/users'),
  createAdminUser: (data) => api.post('/admin/users', data),
  deleteAdminUser: (id, otp) => api.delete(`/admin/users/${id}`, { data: { otp } }),
  sendManagementOtp: () => api.post('/admin/send-management-otp'),
  changePassword: (current_password, new_password) => api.put('/admin/change-password', { current_password, new_password }),
  changeUsername: (new_username, current_password) => api.put('/admin/change-username', { new_username, current_password }),

  sendOtp: (email, formType = 'enquiry') => api.post('/otp/send', { email, form_type: formType }),
  verifyOtp: (email, otpCode) => api.post('/otp/verify', { email, otp_code: otpCode }),

  submitEnquiry: (data) => api.post('/enquiry/submit', data),
  submitRepair: (data) => api.post('/repair/submit', data),
  getEnquiries: () => api.get('/enquiries'),
  getRepairs: () => api.get('/repairs'),

  getPageContent: (page = null) => api.get('/page-content', { params: page ? { page } : {} }),
  createPageContent: (data) => api.post('/page-content', data),
  updatePageContent: (contentId, updates) => api.put(`/page-content/${contentId}`, updates),
  deletePageContent: (contentId) => api.delete(`/page-content/${contentId}`),

  getProducts: (categoryId = null, published = true) => api.get('/products', { params: { category_id: categoryId, published } }),
  getProduct: (productId) => api.get(`/products/${productId}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (productId, updates) => api.put(`/products/${productId}`, updates),
  deleteProduct: (productId) => api.delete(`/products/${productId}`),

  getProductCategories: () => api.get('/product-categories'),
  createProductCategory: (data) => api.post('/product-categories', data),
  updateProductCategory: (categoryId, updates) => api.put(`/product-categories/${categoryId}`, updates),
  deleteProductCategory: (categoryId) => api.delete(`/product-categories/${categoryId}`),

  getServices: (published = true) => api.get('/services', { params: { published } }),
  createService: (data) => api.post('/services', data),
  updateService: (serviceId, updates) => api.put(`/services/${serviceId}`, updates),
  deleteService: (serviceId) => api.delete(`/services/${serviceId}`),

  getClients: (published = true) => api.get('/clients', { params: { published } }),
  createClient: (data) => api.post('/clients', data),
  updateClient: (clientId, updates) => api.put(`/clients/${clientId}`, updates),
  deleteClient: (clientId) => api.delete(`/clients/${clientId}`),

  getNews: (published = true) => api.get('/news', { params: { published } }),
  createNews: (data) => api.post('/news', data),
  updateNews: (newsId, updates) => api.put(`/news/${newsId}`, updates),
  deleteNews: (newsId) => api.delete(`/news/${newsId}`),

  getEmployees: (status = null) => api.get('/employees', { params: { status } }),
  createEmployee: (data) => api.post('/employees', data),
  updateEmployee: (employeeId, updates) => api.put(`/employees/${employeeId}`, updates),
  deleteEmployee: (employeeId) => api.delete(`/employees/${employeeId}`),

  // About page
  getAboutCategories: () => api.get('/about-categories'),
  createAboutCategory: (data) => api.post('/about-categories', data),
  updateAboutCategory: (categoryId, updates) => api.put(`/about-categories/${categoryId}`, updates),
  deleteAboutCategory: (categoryId) => api.delete(`/about-categories/${categoryId}`),

  getFormFields: (formType = null) =>
  api.get("/form-fields", {
    params: formType ? { form_type: formType } : {},
  }),

 createFormField: (data) => api.post("/form-fields", data),

 updateFormField: (fieldId, updates) =>
  api.put(`/form-fields/${fieldId}`, updates),

 deleteFormField: (fieldId) =>
  api.delete(`/form-fields/${fieldId}`),

  getAboutSections: (categoryId = null) => api.get('/about-sections', { params: categoryId ? { category_id: categoryId } : {} }),
  createAboutSection: (data) => api.post('/about-sections', data),
  updateAboutSection: (sectionId, updates) => api.put(`/about-sections/${sectionId}`, updates),
  deleteAboutSection: (sectionId) => api.delete(`/about-sections/${sectionId}`),

  updateEnquiryStatus: (id, data) => api.put(`/enquiries/${id}/status`, data),

  updateRepairStatus: (id, data) => api.put(`/repairs/${id}/status`, data),

  updateEnquiry: (id, data) => api.put(`/enquiries/${id}`, data),

  updateRepair: (id, data) => api.put(`/repairs/${id}`, data),

  deleteEnquiry: (id) => api.delete(`/enquiries/${id}`),

  deleteRepair: (id) => api.delete(`/repairs/${id}`),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;