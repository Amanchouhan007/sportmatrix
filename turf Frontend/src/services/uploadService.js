import api, { SERVER_URL } from './api';

/**
 * Upload a single image/video file to the real backend /upload endpoint.
 * Returns the absolute URL to the stored file (data.url is server-relative).
 */
export const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Let the browser set the multipart boundary -- overriding Content-Type
    // to the axios instance's default 'application/json' would break parsing.
    const res = await api.post('/upload', formData, { headers: { 'Content-Type': undefined } });
    if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to upload file.');
    }
    const relativeUrl = res.data?.url;
    return {
        url: relativeUrl ? `${SERVER_URL}${relativeUrl}` : '',
        type: res.data?.type,
        filename: res.data?.filename
    };
};
