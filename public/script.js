// ============ PARTICLES ============
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 3 + 1) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = (Math.random() * 20 + 15) + 's';
        particle.style.animationDelay = (Math.random() * 15) + 's';
        container.appendChild(particle);
    }
}
createParticles();

// ============ STATE ============
let currentServer = 'server1';
let isLoggedIn = false;
let currentUser = null;
let isSending = false;
let currentBroadcastId = null;

// ============ TOAST ============
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.display = 'block';
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastIn 0.3s ease-in reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============ ALERT ============
function showAlert(message, type = 'info', title = '', detail = '') {
    const alert = document.getElementById('alert');
    if (!alert) return;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    const alertIcon = document.getElementById('alertIcon');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertDetail = document.getElementById('alertDetail');
    
    if (alertIcon) alertIcon.textContent = icons[type] || 'ℹ️';
    if (alertTitle) alertTitle.textContent = title || (type === 'success' ? 'Berhasil!' : type === 'error' ? 'Gagal!' : 'Info');
    if (alertMessage) alertMessage.textContent = message;
    if (alertDetail) alertDetail.textContent = detail || '';
    
    alert.className = `alert alert-${type}`;
    alert.style.display = 'flex';
}

function hideAlert() {
    const alert = document.getElementById('alert');
    if (alert) alert.style.display = 'none';
}

// ============ BANNED CHECK ============
async function checkIPStatus() {
    try {
        const res = await fetch('/api/check-ip', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        
        if (data.banned) {
            const overlay = document.getElementById('bannedOverlay');
            const reason = document.getElementById('banReason');
            const time = document.getElementById('banTime');
            
            if (overlay) overlay.style.display = 'flex';
            if (reason) reason.textContent = data.reason || 'Melanggar aturan penggunaan';
            if (time) {
                const until = new Date(data.until);
                time.textContent = `Banned until: ${until.toLocaleString('id-ID')}`;
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking IP status:', error);
        return false;
    }
}

// ============ UI FUNCTIONS ============
function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const mainApp = document.getElementById('mainApp');
    
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (mainApp) mainApp.classList.add('hidden');
}

function showRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const mainApp = document.getElementById('mainApp');
    
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
}

function selectServer(server) {
    currentServer = server;
    document.querySelectorAll('.server-card').forEach(el => {
        el.classList.toggle('active', el.dataset.server === server);
    });
    
    const linkGroup = document.getElementById('linkGroup');
    const verifyBtn = document.getElementById('verifyBtn');
    const actionBtn = document.getElementById('actionBtn');
    
    if (linkGroup) linkGroup.classList.add('hidden');
    if (verifyBtn) verifyBtn.classList.add('hidden');
    if (actionBtn) {
        actionBtn.innerHTML = '<span class="btn-content">📨 Send Magic Link</span>';
        actionBtn.disabled = false;
    }
    
    hideAlert();
    checkBuyLimitVisibility();
}

// ============ BUY LIMIT ============
function checkBuyLimitVisibility() {
    const s1Used = parseInt(document.getElementById('limitS1Used')?.textContent || '0');
    const s1Total = parseInt(document.getElementById('limitS1Total')?.textContent || '0');
    const s2Used = parseInt(document.getElementById('limitS2Used')?.textContent || '0');
    const s2Total = parseInt(document.getElementById('limitS2Total')?.textContent || '0');
    
    const s1Full = s1Used >= s1Total && s1Total !== 999;
    const s2Full = s2Used >= s2Total && s2Total !== 999;
    
    const s1Online = document.getElementById('statusTextServer1')?.textContent === 'Online';
    const s2Online = document.getElementById('statusTextServer2')?.textContent === 'Online';
    
    const showBuy = (s1Full || !s1Online) && (s2Full || !s2Online);
    
    const buyLimit = document.getElementById('buyLimit');
    if (buyLimit) {
        buyLimit.style.display = showBuy ? 'block' : 'none';
    }
}

// ============ AUTH ============
async function login() {
    const banned = await checkIPStatus();
    if (banned) return;
    
    const username = document.getElementById('loginUsername')?.value?.trim() || '';
    const password = document.getElementById('loginPassword')?.value?.trim() || '';

    if (!username || !password) {
        showToast('❌ Isi username dan password!', 'error');
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.banned) {
            const overlay = document.getElementById('bannedOverlay');
            const reason = document.getElementById('banReason');
            const time = document.getElementById('banTime');
            
            if (overlay) overlay.style.display = 'flex';
            if (reason) reason.textContent = data.reason || 'Melanggar aturan penggunaan';
            if (time) {
                const until = new Date(data.until);
                time.textContent = `Banned until: ${until.toLocaleString('id-ID')}`;
            }
            showToast('🚫 Kamu telah di banned!', 'error');
            return;
        }

        if (data.success) {
            showToast('✅ Login berhasil! Selamat datang ' + username, 'success');
            currentUser = { username, role: data.role };
            isLoggedIn = true;
            
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            const mainApp = document.getElementById('mainApp');
            const avatar = document.getElementById('userAvatar');
            
            if (loginForm) loginForm.classList.add('hidden');
            if (registerForm) registerForm.classList.add('hidden');
            if (mainApp) mainApp.classList.remove('hidden');
            if (avatar) avatar.textContent = username.charAt(0).toUpperCase();
            
            const ownerPanel = document.getElementById('ownerPanel');
            if (data.role === 'owner') {
                if (ownerPanel) ownerPanel.style.display = 'block';
                loadUserList();
            } else {
                if (ownerPanel) ownerPanel.style.display = 'none';
            }
            
            loadUserData();
        } else {
            showToast(data.message || '❌ Login gagal!', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('❌ Terjadi kesalahan: ' + error.message, 'error');
    }
}

async function register() {
    const banned = await checkIPStatus();
    if (banned) return;
    
    const username = document.getElementById('registerUsername')?.value?.trim() || '';
    const password = document.getElementById('registerPassword')?.value?.trim() || '';

    if (!username || !password) {
        showToast('❌ Isi username dan password!', 'error');
        return;
    }

    if (username.length < 3) {
        showToast('❌ Username minimal 3 karakter', 'error');
        return;
    }

    if (password.length < 3) {
        showToast('❌ Password minimal 3 karakter', 'error');
        return;
    }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.banned) {
            const overlay = document.getElementById('bannedOverlay');
            const reason = document.getElementById('banReason');
            const time = document.getElementById('banTime');
            
            if (overlay) overlay.style.display = 'flex';
            if (reason) reason.textContent = data.reason || 'Melanggar aturan penggunaan';
            if (time) {
                const until = new Date(data.until);
                time.textContent = `Banned until: ${until.toLocaleString('id-ID')}`;
            }
            showToast('🚫 Kamu telah di banned!', 'error');
            return;
        }

        if (data.success) {
            showToast('✅ Registrasi berhasil! Silakan login.', 'success');
            showLogin();
            const loginUsername = document.getElementById('loginUsername');
            if (loginUsername) loginUsername.value = username;
        } else {
            showToast(data.message || '❌ Registrasi gagal!', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showToast('❌ Terjadi kesalahan: ' + error.message, 'error');
    }
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        isLoggedIn = false;
        currentUser = null;
        
        const mainApp = document.getElementById('mainApp');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const ownerPanel = document.getElementById('ownerPanel');
        const loginUsername = document.getElementById('loginUsername');
        const loginPassword = document.getElementById('loginPassword');
        
        if (mainApp) mainApp.classList.add('hidden');
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        if (ownerPanel) ownerPanel.style.display = 'none';
        if (loginUsername) loginUsername.value = '';
        if (loginPassword) loginPassword.value = '';
        
        showToast('👋 Logout berhasil', 'info');
    } catch (error) {
        showToast('❌ Terjadi kesalahan', 'error');
    }
}

// ============ LOAD USER DATA ============
async function loadUserData() {
    try {
        const res = await fetch('/api/user');
        const data = await res.json();
        
        if (data.success) {
            const user = data.user;
            const displayUsername = document.getElementById('displayUsername');
            const displayRole = document.getElementById('displayRole');
            
            if (displayUsername) displayUsername.textContent = user.username;
            if (displayRole) {
                displayRole.textContent = user.role;
                displayRole.className = 'role-badge role-' + user.role;
            }
            
            const s1Total = user.limits?.server1 || 0;
            const s2Total = user.limits?.server2 || 0;
            const s1Used = user.used?.server1 || 0;
            const s2Used = user.used?.server2 || 0;
            
            const limitS1Total = document.getElementById('limitS1Total');
            const limitS2Total = document.getElementById('limitS2Total');
            const limitS1Used = document.getElementById('limitS1Used');
            const limitS2Used = document.getElementById('limitS2Used');
            
            if (limitS1Total) limitS1Total.textContent = s1Total;
            if (limitS2Total) limitS2Total.textContent = s2Total;
            if (limitS1Used) limitS1Used.textContent = s1Used;
            if (limitS2Used) limitS2Used.textContent = s2Used;
            
            if (data.serverStatus) {
                updateServerUI('server1', data.serverStatus.server1);
                updateServerUI('server2', data.serverStatus.server2);
            }
            
            if (data.limitStatus) {
                const ls = data.limitStatus;
                const statusS1 = document.getElementById('statusS1');
                const statusS2 = document.getElementById('statusS2');
                
                if (statusS1) {
                    if (ls.s1Full) {
                        statusS1.textContent = ls.s1Off ? '⚠️ Offline' : '⚠️ Habis';
                        statusS1.className = 'limit-status ' + (ls.s1Off ? 'status-offline' : 'status-full');
                    } else {
                        statusS1.textContent = '✅ Tersedia';
                        statusS1.className = 'limit-status status-available';
                    }
                }
                if (statusS2) {
                    if (ls.s2Full) {
                        statusS2.textContent = ls.s2Off ? '⚠️ Offline' : '⚠️ Habis';
                        statusS2.className = 'limit-status ' + (ls.s2Off ? 'status-offline' : 'status-full');
                    } else {
                        statusS2.textContent = '✅ Tersedia';
                        statusS2.className = 'limit-status status-available';
                    }
                }
                checkBuyLimitVisibility();
            }
            
            if (data.broadcasts && data.broadcasts.length > 0) {
                data.broadcasts.forEach(b => {
                    showBroadcast(b.message, b.createdAt, b.id);
                });
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// ============ BROADCAST ============
function showBroadcast(message, time, id) {
    const broadcastMessage = document.getElementById('broadcastMessage');
    const broadcastTime = document.getElementById('broadcastTime');
    const broadcastPopup = document.getElementById('broadcastPopup');
    const broadcastOverlay = document.getElementById('broadcastOverlay');
    
    if (broadcastMessage) broadcastMessage.textContent = message;
    if (broadcastTime) broadcastTime.textContent = '📅 ' + new Date(time).toLocaleString('id-ID');
    
    currentBroadcastId = id;
    if (broadcastPopup) broadcastPopup.style.display = 'block';
    if (broadcastOverlay) broadcastOverlay.style.display = 'block';
}

async function closeBroadcast() {
    const broadcastPopup = document.getElementById('broadcastPopup');
    const broadcastOverlay = document.getElementById('broadcastOverlay');
    
    if (broadcastPopup) broadcastPopup.style.display = 'none';
    if (broadcastOverlay) broadcastOverlay.style.display = 'none';
    
    if (currentBroadcastId) {
        try {
            await fetch('/api/broadcast/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ broadcastId: currentBroadcastId })
            });
        } catch (error) {
            console.error('Error marking broadcast as read:', error);
        }
        currentBroadcastId = null;
    }
}

// ============ UPDATE SERVER UI ============
function updateServerUI(server, status) {
    const serverNum = server.charAt(0).toUpperCase() + server.slice(1);
    const text = document.getElementById(`statusText${serverNum}`);
    const card = document.querySelector(`.server-card[data-server="${server}"]`);
    
    if (text) {
        text.textContent = status ? 'Online' : 'Offline';
        const dot = text.previousElementSibling;
        if (dot) {
            dot.className = 'status-dot ' + (status ? 'online' : 'offline');
        }
    }
    
    if (card) {
        if (!status) {
            card.classList.add('disabled');
            const badge = card.querySelector('.server-badge');
            if (badge) {
                badge.textContent = 'Offline';
                badge.className = 'server-badge inactive-badge';
            }
        } else {
            card.classList.remove('disabled');
            const badge = card.querySelector('.server-badge');
            if (badge) {
                badge.textContent = server === 'server1' ? 'Active' : 'Beta';
                badge.className = 'server-badge ' + (server === 'server1' ? 'active-badge' : 'beta-badge');
            }
        }
    }
    checkBuyLimitVisibility();
}

// ============ MAGIC LINK ============
async function sendMagicLink() {
    if (isSending) return;
    
    const email = document.getElementById('targetEmail')?.value?.trim() || '';
    if (!email) {
        showToast('❌ Masukkan email target!', 'error');
        return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        showToast('❌ Email tidak valid!', 'error');
        return;
    }
    
    const s1Used = parseInt(document.getElementById('limitS1Used')?.textContent || '0');
    const s1Total = parseInt(document.getElementById('limitS1Total')?.textContent || '0');
    const s2Used = parseInt(document.getElementById('limitS2Used')?.textContent || '0');
    const s2Total = parseInt(document.getElementById('limitS2Total')?.textContent || '0');
    
    const s1Online = document.getElementById('statusTextServer1')?.textContent === 'Online';
    const s2Online = document.getElementById('statusTextServer2')?.textContent === 'Online';
    
    if (currentServer === 'server1' && (!s1Online || s1Used >= s1Total && s1Total !== 999)) {
        showToast('⚠️ Server 1 tidak tersedia!', 'error');
        checkBuyLimitVisibility();
        return;
    }
    
    if (currentServer === 'server2' && (!s2Online || s2Used >= s2Total && s2Total !== 999)) {
        showToast('⚠️ Server 2 tidak tersedia!', 'error');
        checkBuyLimitVisibility();
        return;
    }
    
    isSending = true;
    const btn = document.getElementById('actionBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Sending Magic Link...';
    }
    hideAlert();
    
    try {
        const res = await fetch('/api/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ server: currentServer, email })
        });
        const data = await res.json();
        
        if (data.success) {
            showAlert(
                data.message || '✅ Magic link berhasil dikirim!',
                'success',
                '🎉 Magic Link Sent!',
                '📨 Check your email inbox or spam folder.'
            );
            
            const linkGroup = document.getElementById('linkGroup');
            const verifyBtn = document.getElementById('verifyBtn');
            
            if (linkGroup) linkGroup.classList.remove('hidden');
            if (verifyBtn) verifyBtn.classList.remove('hidden');
            
            if (btn) {
                btn.innerHTML = '<span class="btn-content">📨 Resend</span>';
                btn.disabled = true;
                btn.style.opacity = '0.5';
            }
            isSending = false;
            loadUserData();
            showToast('✅ Magic link berhasil dikirim!', 'success');
        } else {
            if (data.limitReached) {
                showAlert(
                    data.message || '⚠️ Limit Habis!',
                    'error',
                    '⚠️ Limit Exhausted!',
                    '💎 Contact admin for limit purchase'
                );
                checkBuyLimitVisibility();
            } else {
                showAlert(
                    data.message || '❌ Failed to send magic link',
                    'error',
                    '❌ Failed',
                    'Please try again or use another server.'
                );
                if (data.limitReset) {
                    showToast('🔄 Limit reset, try again!', 'info');
                    loadUserData();
                }
            }
            if (btn) {
                btn.innerHTML = '<span class="btn-content">📨 Send Magic Link</span>';
                btn.disabled = false;
                btn.style.opacity = '1';
            }
            isSending = false;
        }
    } catch (error) {
        console.error('Send error:', error);
        showAlert(
            '❌ Error: ' + error.message,
            'error',
            '⚠️ Error',
            'Please try again or contact admin.'
        );
        if (btn) {
            btn.innerHTML = '<span class="btn-content">📨 Send Magic Link</span>';
            btn.disabled = false;
            btn.style.opacity = '1';
        }
        isSending = false;
    }
}

async function verifyMagicLink() {
    const link = document.getElementById('magicLink')?.value?.trim() || '';
    if (!link) {
        showToast('❌ Masukkan magic link!', 'error');
        return;
    }
    
    if (!link.startsWith('http')) {
        showToast('❌ Link tidak valid!', 'error');
        return;
    }
    
    const btn = document.getElementById('verifyBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Verifying...';
    }
    hideAlert();
    
    try {
        const res = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: link })
        });
        const data = await res.json();
        
        if (data.success) {
            showAlert(
                data.message || '🎉 Verifikasi berhasil!',
                'success',
                '🎉 Premium Account Active!',
                '✅ Your Alight Motion account is now premium!'
            );
            showToast('🎉 Verifikasi berhasil! Akun premium aktif!', 'success');
            
            const linkGroup = document.getElementById('linkGroup');
            const verifyBtn = document.getElementById('verifyBtn');
            const actionBtn = document.getElementById('actionBtn');
            
            if (linkGroup) linkGroup.classList.add('hidden');
            if (verifyBtn) verifyBtn.classList.add('hidden');
            if (actionBtn) {
                actionBtn.innerHTML = '<span class="btn-content">📨 Send Magic Link</span>';
                actionBtn.disabled = false;
                actionBtn.style.opacity = '1';
            }
            loadUserData();
        } else {
            showAlert(
                data.message || '❌ Verification Failed',
                'error',
                '❌ Failed',
                'Please make sure the link is correct and still valid.'
            );
            if (data.limitReset) {
                showToast('🔄 Limit reset, try again!', 'info');
                loadUserData();
            }
        }
    } catch (error) {
        console.error('Verify error:', error);
        showAlert('❌ Error: ' + error.message, 'error');
    }
    
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-content">✅ Verify Link</span>';
    }
}

// ============ OWNER FUNCTIONS ============
async function loadUserList() {
    try {
        const res = await fetch('/api/owner/users');
        const data = await res.json();
        
        if (data.success) {
            if (data.serverStatus) {
                updateServerUI('server1', data.serverStatus.server1);
                updateServerUI('server2', data.serverStatus.server2);
                
                const t1 = document.getElementById('toggleServer1');
                const t2 = document.getElementById('toggleServer2');
                const ts1 = document.getElementById('toggleStatus1');
                const ts2 = document.getElementById('toggleStatus2');
                
                if (t1) t1.className = 'toggle-btn ' + (data.serverStatus.server1 ? 'active' : 'inactive');
                if (t2) t2.className = 'toggle-btn ' + (data.serverStatus.server2 ? 'active' : 'inactive');
                if (ts1) ts1.textContent = data.serverStatus.server1 ? 'ON' : 'OFF';
                if (ts2) ts2.textContent = data.serverStatus.server2 ? 'ON' : 'OFF';
            }
            
            // Banned IPs
            const bannedContainer = document.getElementById('bannedItems');
            if (bannedContainer) {
                if (data.bannedIPs && data.bannedIPs.length > 0) {
                    bannedContainer.innerHTML = '';
                    data.bannedIPs.forEach(b => {
                        const div = document.createElement('div');
                        div.className = 'banned-item';
                        const until = new Date(b.bannedUntil);
                        div.innerHTML = `
                            <span class="ip">🔒 ${b.ip}</span>
                            <span class="reason">${b.reason}</span>
                            <span class="time">until ${until.toLocaleString('id-ID')}</span>
                            <button class="btn btn-sm btn-cyan" onclick="unbanIP('${b.ip}')" style="padding:2px 10px;font-size:9px;">Unban</button>
                        `;
                        bannedContainer.appendChild(div);
                    });
                } else {
                    bannedContainer.innerHTML = '<p class="empty-text">No banned IPs</p>';
                }
            }
            
            // Users
            const container = document.getElementById('userList');
            if (container) {
                container.innerHTML = '';
                
                if (data.users.length === 0) {
                    container.innerHTML = '<p class="empty-text">No users</p>';
                } else {
                    data.users.forEach(user => {
                        const div = document.createElement('div');
                        div.className = 'user-item';
                        const isOwner = user.role === 'owner';
                        div.innerHTML = `
                            <div class="user-header">
                                <span class="user-name">${isOwner ? '👑 ' : ''}${user.username}</span>
                                <span class="user-role-badge" style="background:${isOwner ? 'rgba(255,0,0,0.12)' : 'rgba(0,255,255,0.12)'};color:${isOwner ? '#ff6b6b' : '#00ffff'};">
                                    ${isOwner ? 'OWNER' : 'USER'}
                                </span>
                            </div>
                            <div class="user-limits">
                                <span>🖥️ S1: <span class="used">${user.used?.server1 || 0}</span>/<span>${user.limits?.server1 || 0}</span></span>
                                <span>🌐 S2: <span class="used">${user.used?.server2 || 0}</span>/<span>${user.limits?.server2 || 0}</span></span>
                            </div>
                            ${!isOwner ? `
                            <div class="user-actions">
                                <input type="number" id="limit_${user.username}_server1" value="${user.limits?.server1 || 0}" min="0" max="999">
                                <button class="btn btn-sm btn-cyan" onclick="updateLimit('${user.username}','server1')">S1</button>
                                <input type="number" id="limit_${user.username}_server2" value="${user.limits?.server2 || 0}" min="0" max="999">
                                <button class="btn btn-sm btn-cyan" onclick="updateLimit('${user.username}','server2')">S2</button>
                                <button class="btn btn-sm btn-success" onclick="resetLimitUser('${user.username}','server1')">R1</button>
                                <button class="btn btn-sm btn-success" onclick="resetLimitUser('${user.username}','server2')">R2</button>
                                <button class="btn btn-sm" style="background:rgba(255,0,0,0.1);color:#ff6b6b;border:1px solid rgba(255,0,0,0.1);" onclick="deleteUser('${user.username}')">🗑️</button>
                            </div>
                            ` : ''}
                        `;
                        container.appendChild(div);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading user list:', error);
    }
}

async function unbanIP(ip) {
    if (!confirm(`Unban IP ${ip}?`)) return;
    
    try {
        const res = await fetch('/api/owner/unban-ip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip })
        });
        const data = await res.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadUserList();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('❌ Error', 'error');
    }
}

async function updateLimit(username, server) {
    const input = document.getElementById(`limit_${username}_${server}`);
    if (!input) return;
    
    const limit = parseInt(input.value);
    
    if (isNaN(limit) || limit < 0) {
        showToast('❌ Limit tidak valid!', 'error');
        return;
    }
    
    try {
        const res = await fetch('/api/owner/update-limit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, server, limit })
        });
        const data = await res.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadUserList();
            loadUserData();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('❌ Error', 'error');
    }
}

async function resetLimitUser(username, server) {
    try {
        const res = await fetch('/api/owner/reset-limit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, server })
        });
        const data = await res.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadUserList();
            loadUserData();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('❌ Error', 'error');
    }
}

async function deleteUser(username) {
    if (!confirm(`⚠️ Delete user ${username}?`)) return;
    
    try {
        const res = await fetch('/api/owner/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const data = await res.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadUserList();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('❌ Error', 'error');
    }
}

async function toggleServer(server) {
    try {
        const res = await fetch('/api/owner/toggle-server', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ server })
        });
        const data = await res.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadUserList();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('❌ Error', 'error');
    }
}

async function sendBroadcast() {
    const message = document.getElementById('broadcastInput')?.value?.trim() || '';
    if (!message) {
        showToast('❌ Pesan tidak boleh kosong!', 'error');
        return;
    }
    
    try {
        const res = await fetch('/api/owner/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await res.json();
        
        if (data.success) {
            showToast('✅ Broadcast terkirim ke semua user!', 'success');
            const input = document.getElementById('broadcastInput');
            if (input) input.value = '';
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('❌ Error', 'error');
    }
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const mainApp = document.getElementById('mainApp');
        const linkGroup = document.getElementById('linkGroup');
        const actionBtn = document.getElementById('actionBtn');
        
        if (loginForm && !loginForm.classList.contains('hidden')) {
            login();
        } else if (registerForm && !registerForm.classList.contains('hidden')) {
            register();
        } else if (mainApp && !mainApp.classList.contains('hidden')) {
            if (linkGroup && linkGroup.classList.contains('hidden')) {
                if (actionBtn && !actionBtn.disabled) {
                    sendMagicLink();
                }
            } else {
                verifyMagicLink();
            }
        }
    }
});

// ============ AUTO LOGIN CHECK ============
async function checkSession() {
    const banned = await checkIPStatus();
    if (banned) return;
    
    try {
        const res = await fetch('/api/user');
        const data = await res.json();
        
        if (data.success) {
            currentUser = { username: data.user.username, role: data.user.role };
            isLoggedIn = true;
            
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            const mainApp = document.getElementById('mainApp');
            const avatar = document.getElementById('userAvatar');
            
            if (loginForm) loginForm.classList.add('hidden');
            if (registerForm) registerForm.classList.add('hidden');
            if (mainApp) mainApp.classList.remove('hidden');
            if (avatar) avatar.textContent = data.user.username.charAt(0).toUpperCase();
            
            const ownerPanel = document.getElementById('ownerPanel');
            if (data.user.role === 'owner') {
                if (ownerPanel) ownerPanel.style.display = 'block';
                loadUserList();
            } else {
                if (ownerPanel) ownerPanel.style.display = 'none';
            }
            
            loadUserData();
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

console.log('═══════════════════════════════════════════');
console.log('  ⚡ XKelzz AM Generator v3.0');
console.log('  Alight Motion Magic Link Tools');
console.log('═══════════════════════════════════════════');
console.log('  👑 Owner: KELL / 9089');
console.log('  📱 Telegram: @kfcaja2');
console.log('  💬 WhatsApp: 6288970390752');
console.log('  🛡️ Anti-Spam: Active');
console.log('═══════════════════════════════════════════');