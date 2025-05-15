export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  console.log('토큰 있음?', token);
  const headers = options.headers || {};

  // FormData가 아닌 경우에만 Content-Type 설정
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Authorization 항상 추가
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // credentials 기본 설정
  if (!options.credentials) {
    options.credentials = 'include';
  }

  let response = await fetch(url, { ...options, headers });

  // 401/403 → 리프레시 토큰 시도
  if (response.status === 401 || response.status === 403) {
    const refreshRes = await fetch('http://localhost:3005/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    const refreshData = await refreshRes.json();
    if (refreshRes.ok && refreshData.token) {
      localStorage.setItem('token', refreshData.token);
      headers['Authorization'] = `Bearer ${refreshData.token}`;
      response = await fetch(url, { ...options, headers });
    } else {
      console.warn('토큰 재발급 실패:', refreshData.message);
      throw new Error('인증 실패. 다시 로그인하세요.');
    }
  }

  return response;
}