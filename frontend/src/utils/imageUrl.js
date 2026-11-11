const API_URL = "http://localhost:5050";

// /uploads/abc.jpg -> http://localhost:5050/uploads/abc.jpg
// pilni URL (https://...) lieka nepakeisti
export const imageUrl = (url) =>
    url && url.startsWith("/uploads/") ? `${API_URL}${url}` : url;