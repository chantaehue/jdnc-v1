// Authentication JavaScript (Firebase Hybrid Version)

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    // Setup Auth Listener if Firebase is available
    if (typeof auth !== 'undefined' && auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                console.log("🔥 Firebase User Detected:", user.email);
                // Sync with LocalStorage for compatibility
                const probName = user.displayName || user.email.split('@')[0];
                const sessionData = {
                    email: user.email,
                    name: probName,
                    farmName: 'My Cloud Farm',
                    uid: user.uid,
                    role: 'basic' // Default to basic (Require payment for premium)
                };
                localStorage.setItem('currentUser', JSON.stringify(sessionData));

                if (currentPage === 'login.html' || currentPage === 'signup.html') {
                    window.location.href = 'index.html';
                }
            } else {
                // User is signed out.
                // Check if we were relying on LocalStorage
                // if (currentPage !== 'login.html' && currentPage !== 'signup.html') {
                //    window.location.href = 'login.html';
                // }
            }
        });
    }

    // Local Logic (Fallback)
    if (currentPage === 'login.html' || currentPage === 'signup.html') {
        // 이미 로컬 세션이 있으면 리다이렉트
        if (getCurrentUser()) {
            // window.location.href = 'index.html'; // onAuthStateChanged가 처리하도록 잠시 주석
        }
    }

    // Initialize form handlers
    if (currentPage === 'login.html') {
        initLoginForm();
    } else if (currentPage === 'signup.html') {
        initSignupForm();
    }
});

// Initialize Login Form
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // [Security] Admin Hardcoded Check
        // User requested custom admin credentials
        if (email === 'chantaehue' && password === 'wjswlgns82') {
            const adminUser = {
                email: 'chantaehue',
                name: '전태휘 관리자',
                farmName: '통합 관제 센터',
                uid: 'admin_master_123',
                role: 'admin'
            };

            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(adminUser));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(adminUser));
                // Also set local for compatibility with app.js checks
                localStorage.setItem('currentUser', JSON.stringify(adminUser));
            }

            alert('관리자 모드로 접속합니다.');
            window.location.href = 'index.html';
            return;
        }

        if (!email || !password) {
            showError(errorMessage, '이메일과 비밀번호를 입력해주세요.');
            return;
        }

        // [Mode 1] Firebase Login
        if (typeof auth !== 'undefined' && auth) {
            try {
                await auth.signInWithEmailAndPassword(email, password);
                // SUCCESS: onAuthStateChanged will handle redirect
            } catch (error) {
                console.error("Firebase Login Error:", error);
                let msg = "로그인 실패: " + error.message;
                if (error.code === 'auth/user-not-found') msg = "등록되지 않은 사용자입니다.";
                if (error.code === 'auth/wrong-password') msg = "비밀번호가 틀렸습니다.";
                showError(errorMessage, msg);
            }
            return;
        }

        // [Mode 2] LocalStorage Login (Legacy)
        const users = getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            showError(errorMessage, '등록되지 않은 이메일입니다. (Local)');
            return;
        }

        if (user.password !== password) {
            showError(errorMessage, '비밀번호가 일치하지 않습니다. (Local)');
            return;
        }

        // Login successful
        const sessionData = {
            email: user.email,
            name: user.name,
            farmName: user.farmName,
            farmLocation: user.farmLocation, // [NEW] 농장 위치 좌표
            farmAddress: user.farmAddress, // [NEW] 농장 주소
            loginTime: new Date().toISOString(),
            contactNumber: user.contactNumber, // Include contact info
            rememberMe: rememberMe
        };

        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
        }

        window.location.href = 'index.html';
    });
}

// Initialize Signup Form
function initSignupForm() {
    const signupForm = document.getElementById('signup-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    if (!signupForm) return;

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const farmName = document.getElementById('farm-name').value.trim();
        const mainCrop = document.getElementById('main-crop').value.trim();
        const farmAddress = document.getElementById('farm-address').value.trim();
        const contactNumber = document.getElementById('contact-number').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!name || !email || !password || !confirmPassword || !mainCrop || !farmAddress || !contactNumber) {
            showError(errorMessage, '필수 항목을 모두 입력해주세요.');
            return;
        }
        if (password !== confirmPassword) {
            showError(errorMessage, '비밀번호가 일치하지 않습니다.');
            return;
        }

        // [Mode 1] Firebase Signup
        if (typeof auth !== 'undefined' && auth) {
            try {
                // 1. Create Auth User
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // 2. Update Profile
                await user.updateProfile({
                    displayName: name
                });

                // 3. Parse Address to Coordinates
                const farmCoordinates = parseAddressToCoordinates(farmAddress);
                console.log("농장 주소 파싱:", { address: farmAddress, coordinates: farmCoordinates });

                // 4. Save Extra Data to Firestore
                if (typeof db !== 'undefined' && db) {
                    await db.collection('users').doc(user.uid).set({
                        name: name,
                        email: email,
                        farmName: farmName || '내 스마트팜',
                        mainCrop: mainCrop,
                        farmAddress: farmAddress,
                        farmLocation: farmCoordinates, // [NEW] 농장 위치 좌표
                        contactNumber: contactNumber,
                        role: 'member',
                        createdAt: new Date().toISOString()
                    });
                }

                showSuccess(successMessage, '회원가입 완료! 로그인 중...');
                setTimeout(() => { window.location.href = 'index.html'; }, 1500);

            } catch (error) {
                console.error("Firebase Signup Error:", error);
                showError(errorMessage, "가입 실패: " + error.message);
            }
            return;
        }

        // [Mode 2] LocalStorage Signup (Legacy)
        const users = getUsers();
        if (users.some(u => u.email === email)) {
            showError(errorMessage, '이미 등록된 이메일입니다. (Local)');
            return;
        }

        // Parse Address to Coordinates
        const farmCoordinates = parseAddressToCoordinates(farmAddress);
        console.log("농장 주소 파싱 (Local):", { address: farmAddress, coordinates: farmCoordinates });

        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            farmName: farmName || '내 스마트팜',
            mainCrop: mainCrop,
            farmAddress: farmAddress,
            farmLocation: farmCoordinates, // [NEW] 농장 위치 좌표
            contactNumber: contactNumber,
            password: password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        showSuccess(successMessage, '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });
}

// [NEW] Parse Address to Coordinates
function parseAddressToCoordinates(address) {
    // 주소에서 지역을 추출하여 대표 좌표 반환
    const addressLower = address.toLowerCase().replace(/\s/g, '');
    
    // 시/도별 대표 좌표 (각 지역의 중심부)
    const regionCoordinates = {
        // 서울/경기
        '서울': [37.5665, 126.9780],
        '경기': [37.4138, 127.5183],
        '인천': [37.4563, 126.7052],
        '수원': [37.2636, 127.0286],
        '이천': [37.2725, 127.4350],
        '용인': [37.2411, 127.1776],
        '화성': [37.2000, 126.8312],
        '평택': [36.9921, 127.1129],
        '안성': [37.0078, 127.2797],
        '여주': [37.2982, 127.6378],
        '양평': [37.4912, 127.4877],
        
        // 강원
        '강원': [37.8228, 128.1555],
        '춘천': [37.8813, 127.7298],
        '원주': [37.3422, 127.9202],
        '강릉': [37.7519, 128.8761],
        '속초': [38.2070, 128.5918],
        '횡성': [37.4828, 127.9857],
        '홍천': [37.6969, 127.8878],
        '평창': [37.3708, 128.3906],
        
        // 충청
        '충북': [36.6357, 127.4917],
        '충남': [36.5184, 126.8000],
        '충청': [36.6357, 127.4917],
        '대전': [36.3504, 127.3845],
        '세종': [36.4800, 127.2890],
        '청주': [36.6424, 127.4890],
        '천안': [36.8151, 127.1139],
        '공주': [36.4465, 127.1189],
        '아산': [36.7898, 127.0019],
        '서산': [36.7847, 126.4503],
        '당진': [36.8930, 126.6475],
        '충주': [36.9910, 127.9260],
        '제천': [37.1326, 128.1910],
        
        // 전라
        '전북': [35.7175, 127.1530],
        '전남': [34.8679, 126.9910],
        '전라': [35.7175, 127.1530],
        '광주': [35.1595, 126.8526],
        '전주': [35.8242, 127.1479],
        '군산': [35.9676, 126.7369],
        '익산': [35.9483, 126.9575],
        '목포': [34.7934, 126.3886],
        '여수': [34.7604, 127.6622],
        '순천': [34.9506, 127.4872],
        '나주': [35.0160, 126.7107],
        '담양': [35.3211, 126.9881],
        '고흥': [34.6114, 127.2752],
        
        // 경상
        '경북': [36.4919, 128.8889],
        '경남': [35.4606, 128.2132],
        '경상': [36.4919, 128.8889],
        '부산': [35.1796, 129.0756],
        '대구': [35.8714, 128.6014],
        '울산': [35.5384, 129.3114],
        '포항': [36.0190, 129.3435],
        '경주': [35.8562, 129.2247],
        '김해': [35.2284, 128.8889],
        '안동': [36.5684, 128.7294],
        '구미': [36.1195, 128.3445],
        '진주': [35.1800, 128.1076],
        '통영': [34.8544, 128.4331],
        '창원': [35.2280, 128.6811],
        '거제': [34.8806, 128.6211],
        '밀양': [35.5030, 128.7469],
        '양산': [35.3350, 129.0373],
        
        // 제주
        '제주': [33.4996, 126.5312],
        '서귀포': [33.2541, 126.5601]
    };
    
    // 주소에서 지역명 매칭 (긴 지역명부터 매칭)
    const sortedRegions = Object.entries(regionCoordinates).sort((a, b) => b[0].length - a[0].length);
    
    for (const [region, coords] of sortedRegions) {
        if (addressLower.includes(region)) {
            console.log(`✅ 지역 매칭: ${region} →`, coords);
            return coords;
        }
    }
    
    // 기본값: 서울 (매칭 실패 시)
    console.log('⚠️ 지역 매칭 실패, 기본값(서울) 사용:', address);
    return [37.5665, 126.9780];
}

// Helper Functions
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function getCurrentUser() {
    const sessionUser = sessionStorage.getItem('currentUser');
    const localUser = localStorage.getItem('currentUser');
    if (sessionUser) return JSON.parse(sessionUser);
    if (localUser) return JSON.parse(localUser);
    return null;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
    } else {
        alert(message);
    }
}

function hideError(element) {
    if (element) {
        element.classList.add('hidden');
        element.textContent = '';
    }
}

function showSuccess(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
    } else {
        alert(message);
    }
}

// Logout function
function logout() {
    // 1. Firebase SignOut
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().then(() => {
            console.log("🔥 Firebase Signed Out");
            performLocalLogout();
        }).catch((error) => {
            console.error("Firebase SignOut Error:", error);
            // 에러 나더라도 로컬은 지워야 함
            performLocalLogout();
        });
    } else {
        // 2. Local Only
        performLocalLogout();
    }
}

function performLocalLogout() {
    sessionStorage.clear();
    localStorage.removeItem('currentUser');
    // users 데이터는 남겨둠 (로컬 가입 정보 유실 방지)
    window.location.href = 'login.html';
}
