// Chart Configuration
let mainChart;

function initChart() {
    if (typeof Chart === 'undefined') {
        alert('그래프 라이브러리(Chart.js) 로드 실패.\n네트워크 상태를 확인하거나 새로고침 해주세요.');
        return;
    }
    const ctx = document.getElementById('mainChart').getContext('2d');

    // Gradient for temperature
    const tempGradient = ctx.createLinearGradient(0, 0, 0, 400);
    tempGradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
    tempGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

    // Gradient for humidity
    const humidGradient = ctx.createLinearGradient(0, 0, 0, 400);
    humidGradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    humidGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    const data = {
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        datasets: [
            {
                label: '온도 (°C)',
                data: [22, 21, 20, 24, 28, 27, 25, 23],
                borderColor: '#ef4444',
                backgroundColor: tempGradient,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#ef4444'
            },
            {
                label: '습도 (%)',
                data: [70, 72, 75, 68, 62, 65, 68, 70],
                borderColor: '#3b82f6',
                backgroundColor: humidGradient,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6'
            }
        ]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: {
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    };

    mainChart = new Chart(ctx, config);
}

// Sidebar Navigation Handling
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const pageName = item.getAttribute('data-page');

            // [New] 원격 제어 메뉴 준비중 알림
            if (pageName === 'control') {
                alert('🚧 원격 제어 시스템 업그레이드 중입니다.\n(Coming Soon)');
                return; // 페이지 전환 중단
            }

            console.log("Nav Click:", pageName); // Debug

            // [Fix] Ensure Admin Page shows up
            if (pageName === 'admin') {
                const adminPage = document.getElementById('admin-page');
                if (adminPage) {
                    // Try removing hidden class if exists
                    adminPage.classList.remove('hidden');
                    // Force active
                    adminPage.classList.add('active');
                    adminPage.style.display = 'block'; // Inline force

                    // Initialize map if needed
                    if (typeof initAdminMap === 'function') {
                        setTimeout(initAdminMap, 100);
                    }
                }
            }

            const targetPageId = `${pageName}-page`;

            // AI 솔루션 같이 이름이 살짝 다른 경우 예외 처리
            if (pageName === 'ai-solution') {
                // 이미 index.html에 ai-solution-page로 정의됨
            }

            const targetPage = document.getElementById(targetPageId);

            // [Fix] Sync isPremiumActive with data-mode for Analysis logic
            const mode = item.getAttribute('data-mode');
            if (mode === 'premium') {
                isPremiumActive = true;
                console.log('💎 Premium Mode Activated via Tab');
            } else if (mode === 'basic') {
                isPremiumActive = false;
                console.log('🌿 Basic Mode Activated via Tab');
            }

            if (targetPage) {
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                pages.forEach(p => p.classList.remove('active'));
                targetPage.classList.add('active');

                // [Mobile Fix] 페이지 전환 시 스크롤 상단으로 이동
                window.scrollTo({ top: 0, behavior: 'instant' });

                // [Mobile Fix] AI/Admin 페이지는 대시보드 외부에 있으므로 레이아웃 조정
                const appContainer = document.querySelector('.app-container');
                if (pageName === 'ai-solution' || pageName === 'admin') {
                    // 모바일에서 대시보드 컨테이너 숨기기
                    if (window.innerWidth <= 768 && appContainer) {
                        appContainer.style.display = 'none';
                    }
                } else {
                    // 대시보드 페이지는 컨테이너 표시
                    if (appContainer) {
                        appContainer.style.display = '';
                    }
                }
            } else {
                console.warn(`Page not found: ${targetPageId}`);
            }
        });
    });

    // Dashboard의 "모든 제어 보기" 버튼 등 별도 경로 처리
    const showControlBtn = document.querySelector('.show-control-page');
    if (showControlBtn) {
        showControlBtn.addEventListener('click', () => {
            const controlNav = document.querySelector('.nav-item[data-page="control"]');
            if (controlNav) controlNav.click();
        });
    }
}

// Switch Toggle Mock Event
function initToggles() {
    const toggles = document.querySelectorAll('.switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const label = e.target.closest('.control-item').querySelector('span').textContent;
            console.log(`${label} 상태 변경: ${e.target.checked ? '켜짐' : '꺼짐'}`);
        });
    });
}

// Weather & Geolocation Implementation
async function initWeather() {
    // 페이지 로드 시 서울 기준 기본 날씨만 로드 (자동 위치 요청 없음)
    const locElement = document.getElementById('current-location');
    if (locElement) locElement.textContent = '서울 (기본값)';

    await fetchWeatherData(37.5665, 126.9780);
    console.log('📍 기본 위치(서울) 날씨 로드 완료');

    // "내 위치 날씨" 버튼 클릭 핸들러 등록
    const locationBtn = document.getElementById('get-my-location-btn');
    if (locationBtn) {
        locationBtn.addEventListener('click', getMyLocationWeather);
    }
}

// 사용자가 버튼 클릭 시 위치 기반 날씨 로드
async function getMyLocationWeather() {
    const locElement = document.getElementById('current-location');
    const tempElement = document.getElementById('out-temp');
    const humElement = document.getElementById('out-hum');
    const windElement = document.getElementById('out-wind');
    const rainElement = document.getElementById('out-rain');
    const btn = document.getElementById('get-my-location-btn');

    // 버튼 비활성화 및 로딩 표시
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> 위치 확인중...';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    if (locElement) locElement.textContent = '위치 확인 중...';

    if (!("geolocation" in navigator)) {
        alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
        resetLocationButton();
        return;
    }

    try {
        const position = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('위치 확인 시간 초과 (10초)'));
            }, 10000);

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    clearTimeout(timeout);
                    resolve(pos);
                },
                (err) => {
                    clearTimeout(timeout);
                    reject(err);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000 // 1분 캐시
                }
            );
        });

        const { latitude, longitude } = position.coords;

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,precipitation_probability`);
        const data = await response.json();

        // Update UI with real location data
        if (tempElement) tempElement.textContent = data.current_weather.temperature;
        if (windElement) windElement.textContent = data.current_weather.windspeed;

        const currentHour = new Date().getHours();
        if (humElement) humElement.textContent = data.hourly.relativehumidity_2m[currentHour];
        if (rainElement) rainElement.textContent = data.hourly.precipitation_probability[currentHour];

        if (locElement) locElement.textContent = `위도 ${latitude.toFixed(2)}, 경도 ${longitude.toFixed(2)} (실시간)`;

        // Update Top Bar Weather
        const topWeatherText = document.querySelector('.weather-info span');
        if (topWeatherText) topWeatherText.textContent = `${data.current_weather.temperature}°C 실외`;

        console.log('🌍 실시간 위치 날씨 업데이트 완료');

        // 성공 표시
        if (btn) {
            btn.innerHTML = '<i data-lucide="check"></i> 완료!';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            setTimeout(resetLocationButton, 2000);
        }

    } catch (error) {
        console.error('위치 정보 오류:', error);

        let errorMsg = '위치 정보를 가져올 수 없습니다.';
        if (error.code === 1) errorMsg = '위치 권한이 거부되었습니다.';
        else if (error.code === 2) errorMsg = '위치를 확인할 수 없습니다.';
        else if (error.code === 3 || error.message.includes('시간 초과')) errorMsg = '위치 확인 시간이 초과되었습니다.';

        if (locElement) locElement.textContent = '서울 (기본값) - ' + errorMsg;
        alert(errorMsg + '\n서울 기준 날씨가 표시됩니다.');
        resetLocationButton();
    }
}

function resetLocationButton() {
    const btn = document.getElementById('get-my-location-btn');
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="navigation"></i> 내 위치 날씨';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

async function fetchWeatherData(lat, lon) {
    // Reusable fetch for fallback or manual updates
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,precipitation_probability`);
        const data = await response.json();

        const tempEl = document.getElementById('out-temp');
        const humEl = document.getElementById('out-hum');
        const windEl = document.getElementById('out-wind');
        const rainEl = document.getElementById('out-rain');

        if (tempEl) tempEl.textContent = data.current_weather.temperature;
        if (humEl) humEl.textContent = data.hourly.relativehumidity_2m[new Date().getHours()];
        if (windEl) windEl.textContent = data.current_weather.windspeed;
        if (rainEl) rainEl.textContent = data.hourly.precipitation_probability[new Date().getHours()];

        // Update top bar
        const topWeatherText = document.querySelector('.weather-info span');
        if (topWeatherText) topWeatherText.textContent = `${data.current_weather.temperature}°C 실외`;

    } catch (e) {
        console.error("Open-Meteo Fetch Error:", e);
    }
}

// Scientific Analysis Logic
// Market Data Simulator - 전국 기준 (서울 가락시장)
const marketPriceData = {
    strawberry: { wholesale: 35000, retail: 48000 },
    tomato: { wholesale: 18000, retail: 25000 },
    lettuce: { wholesale: 8000, retail: 12000 },
    cucumber: { wholesale: 15000, retail: 22000 },
    paprika: { wholesale: 28000, retail: 38000 },
    eggplant: { wholesale: 12000, retail: 18000 },
    leafy: { wholesale: 5000, retail: 9000 },
    melon: { wholesale: 45000, retail: 60000 }
};

// [NEW] 지역별 시세 변동률 (%)
const regionalPriceModifiers = {
    seoul: { name: "서울/경기", modifier: 1.0, description: "가락시장 기준" },
    gangwon: { name: "강원", modifier: 0.92, description: "물류비 반영" },
    chungcheong: { name: "충청", modifier: 0.95, description: "중부권 평균" },
    jeolla: { name: "전라", modifier: 0.88, description: "산지 직거래" },
    gyeongsang: { name: "경상", modifier: 0.90, description: "부산/대구 기준" },
    jeju: { name: "제주", modifier: 1.05, description: "도서지역 운송비" }
};

// [NEW] 좌표 기반 지역 판별 함수
function getRegionFromCoordinates(lat, lng) {
    console.log("📍 위치 판별:", { lat, lng });
    
    // 한국 주요 지역 좌표 범위
    // 서울/경기: 37.2~37.7, 126.7~127.3
    if (lat >= 37.2 && lat <= 37.7 && lng >= 126.7 && lng <= 127.3) {
        return regionalPriceModifiers.seoul;
    }
    // 강원: 37.3~38.6, 127.5~129.0
    if (lat >= 37.3 && lat <= 38.6 && lng >= 127.5 && lng <= 129.0) {
        return regionalPriceModifiers.gangwon;
    }
    // 충청: 36.0~37.0, 126.3~128.0
    if (lat >= 36.0 && lat <= 37.0 && lng >= 126.3 && lng <= 128.0) {
        return regionalPriceModifiers.chungcheong;
    }
    // 전라: 34.5~36.0, 126.0~127.5
    if (lat >= 34.5 && lat <= 36.0 && lng >= 126.0 && lng <= 127.5) {
        return regionalPriceModifiers.jeolla;
    }
    // 경상: 34.6~36.8, 127.5~129.5
    if (lat >= 34.6 && lat <= 36.8 && lng >= 127.5 && lng <= 129.5) {
        return regionalPriceModifiers.gyeongsang;
    }
    // 제주: 33.0~34.0, 126.0~127.0
    if (lat >= 33.0 && lat <= 34.0 && lng >= 126.0 && lng <= 127.0) {
        return regionalPriceModifiers.jeju;
    }
    
    // 기본값 (서울)
    return regionalPriceModifiers.seoul;
}

let marketChart = null;

function generateMarketHistory(basePrice, period) {
    const points = period === 'week' ? 7 : (period === 'month' ? 30 : 12);
    const labels = [];
    const data = [];

    for (let i = points; i > 0; i--) {
        if (period === 'year') {
            labels.push(`${i}개월 전`);
        } else {
            labels.push(`${i}일 전`);
        }
        // Random fluctuation +/- 15%
        const fluctuation = 1 + (Math.random() * 0.3 - 0.15);
        data.push(Math.round(basePrice * fluctuation));
    }
    return { labels, data };
}

function updateMarketData(cropId, period = 'week') {
    if (!marketPriceData) {
        alert('시세 데이터베이스가 로드되지 않았습니다.');
        return;
    }
    const base = marketPriceData[cropId] || marketPriceData.strawberry;

    // Debug
    // console.log('Updating Market Data for:', cropId);

    // Update Value Displays
    document.getElementById('wholesale-max').textContent = `${(base.wholesale * 1.2).toLocaleString()}원`;
    document.getElementById('wholesale-avg').textContent = `${base.wholesale.toLocaleString()}원`;
    document.getElementById('wholesale-min').textContent = `${(base.wholesale * 0.8).toLocaleString()}원`;

    document.getElementById('retail-max').textContent = `${(base.retail * 1.2).toLocaleString()}원`;
    document.getElementById('retail-avg').textContent = `${base.retail.toLocaleString()}원`;
    document.getElementById('retail-min').textContent = `${(base.retail * 0.8).toLocaleString()}원`;

    // Update Chart
    const history = generateMarketHistory(base.wholesale, period);

    if (marketChart) {
        marketChart.destroy();
    }

    const ctx = document.getElementById('marketChart').getContext('2d');
    marketChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.labels,
            datasets: [{
                label: '도매 평균가 (가락시장)',
                data: history.data,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', callback: (value) => value.toLocaleString() + '원' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function initMarketAnalysis() {
    const cropSelect = document.getElementById('select-crop');
    const periodBtns = document.querySelectorAll('.period-tabs button');

    // Sync with crop selection
    cropSelect.addEventListener('change', () => {
        const currentPeriod = document.querySelector('.period-tabs button.active').dataset.period;
        updateMarketData(cropSelect.value, currentPeriod);
    });

    // Period switching
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateMarketData(cropSelect.value, btn.dataset.period);
        });
    });

    // Initial load
    updateMarketData(cropSelect.value, 'week');
}

function calculateVPD(temp, humidity) {
    // Saturated vapor pressure (es) in kPa
    const es = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    // Actual vapor pressure (ea) in kPa
    const ea = es * (humidity / 100);
    // Vapor Pressure Deficit (VPD)
    return (es - ea).toFixed(2);
}

// Crop Standard Database (EC targets)
// Crop Standard Database (EC targets) - Legacy support for basic analysis
const cropStandards = {
    strawberry: { domestic: { ec: 1.2, ph: 5.8 }, international: { ec: 1.4, ph: 5.5 } },
    tomato: { domestic: { ec: 2.5, ph: 6.0 }, international: { ec: 3.0, ph: 6.2 } },
    lettuce: { domestic: { ec: 1.4, ph: 6.0 }, international: { ec: 1.6, ph: 5.8 } },
    cucumber: { domestic: { ec: 2.2, ph: 5.5 }, international: { ec: 2.5, ph: 5.8 } },
    paprika: { domestic: { ec: 2.6, ph: 5.8 }, international: { ec: 2.8, ph: 5.5 } },
    eggplant: { domestic: { ec: 2.4, ph: 6.0 }, international: { ec: 2.6, ph: 6.0 } },
    leafy: { domestic: { ec: 1.5, ph: 5.8 }, international: { ec: 1.7, ph: 5.5 } },
    melon: { domestic: { ec: 2.0, ph: 6.0 }, international: { ec: 2.2, ph: 6.2 } }
};

// Advanced Nutrient Prescriptions
const nutrientPrescriptions = {
    strawberry: {
        'yamazaki': { name: '야마자키 (Yamazaki)', ec: 0.8, ph: 6.0, info: '질산태 질소 위주의 처방으로 EC를 낮게 관리합니다.' },
        'japan_enshi': { name: '일본원시 (Japan Enshi)', ec: 0.9, ph: 6.5, info: '일본에서 가장 널리 사용되는 범용적인 처방입니다.' },
        'netherlands': { name: '네덜란드 (PBG)', ec: 1.2, ph: 5.5, info: '높은 EC 관리로 생산성을 극대화하는 방식입니다.' },
        'korea_rda': { name: '농진청 (Korea RDA)', ec: 1.0, ph: 5.8, info: '대한민국 농촌진흥청 표준 처방입니다.' }
    },
    tomato: {
        'yamazaki': { name: '야마자키 (Yamazaki)', ec: 2.2, ph: 6.0, info: '토마토 전용 야마자키 처방입니다.' },
        'netherlands': { name: '네덜란드 (PBG)', ec: 3.0, ph: 5.5, info: '고품질 다수확을 위한 고농도 처방입니다.' },
        'cooper': { name: '쿠퍼 (Cooper)', ec: 2.5, ph: 6.0, info: 'NFT 재배에 적합한 처방입니다.' },
        'korea_os': { name: '서울시립대 (UOS)', ec: 2.4, ph: 6.0, info: '국내 환경에 최적화된 토마토 처방입니다.' }
    },
    paprika: {
        'netherlands': { name: '네덜란드 (PBG)', ec: 2.8, ph: 5.5, info: '파프리카 재배의 표준으로 통용됩니다.' },
        'belgium': { name: '벨기에 (Belgium)', ec: 2.6, ph: 5.8, info: '균형 잡힌 생육을 유도합니다.' }
    },
    cucumber: {
        'yamazaki': { name: '야마자키 (Yamazaki)', ec: 2.0, ph: 6.0, info: '오이 뿌리 발달에 유리합니다.' },
        'japan_hort': { name: '일본원예 (Hort)', ec: 2.2, ph: 5.8, info: '과실 비대기에 유리한 처방입니다.' }
    },
    lettuce: {
        'yamazaki': { name: '야마자키 (Yamazaki)', ec: 1.2, ph: 6.0, info: '엽채류 전용 저농도 처방입니다.' },
        'utrecht': { name: '위트레흐트 (Utrecht)', ec: 1.4, ph: 6.0, info: '유럽형 상추 재배에 적합합니다.' }
    },
    melon: {
        'yamazaki': { name: '야마자키 (Melon)', ec: 2.2, ph: 6.0, info: '멜론 고유의 향과 당도를 높이는 처방입니다.' },
        'netherlands': { name: '네덜란드 (PBG)', ec: 2.5, ph: 5.5, info: '네트 형성기 이후 EC 관리가 중요합니다.' }
    },
    eggplant: {
        'yamazaki': { name: '야마자키 (Eggplant)', ec: 2.0, ph: 5.8, info: '가지 생육에 최적화된 칼륨 균형 처방입니다.' },
        'netherlands': { name: '네덜란드 (PBG)', ec: 2.6, ph: 5.5, info: '수확기 다수확을 위한 고농도 처방입니다.' }
    },
    leafy: {
        'yamazaki': { name: '야마자키 (Leafy)', ec: 1.3, ph: 6.0, info: '일반 엽채류 범용 처방입니다.' },
        'korea_common': { name: '국내 표준', ec: 1.5, ph: 5.8, info: '국내 엽채류 재배 환경에 맞춘 처방입니다.' }
    },
    // Fallback for other crops
    default: {
        'yamazaki': { name: '야마자키 (Standard)', ec: 1.5, ph: 6.0, info: '범용 야마자키 처방입니다.' },
        'general': { name: '일반 표준', ec: 1.5, ph: 6.0, info: '일반적인 수경재배 표준입니다.' }
    }
};

// Crop Growth Guide Database (Moved to Top Level)
const cropGuide = {
    strawberry: { name: '딸기', tempDay: 23, tempNight: 8, hum: 60, light: 35000, tip: '저온성 작물입니다. 25도 이상 고온 시 기형과 발생 및 화분 발아 불량이 우려됩니다.' },
    tomato: { name: '토마토', tempDay: 25, tempNight: 15, hum: 70, light: 50000, tip: '광 요구도가 높습니다. 적엽을 통해 작물 하단까지 빛이 들어오게 관리하세요.' },
    paprika: { name: '파프리카', tempDay: 24, tempNight: 18, hum: 75, light: 40000, tip: '착과 부담에 따라 온도 관리가 중요합니다. 과실 비대기에는 야간 온도를 약간 높이세요.' },
    cucumber: { name: '오이', tempDay: 26, tempNight: 18, hum: 80, light: 45000, tip: '생장 속도가 빠릅니다. 영양 생장과 생식 생장의 균형을 위해 급액 농도 조절이 중요합니다.' },
    lettuce: { name: '상추', tempDay: 20, tempNight: 15, hum: 65, light: 25000, tip: '호냉성 작물입니다. 고온 시 추대(꽃대 올라옴)가 발생하니 차광막을 활용하세요.' },
    melon: { name: '멜론', tempDay: 30, tempNight: 20, hum: 60, light: 55000, tip: '고온을 좋아합니다. 네트 형성기에는 습도 변화를 최소화해야 품질이 좋아집니다.' },
    eggplant: { name: '가지', tempDay: 28, tempNight: 18, hum: 70, light: 40000, tip: '고온성 작물입니다. 15도 이하 저온에서는 생육이 급격히 저하됩니다.' },
    leafy: { name: '엽채류', tempDay: 22, tempNight: 15, hum: 70, light: 20000, tip: '환기를 철저히 하여 잎마름병(Tip-burn)을 예방하세요.' }
};



function analyzeStatus(data) {
    const { temp, hum, light, co2, leafTemp, cropId, standardId, nutrient } = data;
    const vpd = calculateVPD(temp, hum);
    const tempDiff = (temp - leafTemp).toFixed(1);
    const std = cropStandards[cropId][standardId];

    let solutions = [];
    let status = "좋음";
    let statusClass = "healthy";

    // 1. Integrated Environment Analysis
    if (vpd < 0.5) {
        solutions.push({ icon: 'droplets', text: "습도가 너무 높아 증산이 억제됩니다. 환기가 필요합니다." });
        status = "주의 (다습)";
        statusClass = "warning";
    } else if (vpd > 1.5) {
        solutions.push({ icon: 'wind', text: "환경이 건조합니다. 기공 보호를 위해 관수량을 늘리십시오." });
    }

    if (tempDiff < 0) {
        solutions.push({ icon: 'thermometer-sun', text: "엽온도 과열! 뿌리로부터의 수분 공급이 증산 수요를 못 따라가고 있습니다." });
        status = "고온 스트레스";
        statusClass = "danger";
    }

    // 2. Integrated Nutrient Analysis (Premium)
    if (nutrient.active) {
        const { in: nIn, root: nRoot, drain: nDrain } = nutrient;

        // Supply vs Demand Analysis
        const ecDiff = (nRoot.ec - nIn.ec).toFixed(2);
        const phTrend = (nRoot.ph - nIn.ph).toFixed(2);

        // a. Concentration Analysis (Supply-Root-Drain Interaction)
        if (nRoot.ec > std.ec + 0.5) {
            solutions.push({ icon: 'alert-circle', text: `근권 EC(${nRoot.ec})가 목표치보다 높습니다. 급액 EC를 낮추거나 급액량을 늘려 세척이 필요합니다.` });
            status = "영양 과다";
            statusClass = "warning";
        } else if (nRoot.ec < std.ec - 0.3) {
            solutions.push({ icon: 'zap', text: "양분 흡수량이 많아 근권 EC가 낮아졌습니다. 급액 농도를 상향 제안합니다." });
        }

        // b. Root Health Analysis (pH & Temp)
        if (nRoot.ph > 7.0) {
            solutions.push({ icon: 'flask-conical', text: "근권 pH가 지나치게 높습니다. 미량원소 결핍이 우려되니 산성 제재 처방을 검토하십시오." });
        } else if (nRoot.ph < 5.0) {
            solutions.push({ icon: 'skull', text: "근권 소산화(pH 급감) 현상 발생. 뿌리 호흡 저하가 우려됩니다." });
            status = "근권 위험";
            statusClass = "danger";
        }

        if (nRoot.temp > 25) {
            solutions.push({ icon: 'thermometer', text: "근권 온도가 높아 용존 산소량이 부족합니다. 양액 냉각기 가동을 권장합니다." });
        }

        // c. Absorption Efficiency (Supply vs Drain)
        if (nDrain.ec > nIn.ec + 0.3) {
            solutions.push({ icon: 'activity', text: "배액 EC가 상승했습니다. 작물이 물보다 비료를 적게 흡수하고 있습니다 (광도 부족 또는 고온)." });
        }

        return { vpd, tempDiff, ecDiff, phTrend, solutions, status, statusClass };
    }

    return { vpd, tempDiff, solutions, status, statusClass };
}

function updateAISolutionPage(analysis) {
    const aiContent = document.querySelector('#ai-solution-page');
    if (!aiContent) return;

    const statusBadge = aiContent.querySelector('.ai-status');
    statusBadge.className = `ai-status ${analysis.statusClass}`;
    statusBadge.querySelector('span').textContent = `작물 상태: ${analysis.status}`;

    const list = aiContent.querySelector('.recommendation-list');
    list.innerHTML = '';
    analysis.solutions.forEach(sol => {
        const li = document.createElement('li');
        li.innerHTML = `<i data-lucide="${sol.icon}"></i> ${sol.text}`;
        list.appendChild(li);
    });

    const analysisBox = aiContent.querySelector('.ai-analysis');
    let summaryText = `<b>VPD ${analysis.vpd} kPa</b> | <b>온도차 ${analysis.tempDiff}°C</b>`;
    if (analysis.ecDiff) {
        summaryText += ` <br> <b>EC 변화 ${analysis.ecDiff}</b> | <b>pH 변동 ${analysis.phTrend}</b>`;
        const ecEl = document.getElementById('ec-diff');
        const phEl = document.getElementById('ph-trend');
        if (ecEl) ecEl.textContent = (analysis.ecDiff > 0 ? "+" : "") + analysis.ecDiff;
        if (phEl) phEl.textContent = (analysis.phTrend > 0 ? "+" : "") + analysis.phTrend;
    }
    analysisBox.querySelector('p').innerHTML = `전문가 통합 분석: <br>${summaryText}`;

    lucide.createIcons();
}

// Premium Support
let isPremiumActive = false;

function initPremium() {
    const unlockBtn = document.getElementById('unlock-premium-btn');
    const premiumBanner = document.getElementById('premium-banner');
    const premiumFields = document.querySelectorAll('.premium-only');
    const premiumCards = document.querySelectorAll('.premium-locked');
    const form = document.querySelector('.entry-form');

    unlockBtn.addEventListener('click', () => {
        isPremiumActive = true;

        // UI Updates
        premiumBanner.classList.add('hidden');
        premiumFields.forEach(f => f.classList.remove('hidden'));
        premiumCards.forEach(c => c.classList.add('unlocked'));
        form.classList.add('premium-active');

        alert('프리미엄 양액 분석 서비스가 활성화되었습니다!');
        lucide.createIcons();

        // [UX Fix] Sync Standard Crop to Premium Crop
        const standardCrop = document.getElementById('select-crop');
        const premiumCrop = document.getElementById('nutrient-crop-select');
        if (standardCrop && premiumCrop) {
            premiumCrop.value = standardCrop.value;
            // Keep them in sync
            standardCrop.addEventListener('change', () => {
                premiumCrop.value = standardCrop.value;
            });
        }
    });
}

// Manual Data Entry Handling
function initManualEntry() {
    const form = document.getElementById('manual-data-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        try {
            console.log('Starting analysis...', { isPremiumActive });

            const sVal = document.getElementById('select-crop').value;
            const pVal = document.getElementById('nutrient-crop-select') ? document.getElementById('nutrient-crop-select').value : 'N/A';
            console.log('DEBUG: Submit Analysis', { isPremiumActive, StandardVals: sVal, PremiumVal: pVal });

            const data = {
                temp: parseFloat(document.getElementById('input-temp').value) || 26.5,
                hum: parseFloat(document.getElementById('input-hum').value) || 65,
                light: parseFloat(document.getElementById('input-light').value) || 12000,
                co2: parseFloat(document.getElementById('input-co2').value) || 450,
                leafTemp: parseFloat(document.getElementById('input-leaf-temp').value) || 24.8,
                // ...

                cropId: isPremiumActive
                    ? document.getElementById('nutrient-crop-select').value
                    : document.getElementById('select-crop').value,
                standardId: isPremiumActive
                    ? document.getElementById('nutrient-standard-select').value
                    : document.getElementById('select-standard').value,
                cropName: isPremiumActive
                    ? document.getElementById('nutrient-crop-select').options[document.getElementById('nutrient-crop-select').selectedIndex].text
                    : document.getElementById('select-crop').options[document.getElementById('select-crop').selectedIndex].text,

                nutrient: {
                    active: isPremiumActive,
                    in: {
                        ec: parseFloat(document.getElementById('input-in-ec').value) || 0,
                        ph: parseFloat(document.getElementById('input-in-ph').value) || 0
                    },
                    root: {
                        ec: parseFloat(document.getElementById('input-root-ec').value) || 0,
                        ph: parseFloat(document.getElementById('input-root-ph').value) || 0,
                        temp: parseFloat(document.getElementById('input-root-temp').value) || 0,
                        hum: parseFloat(document.getElementById('input-root-hum').value) || 0
                    },
                    drain: {
                        ec: parseFloat(document.getElementById('input-drain-ec').value) || 0,
                        ph: parseFloat(document.getElementById('input-drain-ph').value) || 0
                    }
                }
            };

            // Update Dashboard Display
            // Update Dashboard Display - Disabled as display elements were replaced by input form
            // document.getElementById('in-temp').textContent = data.temp;
            // document.getElementById('in-hum').textContent = data.hum;
            // document.getElementById('in-light').textContent = data.light;
            // document.getElementById('in-co2').textContent = data.co2;
            // document.getElementById('in-leaf-temp').textContent = data.leafTemp;

            // Perform Scientific Analysis (General Status)
            const analysis = analyzeStatus(data);
            updateAISolutionPage(analysis);

            // Perform Detailed Analysis (Greenhouse Only or Premium Nutrient)
            if (isPremiumActive) {
                if (typeof analyzeNutrientSolution === 'function') {
                    analyzeNutrientSolution(data);
                } else {
                    console.error('analyzeNutrientSolution unreachable');
                    throw new Error('프리미엄 분석 함수를 찾을 수 없습니다.');
                }
            } else {
                if (typeof analyzeGreenhouseOnly === 'function') {
                    analyzeGreenhouseOnly(data);
                } else {
                    console.error('analyzeGreenhouseOnly unreachable');
                    // Fallback: define it here if missing (Defensive Coding)
                    console.warn('온실 분석 함수가 아직 로드되지 않았습니다.');
                    // alert('온실 분석 함수가 아직 로드되지 않았습니다. 페이지를 새로고침 해주세요.');
                    return;
                }
            }

            console.log('Analysis completed successfully');
            // alert(`[${data.cropName}] 맞춤형 생육 솔루션이 생성되었습니다.\n하단의 리포트 카드를 확인하세요.`);

        } catch (error) {
            console.error('Analysis execution error:', error);
            // alert('분석 중 오류가 발생했습니다: ' + error.message);
        }
    });
}

// Nutrient Solution Analysis
function analyzeNutrientSolution(data) {
    const { cropId, standardId, nutrient } = data;

    // [Fix] Trust the data passed from submit handler (which handles Premium/Standard logic)
    const nutrientCrop = cropId;
    const nutrientStandard = standardId;

    console.log(`Analyzing: Crop=${nutrientCrop}, Std=${nutrientStandard}`);

    // Get prescription data safely using the advanced prescription database
    let targetData;
    if (nutrientPrescriptions[nutrientCrop] && nutrientPrescriptions[nutrientCrop][nutrientStandard]) {
        targetData = nutrientPrescriptions[nutrientCrop][nutrientStandard];
    } else if (nutrientPrescriptions.default[nutrientStandard]) {
        targetData = nutrientPrescriptions.default[nutrientStandard];
    } else {
        // Fallback to Yamazaki Standard if not found
        targetData = nutrientPrescriptions.default['yamazaki'];
    }

    const targetEC = targetData.ec;
    const targetPH = targetData.ph;
    const standardName = targetData.name;
    const standardInfo = targetData.info;

    const solutions = [];

    // Add Crop Guide Tip (Safe Mode)
    let guide = null;
    try {
        if (typeof cropGuide !== 'undefined') {
            guide = cropGuide[nutrientCrop] || cropGuide.lettuce;
        }
    } catch (e) { console.log('Crop guide skipped'); }

    if (guide) {
        solutions.push({
            type: 'info',
            icon: 'book',
            text: `<strong>[${guide.name} 재배 가이드]</strong> ${guide.tip}`
        });
    }

    let overallStatus = 'healthy';

    // Add Standard Info with Scientific Basis
    solutions.push({
        type: 'info',
        icon: 'book-open',
        text: `<strong>[${standardName}]</strong> ${standardInfo}`
    });

    // 1. EC Analysis (Scientific Range Analysis)
    const rootEC = nutrient.root.ec;
    const inEC = nutrient.in.ec;
    const drainEC = nutrient.drain.ec;

    if (rootEC > 0) {
        // EC Tolerance based on crop sensitivity (General rule: +/- 0.5 is critical)
        if (rootEC > targetEC + 0.5) {
            solutions.push({
                type: 'warning',
                icon: 'alert-triangle',
                text: `근권 EC(${rootEC}dS/m)가 목표치(${targetEC}dS/m)보다 높습니다. 염류 집적 위험이 있습니다. 급액 EC를 0.2~0.5dS/m 낮추거나 배액율을 30% 이상으로 높여 세척 배양하세요.`
            });
            overallStatus = 'warning';
        } else if (rootEC < targetEC - 0.3) {
            solutions.push({
                type: 'info',
                icon: 'flask-conical',
                text: `근권 EC(${rootEC}dS/m)가 목표치(${targetEC}dS/m)보다 낮습니다. 생육 저하가 우려됩니다. 급액 EC를 0.2dS/m 단계적으로 상향 조정하세요.`
            });
        } else {
            solutions.push({
                type: 'success',
                icon: 'check-circle',
                text: `근권 EC(${rootEC}dS/m)가 적정 범위(±0.3dS/m) 내에서 안정적으로 관리되고 있습니다.`
            });
        }
    }

    // 2. pH Analysis
    const rootPH = nutrient.root.ph;

    if (rootPH > 0) {
        if (rootPH > targetPH + 0.5) {
            solutions.push({
                type: 'warning',
                icon: 'alert-circle',
                text: `근권 pH(${rootPH})가 높습니다. Fe, Mn, B 등 미량원소 결핍이 발생할 수 있습니다. 질산/인산 등을 이용하여 급액 pH를 하향 조정하세요.`
            });
            overallStatus = 'warning';
        } else if (rootPH < targetPH - 0.5) {
            solutions.push({
                type: 'danger',
                icon: 'skull',
                text: `근권 pH(${rootPH})가 낮습니다. 뿌리 손상 및 Ca, Mg 결핍 위험이 큽니다. 수산화칼륨 등을 이용하여 급액 pH를 상향 조정하세요.`
            });
            overallStatus = 'danger';
        } else {
            solutions.push({
                type: 'success',
                icon: 'check-circle',
                text: `근권 pH(${rootPH})가 양분 흡수에 최적화된 범위 내에 있습니다.`
            });
        }
    }

    // 3. Root Temperature Analysis
    const rootTemp = nutrient.root.temp;

    if (rootTemp > 0) {
        if (rootTemp > 25) {
            solutions.push({
                type: 'warning',
                icon: 'thermometer',
                text: `근권 온도(${rootTemp}°C)가 고온 한계선을 초과했습니다. 용존산소량(DO) 감소로 인한 뿌리 활력 저하가 우려됩니다. 차광 및 쿨링 시스템을 가동하세요.`
            });
            overallStatus = 'warning';
        } else if (rootTemp < 15) {
            solutions.push({
                type: 'info',
                icon: 'thermometer-snowflake',
                text: `근권 온도(${rootTemp}°C)가 저온 상태입니다. 인(P) 흡수 불량이 발생할 수 있습니다. 근권 난방이 필요합니다.`
            });
        } else {
            solutions.push({
                type: 'success',
                icon: 'check-circle',
                text: `근권 온도(${rootTemp}°C)가 적정 생육 범위(18-23°C)입니다.`
            });
        }
    }

    // 4. Drain EC Analysis (Absorption Pattern)
    if (drainEC > 0 && inEC > 0) {
        const ecDiff = drainEC - inEC;
        if (ecDiff > 0.3) {
            solutions.push({
                type: 'info',
                icon: 'activity',
                text: `배액 EC가 급액보다 높습니다(농축). 작물의 수분 흡수가 양분 흡수보다 활발합니다. 증산량이 많으므로 과습 및 고온을 주의하세요.`
            });
        } else if (ecDiff < -0.3) {
            solutions.push({
                type: 'info',
                icon: 'droplet',
                text: '배액 EC가 급액보다 낮습니다. 작물의 양분 흡수가 매우 활발합니다. 급액 농도를 유지하거나 약간 높이세요.'
            });
        }
    }

    // --- INTEGRATED GROWTH ANALYSIS (Environment + Nutrient) ---
    const integrated = analyzeIntegratedGrowth(data);
    solutions.push(...integrated.solutions);

    // Update UI
    updateNutrientSolutionUI(solutions, overallStatus, targetEC, targetPH, nutrientCrop, standardName, integrated.metrics);
}

// Integrated Growth Analysis Algorithm
function analyzeIntegratedGrowth(data) {
    const solutions = [];
    const { temp, hum, light, co2, leafTemp, nutrient } = data;
    const rootEC = nutrient.root.ec;

    // Calculate VPD (Vapor Pressure Deficit)
    const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    const vpd = svp * (1 - hum / 100);

    // 1. Water Stress Analysis (VPD vs Root EC)
    if (vpd > 1.5 && rootEC > 2.5) {
        solutions.push({
            type: 'danger',
            icon: 'droplet',
            text: `<strong>[수분 스트레스 위험]</strong> 대기가 건조(VPD ${vpd.toFixed(1)}kPa)하고 근권 농도(${rootEC}dS/m)가 높습니다. 작물이 물을 흡수하기 매우 어려운 환경입니다. 팁번(Tip-burn) 및 위조 발생 위험이 큽니다. 가습을 하거나 급액 EC를 즉시 낮추세요.`
        });
    } else if (vpd < 0.5 && rootEC < 1.0) {
        solutions.push({
            type: 'warning',
            icon: 'cloud-drizzle',
            text: `<strong>[과습/도장 주의]</strong> 다습한 환경에서 근권 농도가 너무 낮습니다. 증산이 억제되어 웃자람(도장)이 발생할 수 있습니다. 환기를 통해 습도를 60%대로 낮추고 급액 EC를 약간 높이세요.`
        });
    }

    // 2. Photosynthesis Balance Analysis (Light vs CO2 vs Temp)
    if (light > 20000 && co2 < 400) {
        solutions.push({
            type: 'warning',
            icon: 'wind',
            text: `<strong>[광합성 제한 요인]</strong> 강한 광량(${light}lux) 대비 CO2(${co2}ppm)가 부족하여 광합성 효율이 떨어지고 있습니다. 환기를 억제하고 탄산(CO2) 시비를 강화하면 생산성이 크게 향상됩니다.`
        });
    }

    // RTR (Radiation to Temperature Ratio) Balance
    if (light < 10000 && temp > 25) {
        solutions.push({
            type: 'warning',
            icon: 'sun',
            text: `<strong>[RTR 불균형]</strong> 광량(${light}lux)이 부족한 상태에서 고온(${temp}°C)이 유지되고 있습니다. 호흡에 의한 양분 소모가 커져 작물이 연약해질 수 있습니다(소모적 생육). 평균 온도를 20°C 이하로 낮춰 관리하세요.`
        });
    }

    // 3. Disease Risk Analysis (Dew Point & Leaf Temp)
    // Dew Point Calculation approximation
    const dewPoint = temp - ((100 - hum) / 5);
    if (leafTemp - dewPoint < 2) {
        solutions.push({
            type: 'danger',
            icon: 'shield-alert',
            text: `<strong>[결로/병해 경고]</strong> 엽온(${leafTemp}°C)이 이슬점(${dewPoint.toFixed(1)}°C)에 근접했습니다. 잎 표면에 결로가 생겨 곰팡이병(흰가루병, 노균병) 발생 위험이 매우 높습니다. 난방을 하거나 유동팬으로 공기를 순환시키세요.`
        });
    }

    return {
        solutions: solutions,
        metrics: {
            vpd: vpd.toFixed(2),
            dewPoint: dewPoint.toFixed(1)
        }
    };
}



// Greenhouse Only Analysis (For Free Users)
function analyzeGreenhouseOnly(data) {
    const solutions = [];
    const { temp, hum, light, co2, leafTemp, cropId } = data;

    // Get Crop Guide (Safe Mode)
    let guide = { name: '작물', tempDay: 25, tempNight: 15, hum: 70, light: 35000, tip: '표준 생육 환경을 유지하며 급격한 환경 변화를 피하세요.' };

    try {
        if (typeof cropGuide !== 'undefined') {
            const found = cropGuide[cropId];
            if (found) guide = found;
            else if (cropGuide.lettuce) guide = cropGuide.lettuce;
        }
    } catch (e) { console.log('Greenhouse guide skipped'); }

    // 0. Crop Specific Advice (Top Priority)
    solutions.push({
        type: 'info',
        icon: 'book',
        text: `<strong>[${guide.name} 재배 가이드]</strong> ${guide.tip}`
    });

    // 1. Temperature Analysis (Crop Specific)
    if (temp > guide.tempDay + 3) {
        solutions.push({
            type: 'warning',
            icon: 'thermometer',
            text: `<strong>[고온 경고]</strong> 현재 ${temp}°C는 ${guide.name}의 적정 주간온도(${guide.tempDay}°C)보다 높습니다. 환기나 차광이 필요합니다.`
        });
    } else if (temp < guide.tempNight - 5) { // Assuming day check, needs context but using wide range
        solutions.push({
            type: 'warning',
            icon: 'thermometer-snowflake',
            text: `<strong>[저온 주의]</strong> 현재 ${temp}°C는 다소 낮습니다. 생육 지연이 우려됩니다.`
        });
    }

    // 2. VPD Analysis
    const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    const vpd = svp * (1 - hum / 100);

    if (vpd > 1.6) {
        solutions.push({
            type: 'warning',
            icon: 'sun',
            text: `<strong>[건조 스트레스]</strong> 대기가 건조합니다(VPD ${vpd.toFixed(1)}kPa). 기공 폐쇄 방지를 위해 가습하세요.`
        });
    } else if (vpd < 0.5) {
        solutions.push({
            type: 'warning',
            icon: 'cloud-rain',
            text: `<strong>[다습 경고]</strong> 습도가 높습니다(VPD ${vpd.toFixed(1)}kPa). 곰팡이병 예방을 위해 난방 환기하세요.`
        });
    } else {
        solutions.push({
            type: 'success',
            icon: 'check-circle',
            text: `대기 수분 환경(VPD ${vpd.toFixed(1)}kPa)이 작물 생육에 적정합니다.`
        });
    }

    // 3. Disease Risk (Dew Point)
    const dewPoint = temp - ((100 - hum) / 5);
    if (leafTemp - dewPoint < 2) {
        solutions.push({
            type: 'danger',
            icon: 'shield-alert',
            text: `<strong>[병해 위험]</strong> 결로 발생 가능성이 매우 높습니다. 엽온 관리에 유의하세요.`
        });
    }

    // 4. Photosynthesis Efficiency (Crop Specific Light)
    if (light < guide.light * 0.5) {
        solutions.push({
            type: 'warning',
            icon: 'moon',
            text: `<strong>[광량 부족]</strong> 현재 광량(${light}lux)이 ${guide.name}의 요구량(${guide.light}lux)에 크게 못 미칩니다. 보광등 사용을 고려하세요.`
        });
    } else if (light > 25000 && co2 < 400) {
        solutions.push({
            type: 'info',
            icon: 'wind',
            text: `<strong>[생산성 증대]</strong> 광량이 충분합니다. 탄산(CO2) 시비 시 수확량이 증대됩니다.`
        });
    }

    // Update UI with Greenhouse Only Mode
    updateNutrientSolutionUI(solutions, 'info', null, null, data.cropId, 'Greenhouse Analysis');
}

// Update Nutrient Solution UI
function updateNutrientSolutionUI(solutions, status, targetEC, targetPH, cropId, standardName, metrics = null) {
    const solutionCard = document.getElementById('nutrient-solution-card');
    const statusBadge = document.getElementById('nutrient-status-badge');
    const targetInfo = document.getElementById('nutrient-target-info');
    const solutionList = document.getElementById('nutrient-solution-list');
    const cardHeader = solutionCard.querySelector('h4');

    if (!solutionCard) return;

    // Show the card and move it below the form if needed
    solutionCard.classList.remove('hidden');

    // Determine Mode (Premium vs Free)
    const isGreenhouseOnly = standardName === 'Greenhouse Analysis';

    // Update Header and Badges
    if (isGreenhouseOnly) {
        cardHeader.innerHTML = '<i data-lucide="leaf"></i> 온실 환경 진단 리포트';
        statusBadge.textContent = '환경 분석';
        statusBadge.className = 'status-badge info';
        targetInfo.innerHTML = `<b>${getCropName(cropId)}</b> 생육 환경 분석`;
    } else {
        cardHeader.innerHTML = '<i data-lucide="microscope"></i> 통합 정밀 분석 리포트';
        statusBadge.className = `status-badge ${status}`;
        const statusText = {
            'healthy': '최적 (Optimal)',
            'warning': '주의 (Warning)',
            'danger': '위험 (Critical)',
            'info': '정보 (Info)'
        };
        statusBadge.textContent = statusText[status] || '분석 완료';
        targetInfo.innerHTML = `<b>${getCropName(cropId)} - ${standardName}</b> 기준값 <br> EC: ${targetEC}dS/m | pH: ${targetPH}`;

        if (metrics) {
            targetInfo.innerHTML += `<br><span style="color:var(--accent-color); font-size: 0.9em;">VPD: ${metrics.vpd}kPa | 이슬점: ${metrics.dewPoint}°C</span>`;
        }
    }

    // Update solution list
    solutionList.innerHTML = '';

    if (solutions.length === 0) {
        const li = document.createElement('li');
        li.className = 'no-solution';
        li.textContent = isGreenhouseOnly ? '환경 조건이 전반적으로 양호합니다.' : '모든 데이터가 학술적 허용 오차 범위 내에 있습니다.';
        solutionList.appendChild(li);
    } else {
        solutions.forEach(solution => {
            const li = document.createElement('li');
            li.className = `solution-${solution.type}`;
            li.innerHTML = `<i data-lucide="${solution.icon}"></i> <span>${solution.text}</span>`;
            solutionList.appendChild(li);
        });
    }

    // Reinitialize Lucide icons
    lucide.createIcons();
}


// Initialize Nutrient Selectors with Dynamic Options
function initNutrientSelectors() {
    const cropSelect = document.getElementById('nutrient-crop-select');
    const standardSelect = document.getElementById('nutrient-standard-select');

    if (!cropSelect || !standardSelect) return;

    // Function to populate standard options based on selected crop
    const updateStandardOptions = () => {
        const crop = cropSelect.value;
        // FIX: Use nutrientPrescriptions instead of cropStandards
        const standards = nutrientPrescriptions[crop] || nutrientPrescriptions.default;

        // Clear existing options
        standardSelect.innerHTML = '';

        // Add valid options
        Object.keys(standards).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = standards[key].name;
            standardSelect.appendChild(option);
        });

        // Trigger generic update
        updateTargetDisplay();
    };

    // Update target info when selection changes
    const updateTargetDisplay = () => {
        const crop = cropSelect.value;
        const standardKey = standardSelect.value;

        // FIX: Use nutrientPrescriptions instead of cropStandards
        let targetData = null;
        if (nutrientPrescriptions[crop] && nutrientPrescriptions[crop][standardKey]) {
            targetData = nutrientPrescriptions[crop][standardKey];
        } else if (nutrientPrescriptions.default[standardKey]) {
            targetData = nutrientPrescriptions.default[standardKey];
        }

        if (targetData) {
            const cropName = getCropName(crop);
            const targetInfo = document.getElementById('nutrient-target-info');
            if (targetInfo) {
                targetInfo.innerHTML = `<b>${cropName} - ${targetData.name}</b> 기준값 <br> EC: ${targetData.ec}dS/m | pH: ${targetData.ph}`;
            }
        }
    };

    cropSelect.addEventListener('change', updateStandardOptions);
    standardSelect.addEventListener('change', updateTargetDisplay);

    // Initial population
    updateStandardOptions();
}


// Harvest Info Registration and Price Query
function initHarvestRegistration() {
    const marketCropSelect = document.getElementById('market-crop-select');
    const yieldAmountInput = document.getElementById('yield-amount');
    const registerBtn = document.getElementById('register-map-btn');
    const wholesaleRevenueEl = document.getElementById('wholesale-revenue');
    const retailRevenueEl = document.getElementById('retail-revenue');
    const revenuePredictions = document.getElementById('revenue-predictions');

    function calculateRevenue(regionInfo = null) {
        const cropId = marketCropSelect.value;
        const yieldAmount = parseFloat(yieldAmountInput.value) || 0;

        console.log(`Calculating revenue for ${cropId}, amount: ${yieldAmount}`);

        if (yieldAmount <= 0) {
            if (wholesaleRevenueEl) wholesaleRevenueEl.textContent = '--';
            if (retailRevenueEl) retailRevenueEl.textContent = '--';
            return;
        }

        // [NEW] 지역별 시세 적용
        const basePrice = marketPriceData[cropId] || marketPriceData.strawberry;
        const modifier = regionInfo ? regionInfo.modifier : 1.0;
        
        const adjustedWholesale = Math.round(basePrice.wholesale * modifier);
        const adjustedRetail = Math.round(basePrice.retail * modifier);
        
        const wholesaleRevenue = Math.round(yieldAmount * adjustedWholesale);
        const retailRevenue = Math.round(yieldAmount * adjustedRetail);

        console.log("💰 시세 계산:", {
            지역: regionInfo ? regionInfo.name : "전국 평균",
            변동률: modifier,
            도매가: adjustedWholesale,
            소매가: adjustedRetail
        });

        if (wholesaleRevenueEl) {
            wholesaleRevenueEl.textContent = wholesaleRevenue.toLocaleString() + '원';
            // 지역 정보 표시
            if (regionInfo) {
                wholesaleRevenueEl.setAttribute('title', `${regionInfo.name} 지역 도매가: ${adjustedWholesale.toLocaleString()}원/kg`);
            }
        }
        if (retailRevenueEl) {
            retailRevenueEl.textContent = retailRevenue.toLocaleString() + '원';
            if (regionInfo) {
                retailRevenueEl.setAttribute('title', `${regionInfo.name} 지역 소매가: ${adjustedRetail.toLocaleString()}원/kg`);
            }
        }

        // Show predictions if hidden
        if (revenuePredictions) {
            revenuePredictions.classList.remove('hidden');
            revenuePredictions.style.setProperty('display', 'flex', 'important');
            
            // [NEW] 지역 정보 배너 추가
            let regionBanner = document.getElementById('region-info-banner');
            if (!regionBanner) {
                regionBanner = document.createElement('div');
                regionBanner.id = 'region-info-banner';
                regionBanner.style.cssText = `
                    background: linear-gradient(135deg, #1e293b, #334155);
                    color: #e2e8f0;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    font-size: 0.9em;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-left: 4px solid #10b981;
                `;
                revenuePredictions.parentElement.insertBefore(regionBanner, revenuePredictions);
            }
            
            if (regionInfo) {
                regionBanner.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <div>
                        <strong>${regionInfo.name} 지역</strong> 시세 적용 
                        <span style="color: #94a3b8; margin-left: 8px;">${regionInfo.description}</span>
                    </div>
                `;
                regionBanner.style.display = 'flex';
            } else {
                regionBanner.style.display = 'none';
            }
        }
    }

    async function registerToMap() {
        const cropId = marketCropSelect.value;
        const yieldAmount = parseFloat(yieldAmountInput.value) || 0;

        if (yieldAmount <= 0) {
            alert("수확량을 올바르게 입력해주세요.");
            return;
        }

        // [NEW] 1. Check if user has registered farm location
        const user = getCurrentUser();
        if (user && user.farmLocation && Array.isArray(user.farmLocation) && user.farmLocation.length === 2) {
            console.log("✅ 등록된 농장 위치 사용:", user.farmLocation);
            
            registerBtn.disabled = true;
            registerBtn.innerHTML = '<i data-lucide="loader"></i> 조회 중...';
            lucide.createIcons();
            
            // Use registered farm location
            const [lat, lng] = user.farmLocation;
            const regionInfo = getRegionFromCoordinates(lat, lng);
            console.log("🌍 농장 주소 기반 지역:", regionInfo, "주소:", user.farmAddress);
            
            // Calculate revenue with region info
            calculateRevenue(regionInfo);
            
            // Show info notification
            showNotification(
                `📍 등록된 농장 위치 기반 시세\n\n` +
                `농장 주소: ${user.farmAddress || '정보 없음'}\n` +
                `지역: ${regionInfo.name}\n` +
                `${regionInfo.description}`,
                'success'
            );
            
            // If logged in, proceed to map registration
            if (user.uid) {
                proceedToMapRegistration(lat, lng, cropId, yieldAmount, regionInfo);
            } else {
                registerBtn.disabled = false;
                registerBtn.innerHTML = '<i data-lucide="search"></i> 시세 조회';
                lucide.createIcons();
            }
            return;
        }

        // [NEW] 2. Check Geolocation Support (GPS fallback)
        if (!navigator.geolocation) {
            if (confirm("브라우저가 위치 정보를 지원하지 않습니다.\n\n수동으로 지역을 선택하시겠습니까?")) {
                showManualRegionSelector(cropId, yieldAmount);
            } else {
                calculateRevenue(); // Fallback to default pricing
            }
            return;
        }

        // [NEW] 3. Request GPS Location (if no registered location)
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i data-lucide="loader"></i> 위치 확인 중...';
        lucide.createIcons();
        
        // Show instruction tooltip
        showLocationRequestGuide();

        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            console.log("📍 GPS 위치 정보 획득:", { lat, lng });
            
            // [NEW] 지역 판별 및 지역별 시세 계산
            const regionInfo = getRegionFromCoordinates(lat, lng);
            console.log("🌍 GPS 기반 지역 판별:", regionInfo);
            
            // 지역별 시세로 수익 계산
            calculateRevenue(regionInfo);
            
            // Proceed to map registration
            proceedToMapRegistration(lat, lng, cropId, yieldAmount, regionInfo);

            // 3. Get Contact Info (Session -> LocalStorage Fallback)
            let contactNumber = user.contactNumber;
            if (!contactNumber) {
                try {
                    const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
                    const matchedUser = localUsers.find(u => u.email === user.email || u.email === user.userId);
                    if (matchedUser) contactNumber = matchedUser.contactNumber;
                } catch (e) {
                    console.error("Error retrieving contact info:", e);
                }
            }

            // [NEW] 4. 지역 정보 추가
            const farmData = {
                userId: user.uid || user.email,
                userName: user.name || "사용자",
                farmName: user.farmName || "내 스마트팜",
                contact: contactNumber || "연락처 미기재",
                crop: cropId,
                yield: yieldAmount,
                location: [lat, lng],
                region: regionInfo.name, // 지역명 추가
                regionModifier: regionInfo.modifier, // 시세 변동률
                timestamp: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
            };

            try {
                // A. Firestore Save
                if (typeof db !== 'undefined' && db) {
                    // Use .set() to overwrite/update existing user data
                    await db.collection('active_farms').doc(String(farmData.userId)).set(farmData);
                    console.log("✅ Farm registered to Firestore Map");
                }

                // B. LocalStorage Save (Fallback/Offline)
                let localFarms = JSON.parse(localStorage.getItem('active_farms') || '[]');
                // Remove old entry for this user
                localFarms = localFarms.filter(f => f.userId !== farmData.userId);
                localFarms.push(farmData);
                localStorage.setItem('active_farms', JSON.stringify(localFarms));

                // [NEW] Success Message with region info
                console.log("✅ 지도 등록 완료:", farmData);
                
                // Show success notification
                showNotification(
                    `✅ 시세 조회 및 지도 등록 완료!\n\n` +
                    `📍 지역: ${regionInfo.name}\n` +
                    `🌾 작물: ${getCropName(cropId)}\n` +
                    `📦 수확량: ${yieldAmount}kg\n\n` +
                    `관리자 모드에서 확인하실 수 있습니다.`,
                    'success'
                );

            } catch (error) {
                console.error("Map Registration Error:", error);
                // alert("지도 등록 중 오류가 발생했습니다."); // Removed as per instruction
            } finally {
                registerBtn.disabled = false;
                registerBtn.innerHTML = '<i data-lucide="search"></i> 시세 조회';
                lucide.createIcons();
            }

        }, (error) => {
            console.error("Geolocation Error:", error);
            
            // Remove guide if exists
            const guide = document.getElementById('location-guide');
            if (guide) guide.remove();
            
            let errorMsg = "📍 위치 정보를 가져올 수 없습니다\n\n";
            let showManualSelector = false;
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg += "❌ 위치 권한이 거부되었습니다.\n\n";
                    errorMsg += "📌 수동으로 지역을 선택하시겠습니까?";
                    showManualSelector = true;
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg += "위치 정보를 사용할 수 없습니다.\n";
                    errorMsg += "수동으로 지역을 선택하시겠습니까?";
                    showManualSelector = true;
                    break;
                case error.TIMEOUT:
                    errorMsg += "⏱️ 위치 정보 요청 시간이 초과되었습니다.\n";
                    errorMsg += "수동으로 지역을 선택하시겠습니까?";
                    showManualSelector = true;
                    break;
            }
            
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<i data-lucide="search"></i> 시세 조회';
            lucide.createIcons();
            
            if (showManualSelector) {
                if (confirm(errorMsg)) {
                    // Show manual region selector
                    showManualRegionSelector(marketCropSelect.value, parseFloat(yieldAmountInput.value));
                } else {
                    // Use default (national average)
                    calculateRevenue();
                    showNotification(
                        'ℹ️ 전국 평균 시세로 조회되었습니다',
                        'info'
                    );
                }
            } else {
                alert(errorMsg + "\n\n전국 평균 시세로 조회합니다.");
                calculateRevenue();
            }
        }, {
            enableHighAccuracy: true, // GPS 사용
            timeout: 10000, // 10초로 증가
            maximumAge: 300000 // 5분까지 캐시 허용
        });
    }

    // Event listeners
    if (marketCropSelect && yieldAmountInput && registerBtn) {
        // Removed auto-calc listeners

        // Register Button Click
        registerBtn.addEventListener('click', registerToMap);
    }
}

// Greenhouse Data Apply Button
function initGreenhouseDataApply() {
    const applyBtn = document.getElementById('apply-greenhouse-data');
    if (!applyBtn) return;

    applyBtn.addEventListener('click', () => {
        const temp = document.getElementById('greenhouse-temp').value;
        const hum = document.getElementById('greenhouse-hum').value;
        const co2 = document.getElementById('greenhouse-co2').value;
        const light = document.getElementById('greenhouse-light').value;
        const leafTemp = document.getElementById('greenhouse-leaf-temp').value;

        console.log('온실 환경 데이터 적용:', { temp, hum, co2, light, leafTemp });
        alert('온실 환경 데이터가 적용되었습니다.');
    });
}

// Outdoor Data Analysis Toggle
function initOutdoorDataAnalysis() {
    const analysisBtn = document.getElementById('outdoor-data-analysis-btn');
    const chartContainer = document.getElementById('outdoor-chart-container');

    if (analysisBtn && chartContainer) {
        analysisBtn.addEventListener('click', () => {
            chartContainer.classList.toggle('hidden');

            // Update button text based on state
            const isHidden = chartContainer.classList.contains('hidden');
            const btnText = isHidden ? '데이터 분석' : '분석 닫기';
            analysisBtn.innerHTML = `<i data-lucide="bar-chart-2"></i> ${btnText}`;

            // Reinitialize icons after changing innerHTML
            lucide.createIcons();
        });
    }
}

// Authentication Integration
function initAuth() {
    try {
        // Check if user is logged in - use getCurrentUser from auth.js
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

        if (currentUser) {
            // Update user info in sidebar
            const userNameEl = document.getElementById('user-name');
            const userFarmEl = document.getElementById('user-farm');

            if (userNameEl) {
                userNameEl.textContent = currentUser.name;
            }
            if (userFarmEl) {
                userFarmEl.textContent = currentUser.farmName || '내 스마트팜';
            }
        }

        // Add logout button handler
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('로그아웃 하시겠습니까?')) {
                    if (typeof logout === 'function') {
                        logout();
                    } else {
                        // Fallback logout
                        localStorage.removeItem('currentUser');
                        sessionStorage.removeItem('currentUser');
                        window.location.href = 'login.html';
                    }
                }
            });
        }

        // Check admin access and show/hide admin menu
        checkAdminAccess();
    } catch (error) {
        console.error('initAuth error:', error);
        // Continue with other initializations even if auth fails
    }
}

// [Security] Check if current user is admin and show/hide admin menu accordingly
function checkAdminAccess() {
    // Get user from localStorage or sessionStorage
    let user = null;
    try {
        const localData = localStorage.getItem('currentUser');
        const sessionData = sessionStorage.getItem('currentUser');
        const userData = localData || sessionData;
        if (userData) {
            user = JSON.parse(userData);
        }
    } catch (e) {
        console.error('Error parsing user data:', e);
    }

    const isAdmin = user && user.role === 'admin';
    console.log('👤 User role check:', user ? user.role : 'no user', '| isAdmin:', isAdmin);

    // Sidebar admin menu
    const adminSidebar = document.getElementById('admin-nav-item');
    // Mobile bottom nav admin menu
    const adminMobile = document.getElementById('admin-nav-mobile');

    if (isAdmin) {
        console.log('✅ 관리자 계정 확인됨 - 관리자 메뉴 표시');
        if (adminSidebar) {
            adminSidebar.classList.remove('hidden');
            adminSidebar.style.display = 'flex';
        }
        if (adminMobile) {
            adminMobile.classList.remove('hidden');
            adminMobile.style.display = 'flex';
        }
    } else {
        console.log('🔒 일반 사용자 - 관리자 메뉴 숨김');
        if (adminSidebar) {
            adminSidebar.classList.add('hidden');
            adminSidebar.style.display = 'none';
        }
        if (adminMobile) {
            adminMobile.classList.add('hidden');
            adminMobile.style.display = 'none';
        }
    }
}

// Admin Mode - Google Maps Integration
let map;
let markers = [];

// Initialize Leaflet Map (Free Alternative)
function initMap() {
    // This function is called on page load for backward compatibility
    initAdminMap();
}

// Initialize Admin Map with Leaflet
function initAdminMap() {
    const mapElement = document.getElementById('google-map');
    if (!mapElement) return;

    // Check if map already initialized
    if (map) {
        map.invalidateSize();
        return;
    }

    // Default center: Seoul, South Korea
    const defaultCenter = [37.5665, 126.9780];

    // Create Leaflet map
    map = L.map('google-map', {
        center: defaultCenter,
        zoom: 7,
        zoomControl: true
    });

    // [New] Move map to user's location if available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                console.log(`📍 User Location found: ${lat}, ${lng}`);

                // Move map to user location
                map.setView([lat, lng], 10);

                // Optional: Add a special marker for "My Location"
                L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: "#3b82f6",
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map).bindPopup("현재 접속 위치");
            },
            (error) => {
                console.warn("Geolocation access denied or failed.", error);
            }
        );
    }

    // Add dark theme tile layer (CartoDB Dark Matter - Free)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // [New] Load data (Firestore Real-time)
    if (typeof db !== 'undefined' && db) {
        console.log("🌍 Subscribing to active_farms for Admin Map...");
        db.collection('active_farms').onSnapshot((snapshot) => {
            // Clear existing markers
            markers.forEach(m => map.removeLayer(m));
            markers = [];

            let validFarms = [];
            const now = new Date();

            snapshot.forEach((doc) => {
                const data = doc.data();
                // Check Expiry (3 days logic)
                const expiry = new Date(data.expiresAt);
                if (expiry > now) {
                    addFarmMarker(data);
                    validFarms.push(data);
                }
            });

            // Update Sidebar List
            updateFarmList(validFarms);
            console.log(`Updated Map with ${validFarms.length} active farms.`);

        }, (error) => {
            console.error("Firestore Map Error:", error);
            loadFarmData(); // Fallback to local
        });
    } else {
        // LocalStorage Fallback
        loadFarmData();
    }
}

// Get farm data from localStorage
function getFarmData() {
    const data = localStorage.getItem('farmData');
    return data ? JSON.parse(data) : [];
}

// Save farm data to localStorage
function saveFarmDataToStorage(farmData) {
    const allData = getFarmData();
    allData.push(farmData);
    localStorage.setItem('farmData', JSON.stringify(allData));
}

// Clean up old data (older than 3 days)
function cleanupOldData() {
    const allData = getFarmData();
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);

    const validData = allData.filter(item => {
        const itemTime = new Date(item.timestamp).getTime();
        return itemTime > threeDaysAgo;
    });

    localStorage.setItem('farmData', JSON.stringify(validData));
    return validData;
}

// Load farm data and display on map
function loadFarmData() {
    if (!map) return;

    // Clean up old data first
    const farmData = cleanupOldData();

    // Clear existing markers (Leaflet)
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Add markers for each farm
    farmData.forEach(farm => {
        addFarmMarker(farm);
    });

    // Update farm list
    updateFarmList(farmData);
}

// Add farm marker to map (Leaflet)
function addFarmMarker(farmData) {
    if (!map || !farmData.location) return;

    // Handle both Google Maps format {lat, lng} and array format [lat, lng]
    let lat, lng;
    if (Array.isArray(farmData.location)) {
        [lat, lng] = farmData.location;
    } else {
        lat = farmData.location.lat;
        lng = farmData.location.lng;
    }

    // [NEW] 지역별 마커 색상
    const regionColors = {
        '서울/경기': '#3b82f6', // 파랑
        '강원': '#8b5cf6',       // 보라
        '충청': '#10b981',       // 초록
        '전라': '#f59e0b',       // 주황
        '경상': '#ef4444',       // 빨강
        '제주': '#06b6d4',       // 청록
    };
    
    const markerColor = farmData.region ? (regionColors[farmData.region] || '#10b981') : '#10b981';
    
    // Create CircleMarker (similar to Google Maps circle icon)
    const marker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: markerColor,
        fillOpacity: 0.8,
        color: markerColor,
        weight: 2
    }).addTo(map);

    // [NEW] 농장 주소 추가
    const farmAddress = farmData.farmAddress ? `
        <p style="margin:4px 0; color:#3b82f6; border-left: 3px solid #3b82f6; padding-left: 8px; font-size: 0.9em;">
            🏠 <strong>농장 주소:</strong> ${farmData.farmAddress}
        </p>
    ` : '';
    
    // [NEW] 지역 정보 추가
    const regionInfo = farmData.region ? `
        <p style="margin:4px 0; color:#10b981; font-weight: 600;">
            📍 <strong>지역:</strong> ${farmData.region}
            ${farmData.regionModifier ? `(시세 변동률: ${Math.round(farmData.regionModifier * 100)}%)` : ''}
        </p>
    ` : '';
    
    // Create popup content (replaces InfoWindow)
    const popupContent = `
        <div class="map-info-window">
            <h4 style="color:#1e293b; margin:0 0 8px 0;">${farmData.farmName}</h4>
            ${farmAddress}
            ${regionInfo}
            <p style="margin:4px 0; color:#475569;"><strong>작물:</strong> ${getCropName(farmData.crop)}</p>
            <p style="margin:4px 0; color:#475569;"><strong>수확량:</strong> ${farmData.yield} kg</p>
            <p style="margin:4px 0; color:#475569;"><strong>등록자:</strong> ${farmData.userName}</p>
            <p style="margin:4px 0; color:#475569;"><strong>연락처:</strong> ${farmData.contact || '미기재'}</p>
            <p style="margin:4px 0; color:#475569;"><strong>등록일:</strong> ${formatDate(farmData.timestamp)}</p>
        </div>
    `;

    // Bind popup to marker
    marker.bindPopup(popupContent, {
        className: 'farm-popup'
    });

    markers.push(marker);
}

// Update farm list sidebar
function updateFarmList(farmData) {
    const container = document.getElementById('farm-cards-container');
    if (!container) return;

    if (farmData.length === 0) {
        container.innerHTML = '<p class="no-data">등록된 농장이 없습니다.</p>';
        return;
    }

    container.innerHTML = farmData.map(farm => `
        <div class="farm-card">
            <div class="farm-card-header">
                <span class="farm-name">${farm.farmName}</span>
                <span class="farm-time">${getTimeAgo(farm.timestamp)}</span>
            </div>
            ${farm.farmAddress ? `
            <div class="farm-address-badge" style="background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 6px 12px; border-radius: 6px; margin: 8px 0; font-size: 0.85em; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(59, 130, 246, 0.3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span style="font-size: 0.9em;">${farm.farmAddress}</span>
            </div>
            ` : ''}
            ${farm.region ? `
            <div class="farm-region-badge" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 6px 12px; border-radius: 6px; margin: 8px 0; font-size: 0.85em; display: flex; align-items: center; gap: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <strong>${farm.region}</strong>
                ${farm.regionModifier ? `<span style="opacity: 0.8;">(시세 ${Math.round(farm.regionModifier * 100)}%)</span>` : ''}
            </div>
            ` : ''}
            <div class="farm-info">
                <div class="farm-info-item">
                    <i data-lucide="sprout"></i>
                    <span class="farm-info-label">작물:</span>
                    <span class="farm-info-value">${getCropName(farm.crop)}</span>
                </div>
                <div class="farm-info-item">
                    <i data-lucide="package"></i>
                    <span class="farm-info-label">수확량:</span>
                    <span class="farm-info-value">${farm.yield} kg</span>
                </div>
                <div class="farm-info-item">
                    <i data-lucide="user"></i>
                    <span class="farm-info-label">등록자:</span>
                    <span class="farm-info-value">${farm.userName}</span>
                </div>
                <div class="farm-info-item">
                    <i data-lucide="phone"></i>
                    <span class="farm-info-label">연락처:</span>
                    <span class="farm-info-value">${farm.contact || '미기재'}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Reinitialize icons
    lucide.createIcons();
}

// Get crop name in Korean
function getCropName(cropValue) {
    const cropNames = {
        'strawberry': '딸기',
        'tomato': '토마토',
        'lettuce': '상추',
        'cucumber': '오이',
        'paprika': '파프리카',
        'eggplant': '가지',
        'leafy': '엽채류',
        'melon': '멜론'
    };
    return cropNames[cropValue] || cropValue;
}

// [NEW] Show location permission guide
function showLocationRequestGuide() {
    const guide = document.createElement('div');
    guide.id = 'location-guide';
    guide.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 9999;
        max-width: 450px;
        animation: bounce 0.5s ease-out;
        text-align: center;
        font-size: 0.95em;
        line-height: 1.6;
    `;
    guide.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <strong style="font-size: 1.1em;">📍 위치 권한 허용이 필요합니다</strong>
        </div>
        <p style="margin: 0; opacity: 0.95;">브라우저 상단의 팝업에서 <strong>"허용"</strong>을 눌러주세요</p>
        <p style="margin: 8px 0 0 0; font-size: 0.85em; opacity: 0.8;">지역별 정확한 시세를 조회하기 위해 필요합니다</p>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(guide);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.getElementById('location-guide')) {
            guide.remove();
        }
    }, 5000);
}

// [NEW] Proceed to Map Registration (separated logic)
async function proceedToMapRegistration(lat, lng, cropId, yieldAmount, regionInfo) {
    const registerBtn = document.getElementById('register-map-btn');
    
    registerBtn.innerHTML = '<i data-lucide="loader"></i> 등록 중...';
    lucide.createIcons();

    // Get User Info
    const user = getCurrentUser();
    if (!user) {
        // 로그인 없이 시세만 조회하는 경우
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<i data-lucide="search"></i> 시세 조회';
        lucide.createIcons();
        
        console.log("💡 비로그인 사용자 - 시세만 표시");
        
        // 지도 등록 안내
        setTimeout(() => {
            if (confirm("📍 지도에 수확량을 등록하시겠습니까?\n(로그인이 필요합니다)")) {
                window.location.href = 'login.html';
            }
        }, 500);
        return;
    }

    // Get Contact Info (Session -> LocalStorage Fallback)
    let contactNumber = user.contactNumber;
    if (!contactNumber) {
        try {
            const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const matchedUser = localUsers.find(u => u.email === user.email || u.email === user.userId);
            if (matchedUser) contactNumber = matchedUser.contactNumber;
        } catch (e) {
            console.error("Error retrieving contact info:", e);
        }
    }

    // [NEW] 농장 정보 포함
    const farmData = {
        userId: user.uid || user.email,
        userName: user.name || "사용자",
        farmName: user.farmName || "내 스마트팜",
        farmAddress: user.farmAddress || "주소 미등록", // [NEW] 농장 주소
        contact: contactNumber || "연락처 미기재",
        crop: cropId,
        yield: yieldAmount,
        location: [lat, lng],
        region: regionInfo.name, // 지역명 추가
        regionModifier: regionInfo.modifier, // 시세 변동률
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
    };

    try {
        // A. Firestore Save
        if (typeof db !== 'undefined' && db) {
            // Use .set() to overwrite/update existing user data
            await db.collection('active_farms').doc(String(farmData.userId)).set(farmData);
            console.log("✅ Farm registered to Firestore Map");
        }

        // B. LocalStorage Save (Fallback/Offline)
        let localFarms = JSON.parse(localStorage.getItem('active_farms') || '[]');
        // Remove old entry for this user
        localFarms = localFarms.filter(f => f.userId !== farmData.userId);
        localFarms.push(farmData);
        localStorage.setItem('active_farms', JSON.stringify(localFarms));

        // [NEW] Success Message with region info
        console.log("✅ 지도 등록 완료:", farmData);
        
        // Show success notification
        showNotification(
            `✅ 시세 조회 및 지도 등록 완료!\n\n` +
            `📍 위치: ${farmData.farmAddress}\n` +
            `🌍 지역: ${regionInfo.name}\n` +
            `🌾 작물: ${getCropName(cropId)}\n` +
            `📦 수확량: ${yieldAmount}kg\n\n` +
            `관리자 모드에서 확인하실 수 있습니다.`,
            'success'
        );

    } catch (error) {
        console.error("Map Registration Error:", error);
        alert("지도 등록 중 오류가 발생했습니다.");
    } finally {
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<i data-lucide="search"></i> 시세 조회';
        lucide.createIcons();
    }
}

// [NEW] Show manual region selector
function showManualRegionSelector(cropId, yieldAmount) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, #1e293b, #334155);
        border-radius: 20px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        color: white;
    `;
    
    modal.innerHTML = `
        <h3 style="margin: 0 0 20px 0; font-size: 1.5em; display: flex; align-items: center; gap: 10px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            지역을 선택해주세요
        </h3>
        <p style="color: #94a3b8; margin-bottom: 20px;">지역별 시세를 확인하기 위해 농장이 위치한 지역을 선택해주세요.</p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
            <button class="region-btn" data-region="seoul" style="padding: 16px; background: rgba(59, 130, 246, 0.2); border: 2px solid #3b82f6; border-radius: 12px; color: white; cursor: pointer; transition: all 0.2s; font-size: 1em;">
                <div style="font-weight: bold; margin-bottom: 4px;">서울/경기</div>
                <div style="font-size: 0.8em; opacity: 0.8;">가락시장 기준</div>
            </button>
            <button class="region-btn" data-region="gangwon" style="padding: 16px; background: rgba(139, 92, 246, 0.2); border: 2px solid #8b5cf6; border-radius: 12px; color: white; cursor: pointer; transition: all 0.2s; font-size: 1em;">
                <div style="font-weight: bold; margin-bottom: 4px;">강원</div>
                <div style="font-size: 0.8em; opacity: 0.8;">물류비 반영</div>
            </button>
            <button class="region-btn" data-region="chungcheong" style="padding: 16px; background: rgba(16, 185, 129, 0.2); border: 2px solid #10b981; border-radius: 12px; color: white; cursor: pointer; transition: all 0.2s; font-size: 1em;">
                <div style="font-weight: bold; margin-bottom: 4px;">충청</div>
                <div style="font-size: 0.8em; opacity: 0.8;">중부권 평균</div>
            </button>
            <button class="region-btn" data-region="jeolla" style="padding: 16px; background: rgba(245, 158, 11, 0.2); border: 2px solid #f59e0b; border-radius: 12px; color: white; cursor: pointer; transition: all 0.2s; font-size: 1em;">
                <div style="font-weight: bold; margin-bottom: 4px;">전라</div>
                <div style="font-size: 0.8em; opacity: 0.8;">산지 직거래</div>
            </button>
            <button class="region-btn" data-region="gyeongsang" style="padding: 16px; background: rgba(239, 68, 68, 0.2); border: 2px solid #ef4444; border-radius: 12px; color: white; cursor: pointer; transition: all 0.2s; font-size: 1em;">
                <div style="font-weight: bold; margin-bottom: 4px;">경상</div>
                <div style="font-size: 0.8em; opacity: 0.8;">부산/대구 기준</div>
            </button>
            <button class="region-btn" data-region="jeju" style="padding: 16px; background: rgba(6, 182, 212, 0.2); border: 2px solid #06b6d4; border-radius: 12px; color: white; cursor: pointer; transition: all 0.2s; font-size: 1em;">
                <div style="font-weight: bold; margin-bottom: 4px;">제주</div>
                <div style="font-size: 0.8em; opacity: 0.8;">도서지역 운송비</div>
            </button>
        </div>
        
        <button id="cancel-region-select" style="width: 100%; padding: 12px; background: rgba(255,255,255,0.1); border: none; border-radius: 10px; color: white; cursor: pointer; font-size: 0.95em;">
            취소
        </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add hover effects
    const style = document.createElement('style');
    style.textContent = `
        .region-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Event listeners
    modal.querySelectorAll('.region-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const regionKey = btn.getAttribute('data-region');
            const regionInfo = regionalPriceModifiers[regionKey];
            calculateRevenue(regionInfo);
            overlay.remove();
            
            showNotification(
                `✅ ${regionInfo.name} 지역 시세로 조회되었습니다!\n\n${regionInfo.description}`,
                'success'
            );
        });
    });
    
    document.getElementById('cancel-region-select').addEventListener('click', () => {
        overlay.remove();
    });
}

// [NEW] Show notification banner
function showNotification(message, type = 'info') {
    // Simple alert for now (can be replaced with toast notification)
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #2563eb)'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 350px;
        animation: slideIn 0.3s ease-out;
        white-space: pre-line;
        font-size: 0.9em;
        line-height: 1.6;
    `;
    notification.innerHTML = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get time ago
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}일 전`;
    } else if (hours > 0) {
        return `${hours}시간 전`;
    } else {
        return '방금 전';
    }
}

// Update yield calculation to save to admin map
function updateYieldCalculationWithMap() {
    const yieldForm = document.getElementById('yield-form');
    if (!yieldForm) return;

    yieldForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const crop = document.getElementById('yield-crop').value;
        const yieldAmount = parseFloat(document.getElementById('yield-amount').value);

        if (!crop || !yieldAmount) return;

        // Get current user info
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const farmData = {
                        id: Date.now().toString(),
                        farmName: currentUser.farmName || '내 스마트팜',
                        crop: crop,
                        yield: yieldAmount,
                        location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        },
                        timestamp: new Date().toISOString(),
                        userName: currentUser.name
                    };

                    saveFarmDataToStorage(farmData);

                    // If on admin page, reload map
                    if (document.getElementById('admin-page').classList.contains('active')) {
                        loadFarmData();
                    }
                },
                (error) => {
                    // Use default location if geolocation fails
                    const farmData = {
                        id: Date.now().toString(),
                        farmName: currentUser.farmName || '내 스마트팜',
                        crop: crop,
                        yield: yieldAmount,
                        location: {
                            lat: 37.5665 + (Math.random() - 0.5) * 2,
                            lng: 126.9780 + (Math.random() - 0.5) * 2
                        },
                        timestamp: new Date().toISOString(),
                        userName: currentUser.name
                    };

                    saveFarmDataToStorage(farmData);

                    // If on admin page, reload map
                    if (document.getElementById('admin-page').classList.contains('active')) {
                        loadFarmData();
                    }
                }
            );
        }
    });
}

// AI Image Diagnosis Logic
function initAIImageAnalysis() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('crop-image-input');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const previewArea = document.getElementById('image-preview-area');
    const previewImg = document.getElementById('preview-img');
    const removeBtn = document.getElementById('remove-img-btn');
    const controls = document.getElementById('analysis-controls');
    const startBtn = document.getElementById('start-analysis-btn');
    const loadingObj = document.getElementById('analysis-loading');
    const resultObj = document.getElementById('analysis-result');
    const cropTypeSelect = document.getElementById('diagnosis-crop-type');

    if (!dropZone || !fileInput) return;

    // Diagnosis Database (Mock)
    const diagnosisDB = {
        strawberry: [
            { id: 'powdery', name: '흰가루병 (Powdery Mildew)', conf: 98.5, severity: '위험 (High)', desc: '잎과 과실에 흰 가루 형태의 곰팡이가 퍼져 있습니다.', chemicals: '폴리옥신비, 페나리몰, 디페노코나졸', solutions: ['감염된 잎과 과실을 즉시 제거하여 소각하십시오.', '습도를 50-60% 수준으로 낮추고 주간 환기를 강화하세요.', '질소질 비료 과용을 피하고 칼슘제를 엽면 시비하세요.'] }
        ],
        tomato: [
            { id: 'graymold', name: '잿빛곰팡이병 (Gray Mold)', conf: 96.2, severity: '심각 (Critical)', desc: '과실과 잎에 회색 곰팡이 포자가 형성되고 물러지는 증상이 보입니다.', chemicals: '프로사이미돈, 이프로디온, 펜헥사미드', solutions: ['병원균이 포자를 비산하므로 조심스럽게 제거 비닐에 담아 폐기하세요.', '야간 온도를 15도 이상 유지하여 결로를 방지하세요.', '측창 환기를 적극 활용하여 공기 순환을 원활하게 하십시오.'] },
            { id: 'leafmold', name: '잎곰팡이병 (Leaf Mold)', conf: 94.8, severity: '주의 (Moderate)', desc: '잎 뒷면에 쥐색 곰팡이가 피고 잎 앞면은 노랗게 변색되었습니다.', chemicals: '베노밀, 티오파네이트메틸', solutions: ['밀식된 잎을 제거하여 채광과 통풍을 개선하세요.', '90% 이상의 고습 조건이 3시간 이상 지속되지 않도록 관리하세요.'] }
        ],
        paprika: [
            { id: 'blossom', name: '배꼽썩음병 (Blossom End Rot)', conf: 99.1, severity: '생리장해', desc: '과실 하단부가 흑갈색으로 함몰되고 부패했습니다. (칼슘 결핍)', chemicals: '칼슘 킬레이트제 (엽면시비)', solutions: ['토양 수분 부족으로 인한 칼슘 흡수 저해가 주원인입니다. 점적 관 주기와 양을 늘리세요.', '염화칼슘 0.3% 수용액을 엽면 시비하여 응급 처치하십시오.', '근권 EC가 너무 높지 않은지 확인하세요. (2.5 이하 유지 권장)'] }
        ],
        cucumber: [
            { id: 'downy', name: '노균병 (Downy Mildew)', conf: 97.4, severity: '위험 (High)', desc: '잎맥을 경계로 다각형의 노란 반점이 형성되었습니다.', chemicals: '디메토모르프, 사이아조파미드', solutions: ['발병 초기에 적용 약제를 잎 뒷면까지 충분히 살포하세요.', '질소질 비료가 부족하면 발병하기 쉬우므로 추비를 고려하세요.', '습도가 높을 때 전염이 빠르므로 야간 난방을 통해 제습하세요.'] }
        ],
        healthy: { name: '정상 (Healthy)', conf: 99.9, severity: '정상', desc: '병해충 징후가 발견되지 않았으며 생육 상태가 양호합니다.', chemicals: '해당 없음 (예방 위주 관리)', solutions: ['현재의 환경 관리(VPD, 급액) 상태를 유지하세요.', '지속적인 모니터링을 통해 예방적 방제를 수행하십시오.'] }
    };

    // 1. Drag & Drop & Upload Logic
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', handleFileSelect);

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    function handleFileSelect(e) {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadPlaceholder.classList.add('hidden');
            previewArea.classList.remove('hidden');
            previewArea.style.display = 'block';
            controls.classList.remove('hidden');
            resultObj.classList.add('hidden'); // Hide previous result

            // Auto-detect crop suggestion (Simulated)
            // Randomly select crop for UI effect
            // cropTypeSelect.value = 'tomato'; 
        };
        reader.readAsDataURL(file);
    }

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        previewArea.classList.add('hidden');
        previewArea.style.display = 'none';
        uploadPlaceholder.classList.remove('hidden');
        controls.classList.add('hidden');
        resultObj.classList.add('hidden');
        loadingObj.classList.add('hidden');
    });

    // 2. Analysis Logic
    startBtn.addEventListener('click', () => {
        controls.classList.add('hidden');
        loadingObj.classList.remove('hidden');

        let progress = 0;
        const progressBar = document.getElementById('analysis-progress');
        const loadingText = document.getElementById('loading-text');

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress > 100) progress = 100;
            progressBar.style.width = `${progress}%`;

            if (progress > 30 && progress < 60) loadingText.textContent = '객체 검출 및 분할 중...';
            else if (progress > 60 && progress < 90) loadingText.textContent = '병해충 데이터베이스 매칭 중...';
            else if (progress >= 100) loadingText.textContent = '진단 리포트 생성 중...';

            if (progress === 100) {
                clearInterval(interval);
                setTimeout(showResult, 500);
            }
        }, 200);
    });

    function showResult() {
        loadingObj.classList.add('hidden');
        resultObj.classList.remove('hidden');

        const crop = cropTypeSelect.value;
        const db = diagnosisDB[crop] || diagnosisDB.strawberry;

        // Randomly pick result (Healthy or Disease)
        // 70% chance of disease for demo purposes, 30% healthy
        const isHealthy = Math.random() > 0.7;
        let data;

        if (isHealthy) {
            data = diagnosisDB.healthy;
        } else {
            // Pick random disease from array
            data = db[Math.floor(Math.random() * db.length)] || diagnosisDB.healthy;
        }

        // Update UI
        document.getElementById('result-title').textContent = data.name;
        document.getElementById('result-title').style.color = (data.severity === '정상') ? '#10b981' : '#f87171';

        document.getElementById('result-confidence').textContent = `정확도 ${data.conf}%`;
        document.getElementById('result-symptom').textContent = data.desc;
        document.getElementById('result-severity').textContent = data.severity;

        const severityObj = document.getElementById('result-severity');
        if (data.severity.includes('심각') || data.severity.includes('위험')) severityObj.style.color = '#ef4444';
        else if (data.severity === '정상') severityObj.style.color = '#10b981';
        else severityObj.style.color = '#f59e0b'; // Warning

        document.getElementById('result-chemicals').textContent = `추천 약제: ${data.chemicals}`;

        const solList = document.getElementById('result-solutions');
        solList.innerHTML = '';
        data.solutions.forEach(sol => {
            const li = document.createElement('li');
            li.textContent = sol;
            solList.appendChild(li);
        });

        // Scroll to result
        resultObj.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// [Security] Check User Role & UI
function checkUserRoleUI() {
    try {
        const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (!userStr) return;

        const user = JSON.parse(userStr);

        // Update Profile
        const nameEl = document.getElementById('user-name');
        const farmEl = document.getElementById('user-farm');
        if (nameEl) nameEl.textContent = user.name;
        if (farmEl) farmEl.textContent = user.farmName;

        // [Fix] Initialize isPremiumActive for Premium/Admin users
        if (user.role === 'premium' || user.role === 'admin') {
            isPremiumActive = true;
            console.log('💎 Premium session initialized from user role');
        }

        // Check Admin
        // Check Admin
        const adminNav = document.getElementById('admin-nav-item');
        if (adminNav) {
            console.log('User Role:', user.role);
            if (user.role === 'admin') {
                // 관리자면 그냥 둠 (이미 보임)
                console.log('Admin Menu Active');
            } else {
                // 비관리자면 아예 삭제해버림 (가장 확실)
                adminNav.remove();
                // 혹시 모르니 style로도 숨김 (삭제 실패 대비)
                // adminNav.style.display = 'none'; 
            }
        }

        // Premium Badge Logic (Optional, existing code might handle it)
        if (user.role === 'premium' || user.role === 'admin') {
            // Handle premium UI if needed
        }

    } catch (e) {
        console.error('User Role Check Error:', e);
    }
}

// [Hotfix] Global function to force open admin page
window.openAdminPage = function () {
    console.log("Forcing Admin Page Open");
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');

    // 1. Hide all pages - 인라인 스타일 초기화
    pages.forEach(p => {
        p.classList.remove('active');
        p.style.removeProperty('display'); // CSS 규칙이 적용되도록 인라인 제거
    });

    // 2. Deactivate all navs
    navItems.forEach(n => n.classList.remove('active'));

    // 3. Show Admin Page
    const adminPage = document.getElementById('admin-page');
    const adminNav = document.getElementById('admin-nav-item');

    if (adminPage) {
        adminPage.classList.add('active');
        // CSS .page.active { display: block } 규칙 활용
        console.log("Admin Page Active");

        // Init Map
        if (typeof initAdminMap === 'function') {
            setTimeout(initAdminMap, 200);
        }
    } else {
        alert("관리자 페이지를 찾을 수 없습니다.");
    }

    if (adminNav) {
        adminNav.classList.add('active');
    }
};

// [Hotfix] Generic global function to force open any page
window.openPage = function (pageName) {
    console.log("Force Open Page:", pageName);
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');

    // 1. Hide all pages - 인라인 스타일 초기화 후 CSS 클래스로 제어
    pages.forEach(p => {
        p.classList.remove('active');
        p.style.removeProperty('display'); // 인라인 스타일 제거하여 CSS 규칙이 적용되도록
    });

    // 2. Deactivate all navs
    navItems.forEach(n => n.classList.remove('active'));

    // 3. Show Target Page
    const targetId = pageName + '-page';
    const targetPage = document.getElementById(targetId);

    if (targetPage) {
        targetPage.classList.add('active');
        // CSS에서 .page.active { display: block } 처리하므로 인라인 불필요

        // Special Init
        if (pageName === 'admin' && typeof initAdminMap === 'function') {
            setTimeout(initAdminMap, 200);
        }
    } else {
        console.error("Page not found:", targetId);
    }

    // 4. Activate Nav
    const targetNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    if (targetNav) {
        targetNav.classList.add('active');
    }
};

// [Admin Map] Log User Action to Firestore
function logUserActionToMap(crop, actionType) {
    if (typeof db === 'undefined' || !db) {
        console.warn('Firestore not ready for map logging');
        return;
    }

    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    // Generate Random Location near Korea (35~37.5, 126.5~129)
    // Demo purpose: Randomize within 'Korea' range to show on map since HTTP cannot get real location
    const lat = 35 + Math.random() * 2.5;
    const lng = 126.5 + Math.random() * 2.5;

    const data = {
        userId: user.uid || 'user_' + Date.now(),
        userName: user.name || '알 수 없음',
        farmName: user.farmName || '스마트팜',
        crop: crop,
        actionType: actionType, // 'env_input' or 'market_check'
        location: { lat, lng },
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days later
    };

    // Use email as doc ID to prevent duplicate markers for same user
    const docId = user.email || user.uid;

    db.collection('active_farms').doc(docId).set(data)
        .then(() => console.log("Map Update Success:", data))
        .catch(err => console.error("Map Update Error:", err));
}

// Initializing
document.addEventListener('DOMContentLoaded', () => {
    // [Debug] JS 실행 여부 확인
    // alert('앱이 시작되었습니다. 데이터 로딩을 시도합니다.'); // 너무 번거로울 수 있으므로 주석 처리하거나 필요 시 해제

    console.log('App Initializing...');

    // Helper to safely run init functions (supports both sync and async)
    // MUST be defined BEFORE usage (const/arrow functions are not hoisted)
    const safeInit = (fn, name) => {
        try {
            if (typeof fn === 'function') {
                const result = fn();
                // Handle async functions - catch any Promise rejections
                if (result && typeof result.then === 'function') {
                    result.catch(e => {
                        console.error(`[Error] Async init ${name} failed:`, e);
                    });
                }
            }
        } catch (e) {
            console.error(`[Error] Failed to init ${name}:`, e);
        }
    };

    // Auth Check
    safeInit(initAuth, 'initAuth');
    if (typeof checkUserRoleUI === 'function') {
        safeInit(checkUserRoleUI, 'checkUserRoleUI');
    }

    console.log('App Initialized v2 (Robust)');

    // [New] Attach Map Loggers
    const envCropSelect = document.getElementById('select-crop');
    const marketCropSelect = document.getElementById('market-crop-select');

    if (envCropSelect) {
        envCropSelect.addEventListener('change', (e) => {
            logUserActionToMap(e.target.value, 'env_input');
        });
    }
    if (marketCropSelect) {
        marketCropSelect.addEventListener('change', (e) => {
            logUserActionToMap(e.target.value, 'market_check');
        });
    }

    safeInit(initChart, 'initChart');
    safeInit(initNavigation, 'initNavigation');
    safeInit(initToggles, 'initToggles');

    // 비동기 작업은 내부에서 에러 처리됨
    safeInit(initWeather, 'initWeather');
    safeInit(initManualEntry, 'initManualEntry');
    safeInit(initPremium, 'initPremium');
    safeInit(initMarketAnalysis, 'initMarketAnalysis');
    safeInit(initHarvestRegistration, 'initHarvestRegistration');
    safeInit(initGreenhouseDataApply, 'initGreenhouseDataApply');
    safeInit(initOutdoorDataAnalysis, 'initOutdoorDataAnalysis');
    safeInit(initNutrientSelectors, 'initNutrientSelectors');
    safeInit(initNutrientSelectors, 'initNutrientSelectors');
    safeInit(updateYieldCalculationWithMap, 'updateYieldCalculationWithMap');
    safeInit(initAIImageAnalysis, 'initAIImageAnalysis');

    // Initialize admin map when navigating to admin page
    const adminNavItems = document.querySelectorAll('[data-page="admin"]');
    adminNavItems.forEach(item => {
        item.addEventListener('click', () => {
            setTimeout(() => {
                try {
                    if (typeof L !== 'undefined') {
                        initAdminMap();
                    }
                } catch (e) { console.error('Map init error:', e); }
            }, 100);
        });
    });

    // [Critical] Re-check admin access after all initialization
    // This ensures admin menu visibility is correctly set after all DOM operations
    setTimeout(() => {
        checkAdminAccess();
        console.log('🔐 Admin access re-checked after initialization');
    }, 200);

    // [Mobile] Initialize bottom navigation
    initBottomNavigation();
});

// [Mobile] Bottom Navigation Initialization
function initBottomNavigation() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item.nav-item');
    const pages = document.querySelectorAll('.page');

    bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const pageName = item.getAttribute('data-page');
            if (!pageName) return;

            // Update active states
            bottomNavItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Update sidebar nav items for consistency
            document.querySelectorAll('.sidebar .nav-item').forEach(navItem => {
                navItem.classList.remove('active');
                if (navItem.getAttribute('data-page') === pageName) {
                    navItem.classList.add('active');
                }
            });

            // [Fix] Sync isPremiumActive with data-mode for Analysis logic
            const mode = item.getAttribute('data-mode');
            if (mode === 'premium') {
                isPremiumActive = true;
                console.log('💎 Premium Mode Activated via Bottom Nav');
            } else if (mode === 'basic') {
                isPremiumActive = false;
                console.log('🌿 Basic Mode Activated via Bottom Nav');
            }

            // Switch page
            const targetPageId = `${pageName}-page`;
            pages.forEach(p => p.classList.remove('active'));
            const targetPage = document.getElementById(targetPageId);
            if (targetPage) {
                targetPage.classList.add('active');

                // Initialize map if admin page
                if (pageName === 'admin' && typeof L !== 'undefined') {
                    setTimeout(initAdminMap, 100);
                }
            }
        });
    });
}

// ========================================
// 공지사항 관리 시스템 (Notice Management)
// ========================================

function initNoticeSystem() {
    // 대시보드 공지사항 로드 및 표시
    loadAndDisplayNotice();

    // [Auto-Sync] If LocalStorage has notice but maybe Firestore is empty (migration)
    // Runs only if local data exists (Admin context)
    const localNotice = localStorage.getItem('smartfarm_notice');
    if (localNotice && typeof db !== 'undefined' && db) {
        try {
            const noticeObj = JSON.parse(localNotice);
            // Optional: Check if remote exists? Or just overwrite/ensure it's there.
            // We just set it. It's safe because local is the 'master' for the admin.
            db.collection('settings').doc('notice').set(noticeObj, { merge: true })
                .then(() => console.log('✅ Auto-synced local notice to Firestore'))
                .catch(e => console.error('Auto-sync failed:', e));
        } catch (e) { console.error(e); }
    }

    // 관리자 페이지 이벤트 리스너
    const saveBtn = document.getElementById('save-notice-btn');
    const clearBtn = document.getElementById('clear-notice-btn');
    const closeBtn = document.getElementById('close-notice-btn');

    if (saveBtn) {
        saveBtn.addEventListener('click', saveNotice);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearNotice);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', hideNotice);
    }

    // 관리자 페이지 진입 시 현재 공지 로드
    updateAdminNoticeList();
}

const MAX_NOTICES = 3;

function saveNotice() {
    const title = document.getElementById('notice-title')?.value?.trim() || '공지사항';
    const content = document.getElementById('notice-content')?.value?.trim();

    if (!content) {
        alert('공지사항 내용을 입력해주세요.');
        return;
    }

    // Load existing
    let currentData = { items: [] };
    const stored = localStorage.getItem('smartfarm_notice');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (parsed.items && Array.isArray(parsed.items)) {
                currentData = parsed;
            } else if (parsed.content) {
                // Migrate legacy
                currentData.items.push(parsed);
            }
        } catch (e) { }
    }

    if (currentData.items.length >= MAX_NOTICES) {
        alert(`공지사항은 최대 ${MAX_NOTICES}개까지만 등록 가능합니다.\n기존 공지를 삭제 후 등록해주세요.`);
        return;
    }

    const newNotice = {
        title: title,
        content: content,
        createdAt: new Date().toISOString()
    };

    currentData.items.push(newNotice);

    // Save
    localStorage.setItem('smartfarm_notice', JSON.stringify(currentData));
    if (typeof db !== 'undefined' && db) {
        db.collection('settings').doc('notice').set(currentData)
            .then(() => console.log('✅ Notices synced'))
            .catch(e => console.error(e));
    }

    // UI Updates
    updateAdminNoticeList();
    loadAndDisplayNotice();

    // Clear Inputs
    document.getElementById('notice-title').value = '';
    document.getElementById('notice-content').value = '';

    alert('✅ 공지사항이 추가되었습니다!');
}

// [New] Render Admin List with Delete Buttons
function updateAdminNoticeList() {
    const previewEl = document.getElementById('notice-preview-content');
    if (!previewEl) return;

    const stored = localStorage.getItem('smartfarm_notice');
    let items = [];
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            items = parsed.items || (parsed.content ? [parsed] : []);
        } catch (e) { }
    }

    if (items.length === 0) {
        previewEl.textContent = '등록된 공지사항이 없습니다.';
        return;
    }

    previewEl.innerHTML = '';
    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';

    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.style.marginBottom = '10px';
        li.style.padding = '8px';
        li.style.background = 'rgba(255,255,255,0.05)';
        li.style.borderRadius = '6px';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';

        li.innerHTML = `
            <div>
                <strong style="color:var(--accent-color)">[${item.title || '공지'}]</strong>
                <div style="font-size:0.9em; margin-top:4px; white-space:pre-wrap;">${item.content}</div>
            </div>
            <button onclick="deleteNoticeItem(${index})" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:4px;">
                <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
            </button>
        `;
        list.appendChild(li);
    });

    previewEl.appendChild(list);
    lucide.createIcons();
}

// Global scope for onclick
window.deleteNoticeItem = function (index) {
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;

    const stored = localStorage.getItem('smartfarm_notice');
    if (!stored) return;

    let data = JSON.parse(stored);
    let items = data.items || (data.content ? [data] : []);

    items.splice(index, 1);

    // Save back
    const newData = { items: items };
    localStorage.setItem('smartfarm_notice', JSON.stringify(newData));

    // Sync
    if (typeof db !== 'undefined' && db) {
        db.collection('settings').doc('notice').set(newData).catch(e => console.error(e));
    }

    updateAdminNoticeList();
    loadAndDisplayNotice();
};


function clearNotice() {
    if (!confirm('모든 공지사항을 삭제하시겠습니까?')) return;

    localStorage.removeItem('smartfarm_notice');

    // [Sync] Delete from Firestore
    if (typeof db !== 'undefined' && db) {
        db.collection('settings').doc('notice').delete().catch(e => console.error(e));
    }

    updateAdminNoticeList();
    loadAndDisplayNotice(); // Hide it

    alert('모든 공지사항이 삭제되었습니다.');
}

function loadAndDisplayNotice() {
    const noticeEl = document.getElementById('dashboard-notice');
    const bodyEl = document.getElementById('notice-body-content');
    const titleDisplayEl = document.querySelector('.notice-title-display');

    if (!noticeEl || !bodyEl) return;

    const noticeData = localStorage.getItem('smartfarm_notice');

    if (noticeData) {
        try {
            const parsed = JSON.parse(noticeData);
            let items = parsed.items || (parsed.content ? [parsed] : []);

            if (items.length > 0) {
                // Clear and Rebuild
                if (titleDisplayEl) titleDisplayEl.textContent = '공지사항'; // Fixed Header
                bodyEl.innerHTML = ''; // Clear prior content

                items.forEach((item, idx) => {
                    const block = document.createElement('div');
                    block.style.marginBottom = '12px';

                    const h5 = document.createElement('h5');
                    h5.style.cssText = 'margin: 0 0 5px 0; color: var(--accent-color); font-size: 1rem;';
                    h5.textContent = '📢 ' + (item.title || '공지');
                    block.appendChild(h5);

                    const p = document.createElement('p');
                    p.style.cssText = 'margin: 0; white-space: pre-wrap; line-height: 1.5; color: var(--text-main);';
                    p.textContent = item.content;
                    block.appendChild(p);

                    if (idx < items.length - 1) {
                        const hr = document.createElement('hr');
                        hr.style.cssText = 'border:0; border-top:1px solid rgba(255,255,255,0.1); margin: 10px 0;';
                        block.appendChild(hr);
                    }
                    bodyEl.appendChild(block);
                });

                noticeEl.classList.remove('hidden');
            } else {
                noticeEl.classList.add('hidden');
            }
        } catch (e) {
            console.error('공지사항 파싱 오류:', e);
            noticeEl.classList.add('hidden');
        }
    } else {
        noticeEl.classList.add('hidden');
    }

    // [Sync] Fetch from Firestore
    if (typeof db !== 'undefined' && db) {
        db.collection('settings').doc('notice').get().then((doc) => {
            if (doc.exists) {
                const remoteNotice = doc.data();
                // Update Local Storage
                localStorage.setItem('smartfarm_notice', JSON.stringify(remoteNotice));

                // Update UI safely
                if (titleDisplayEl) titleDisplayEl.textContent = remoteNotice.title || '공지사항';
                if (bodyEl) bodyEl.textContent = remoteNotice.content;
                if (noticeEl) noticeEl.classList.remove('hidden');
                console.log('☁️ Remote notice loaded');
            } else {
                // If remote is empty but local exists, maybe we should clear local?
                // For now, respect local if remote is missing (offline mode priority) or we could clear it.
                // Let's clear it to ensure consistency if admin deleted it.
                if (localStorage.getItem('smartfarm_notice')) {
                    // localStorage.removeItem('smartfarm_notice');
                    // noticeEl.classList.add('hidden');
                }
            }
        }).catch(e => console.error('Error fetching remote notice:', e));
    }
}

function hideNotice() {
    const noticeEl = document.getElementById('dashboard-notice');
    if (noticeEl) {
        noticeEl.classList.add('hidden');
    }
}

function loadNoticeToAdminForm() {
    const noticeData = localStorage.getItem('smartfarm_notice');

    if (noticeData) {
        try {
            const notice = JSON.parse(noticeData);
            const titleEl = document.getElementById('notice-title');
            const contentEl = document.getElementById('notice-content');
            const previewEl = document.getElementById('notice-preview-content');

            if (titleEl) titleEl.value = notice.title || '';
            if (contentEl) contentEl.value = notice.content || '';
            if (previewEl) previewEl.textContent = `[${notice.title}]\n${notice.content}`;
        } catch (e) {
            console.error('관리자 폼 공지 로드 오류:', e);
        }
    }
}

// DOMContentLoaded에서 공지 시스템 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNoticeSystem);
} else {
    initNoticeSystem();
}
