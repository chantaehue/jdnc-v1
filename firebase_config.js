// ------------------------------------------------------------------
// 🔥 Firebase 설정 파일 (firebase_config.js)
// ------------------------------------------------------------------
// 이 파일에 Firebase 프로젝트의 설정 정보를 입력하면
// 스마트팜 대시보드가 자동으로 '서버 모드'로 전환됩니다.
// 설정이 비어있으면 기존의 '브라우저 저장(LocalStorage)' 모드로 동작합니다.
// ------------------------------------------------------------------

// [설정 방법]
// 1. https://console.firebase.google.com 접속 -> 프로젝트 생성
// 2. '웹 앱' 추가 (</> 아이콘 클릭)
// 3. SDK 설정 및 구성 값을 복사하여 아래 'firebaseConfig' 객체에 붙여넣으세요.

const firebaseConfig = {
    apiKey: "AIzaSyBOI5bIDOEG09gFfJNpy9HdLM4dhdShhjY",
    authDomain: "jdnc-v1.firebaseapp.com",
    projectId: "jdnc-v1",
    storageBucket: "jdnc-v1.firebasestorage.app",
    messagingSenderId: "395399592029",
    appId: "1:395399592029:web:dee53f1ecb4143283035b4",
    measurementId: "G-TNWVFVV7YD"
};

// [시스템] Firebase 초기화 로직
let auth, db;
let isFirebaseReady = false;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "") {
        try {
            firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            isFirebaseReady = true;
            console.log("✅ Firebase가 성공적으로 연결되었습니다!");

            // UI에 연결 성공 표시 (옵션)
            const statusBadge = document.getElementById('db-connection-status');
            if (statusBadge) {
                statusBadge.innerHTML = '🟢 Server Online';
                statusBadge.style.color = '#4ade80';
            }
        } catch (error) {
            console.error("❌ Firebase 초기화 실패:", error);
            alert("Firebase 설정에 오류가 있습니다.\n콘솔을 확인해주세요.");
        }
    } else {
        console.warn("⚠️ Firebase API Key가 설정되지 않았습니다. 로컬 저장소 모드로 동작합니다.");
    }
});
