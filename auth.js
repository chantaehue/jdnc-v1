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
            loginTime: new Date().toISOString(),
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

                // 3. Save Extra Data to Firestore
                if (typeof db !== 'undefined' && db) {
                    await db.collection('users').doc(user.uid).set({
                        name: name,
                        email: email,
                        farmName: farmName || '내 스마트팜',
                        mainCrop: mainCrop,
                        farmAddress: farmAddress,
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

        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            farmName: farmName || '내 스마트팜',
            mainCrop: mainCrop,
            farmAddress: farmAddress,
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
