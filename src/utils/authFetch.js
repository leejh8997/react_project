// utils/authFetch.js
export async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');

    // Authorization 헤더 삽입
    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    // 기본 credentials 설정
    if (!options.credentials) {
        options.credentials = 'include';
    }

    let response = await fetch(url, options);

    // 토큰 만료시 refresh 시도
    if (response.status === 401 || response.status === 403) {
        const refreshRes = await fetch('http://localhost:3005/auth/refresh', {
            method: 'POST',
            credentials: 'include', // 쿠키 전송 필수
        });

        const refreshData = await refreshRes.json();
        console.log(refreshData);
        if (refreshRes.ok && refreshData.token) {
            localStorage.setItem('token', refreshData.token);

            // 재시도
            options.headers.Authorization = `Bearer ${refreshData.token}`;
            options.credentials = 'include';
            response = await fetch(url, options);
        } else {
            console.warn('토큰 재발급 실패:', refreshData.message);
            throw new Error('인증 실패. 다시 로그인하세요.');
        }
    }

    return response;
}