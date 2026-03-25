import { ROUTES, API_BASE, API } from '../../shared/constants';

export function registerUploadHandlers(router) {
  // Upload image for search
  router.on(ROUTES.UPLOAD_IMAGE, async (payload) => {
    const { dataUrl } = payload;

    // Convert base64 dataUrl to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('image', blob, 'search-image.jpg');

    const uploadResponse = await fetch(API_BASE + API.IMAGE_UPLOAD, {
      method: 'POST',
      body: formData,
    });

    return uploadResponse.json();
  });

  // Analyze uploaded image
  router.on(ROUTES.IMAGE_ANALYSIS, async (payload) => {
    const { uploadKey } = payload;
    const url = `${API_BASE}${API.IMAGE_ANALYSIS}?uploadKey=${encodeURIComponent(uploadKey)}`;
    const response = await fetch(url);
    return response.json();
  });

  // Generic upload proxy (for platform-specific image search)
  router.on(ROUTES.UPLOAD_PROXY, async (payload) => {
    const { url, method = 'POST', headers = {}, formData, body } = payload;

    const fetchOptions = { method, headers: { ...headers } };

    if (formData) {
      // Reconstruct FormData from serialized data
      const fd = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (value && value.dataUrl) {
          const resp = await fetch(value.dataUrl);
          const blob = await resp.blob();
          fd.append(key, blob, value.filename || 'image.jpg');
        } else {
          fd.append(key, value);
        }
      }
      fetchOptions.body = fd;
      // Don't set Content-Type for FormData (browser sets it with boundary)
      delete fetchOptions.headers['Content-Type'];
    } else if (body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return {
      status: response.status,
      data,
      ok: response.ok,
    };
  });

  // Fetch file as dataURL
  router.on(ROUTES.FETCH_FILE_DATAURL, async (payload) => {
    const { url } = payload;
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  });
}
