const DEFAULT_PROMPT = `You are "Warrior Bot", an elite clinical wellness and ergonomics expert specializing in workplace mobility.
Your primary objective is to recommend 2-3 specific exercises from the provided library that DIRECTLY address the user's specific physical problem or goal.

STRICT RELEVANCE RULES:
1.  **Direct Connection**: Every recommended exercise must have a clear, mechanical link to the user's symptoms (e.g., if wrists hurt, recommend forearm stretches).
2.  **Explicit Justification**: In the "coach_message", you MUST explicitly explain WHY these exercises help their specific issue (e.g., "Since your lower back is tight from sitting, we'll focus on hip openers to release the anterior chain...").
3.  **Comprehensive Context**: If the user mentions a group or a specific work context (e.g., "coding for 8 hours"), tailor the tone and advice to that professional environment.

STRICT JSON OUTPUT FORMAT:
You must output ONLY valid JSON. No markdown formatting.
Structure:
{
  "coach_message": "A professional yet warm 2-3 sentence justification linking the user's problem to the recommended protocol.",
  "protocol_name": "A descriptive name (e.g., 'Carpal Tunnel Shield Protocol')",
  "exercises": [
    { 
      "id": "id-from-list", 
      "focus_tip": "One vital cue (e.g., 'Rotate thumbs out')." 
    }
  ]
}

Available Exercises:
\${JSON.stringify(EXERCISES.map(e => ({id: e.id, title: e.title, benefit: e.benefit})))}

CRITICAL:
- NEVER hallucinate exercise IDs.
- Ensure the connection feels clinical and expert, not generic.
`;

class WellnessApp {
    constructor() {
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        this.model = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';
        this.systemPrompt = localStorage.getItem('system_prompt') || DEFAULT_PROMPT;

        this.currentUser = JSON.parse(localStorage.getItem('current_warrior_user')) ||
            JSON.parse(sessionStorage.getItem('current_warrior_user')) || null;
        this.history = JSON.parse(localStorage.getItem('warrior_history_' + (this.currentUser?.email || 'anon'))) || [];
        this.isSignup = false;


        this.initElements();
        this.initEventListeners();
        this.loadSettings();
        this.updateAuthUI();
        this.initGroups();
        this.checkForSocialNotifications();
        this.initFullscreenPersistence();
        this.initRevealOnScroll();
        this.checkForInviteLink();

        // Auto-optimize model on load
        this.optimizeModelSelection();
        this.syncBottomNav();
    }

    checkForInviteLink() {
        if (!window.location.search) return;

        const urlParams = new URLSearchParams(window.location.search);
        const joinCode = urlParams.get('join');

        if (joinCode) {
            // If logged in, auto-join
            if (this.currentUser) {
                const users = JSON.parse(localStorage.getItem('warrior_users')) || {};

                // Only join if not already in a group or in a different one
                const currentCode = users[this.currentUser.email]?.groupCode;

                if (currentCode !== joinCode) {
                    if (confirm(`Do you want to join the group "${joinCode}"?`)) {
                        users[this.currentUser.email].groupCode = joinCode;
                        localStorage.setItem('warrior_users', JSON.stringify(users));
                        // Clear param to clean URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                        this.showToast('You have successfully joined the group!', 4000);
                        this.initGroups();
                    }
                }
            } else {
                // If not logged in, switch to login view and pre-fill code logic if we had a dedicated join flow
                // For now, simpler: alert user to login first
                sessionStorage.setItem('pending_join_code', joinCode);
                this.systemPrompt = `You are "Warrior Bot", an elite, empathetic wellness coach. 
        Your Style: Professional, clinical but warm, concise, and action-oriented.
        Your Output Format: Strictly JSON.
        {
            "coach_message": "Brief intro.",
            "protocol_name": "Routine Name",
            "exercises": [ { "id": "ex-id", "focus_tip": "Tip" } ]
        }
        
        Available Exercises:
        ${EXERCISES.map(e => `- ${e.id}: ${e.title}`).join('\n')}
        `;
                // We'll let them login normally, then check pending code
                // Or we can pre-open auth modal
                this.toggleAuthModal(true);
                // Optionally show a message in the modal
                this.authSubtitle.innerText = `Login to join group ${joinCode}`;
            }
        }
    }

    initElements() {
        this.feelingInput = document.getElementById('feeling-input');
        this.getBtn = document.getElementById('get-recommendation');
        this.resultSection = document.getElementById('result-section');
        this.geminiResponse = document.getElementById('gemini-response');
        this.exerciseList = document.getElementById('exercise-list');
        this.settingsToggle = document.getElementById('settings-toggle');
        this.settingsPanel = document.getElementById('settings-panel');
        this.closeSettings = document.getElementById('close-settings');
        this.saveSettingsBtn = document.getElementById('save-settings');
        this.apiKeyInput = document.getElementById('api-key');
        this.modelInput = document.getElementById('gemini-model');
        this.systemPromptInput = document.getElementById('system-prompt');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.checkModelsBtn = document.getElementById('check-models');
        this.modelDebug = document.getElementById('model-list-debug');

        // Auth Elements
        this.loginNavBtn = document.getElementById('login-nav-btn');
        this.userInfo = document.getElementById('user-info');
        this.userDisplay = document.getElementById('user-display');
        this.logoutBtn = document.getElementById('logout-btn');
        this.authModal = document.getElementById('auth-modal');
        this.closeAuth = document.getElementById('close-auth');
        this.authForm = document.getElementById('auth-form');
        this.authEmail = document.getElementById('auth-email');
        this.authPassword = document.getElementById('auth-password');
        this.authSubmit = document.getElementById('auth-submit');
        this.authTitle = document.getElementById('auth-title');
        this.authSubtitle = document.getElementById('auth-subtitle');
        this.toggleAuth = document.getElementById('toggle-auth');
        this.toggleText = document.getElementById('toggle-text');
        this.authRoleGroup = document.getElementById('auth-role-group');
        this.authRoleSelect = document.getElementById('auth-role');

        this.authRemember = document.getElementById('auth-remember');
        this.forgotPasswordBtn = document.getElementById('forgot-password-btn');
        this.resetView = document.getElementById('reset-view');
        this.loginView = document.getElementById('login-view');
        this.backToLoginBtn = document.getElementById('back-to-login');
        this.confirmResetBtn = document.getElementById('confirm-reset');
        this.resetEmailInput = document.getElementById('reset-email');
        this.newPasswordInput = document.getElementById('new-password');

        // Group Elements

        this.loggedOutGroups = document.getElementById('logged-out-groups');
        this.loggedInGroups = document.getElementById('logged-in-groups');
        this.joinGroupView = document.getElementById('join-group-view');
        this.groupDashboardView = document.getElementById('group-dashboard-view');
        this.groupCodeInput = document.getElementById('group-code-input');
        this.joinGroupBtn = document.getElementById('join-group-btn');
        this.leaveGroupBtn = document.getElementById('leave-group-btn');
        this.displayGroupCode = document.getElementById('display-group-code');
        this.displayGroupName = document.getElementById('display-group-name');
        this.memberList = document.getElementById('member-list');
        this.vibeQuote = document.getElementById('vibe-quote');
        this.vibeEmoji = document.getElementById('vibe-emoji');
        this.updateVibeBtn = document.getElementById('update-vibe-btn');
        this.groupsLoginTrigger = document.getElementById('groups-login-trigger');
        this.leaderCreateView = document.getElementById('leader-create-view');
        this.createGroupNameInput = document.getElementById('create-group-name');
        this.createGroupBtn = document.getElementById('create-group-btn');

        // Bottom Auth Elements
        this.bottomAuthSection = document.getElementById('bottom-auth-section');
        this.loginMemberBtn = document.getElementById('login-member-btn');
        this.loginOrganizerBtn = document.getElementById('login-organizer-btn');

        // Newsletter Elements
        this.leaderNewsletterTools = document.getElementById('leader-newsletter-tools');
        this.generateNewsletterBtn = document.getElementById('generate-newsletter-btn');
        this.noNewsletterMsg = document.getElementById('no-newsletter-msg');
        this.latestNewsletterCard = document.getElementById('latest-newsletter-card');
        this.viewNewsletterBtn = document.getElementById('view-newsletter-btn');
        this.newsletterModal = document.getElementById('newsletter-modal');
        this.closeNewsletter = document.getElementById('close-newsletter');
        this.newsletterRenderArea = document.getElementById('newsletter-render-area');
        this.newsletterTitle = document.getElementById('newsletter-title');
        this.newsletterDate = document.getElementById('newsletter-date');

        // Leader Toolbar Elements
        this.leaderToolbar = document.getElementById('leader-toolbar');
        this.generateCodeBtnLine = document.getElementById('generate-code-btn');
        this.generatedCodeDisplay = document.getElementById('generated-code-display');

        // Weekly Strategy (Home Screen)
        this.weeklyStrategySection = document.getElementById('weekly-strategy-section');
        this.weeklyStrategyCard = document.getElementById('weekly-strategy-card');
        this.newGroupCodeText = document.getElementById('new-group-code');
        this.copyCodeBtn = document.getElementById('copy-code-btn');
        this.copyInviteLinkBtn = document.getElementById('copy-invite-link-btn');
        this.shareSmsBtn = document.getElementById('share-sms-btn');
        this.shareEmailBtn = document.getElementById('share-email-btn');
        this.emptyMembersState = document.getElementById('empty-members-state');



        // Mobile Menu Elements
        this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        this.navLinks = document.querySelector('.nav-links');


        // Newsletter Section
        this.newsletterSection = document.getElementById('newsletter-section');

        // Group Plan Elements
        this.groupPlanArea = document.getElementById('group-plan-render-area');

        // Bottom Nav Links
        this.navHome = document.getElementById('nav-home');
        this.navMove = document.getElementById('nav-move');
        this.navAsk = document.getElementById('nav-ask');
        this.navSocial = document.getElementById('nav-social');
        this.navProfile = document.getElementById('nav-profile');
        this.navMore = document.getElementById('nav-more');
    }

    initEventListeners() {
        if (this.getBtn) this.getBtn.addEventListener('click', () => this.handleGeminiRequest());
        if (this.settingsToggle) this.settingsToggle.addEventListener('click', () => this.toggleSettings(true));
        if (this.closeSettings) this.closeSettings.addEventListener('click', () => this.toggleSettings(false));
        if (this.saveSettingsBtn) this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        if (this.checkModelsBtn) this.checkModelsBtn.addEventListener('click', () => this.fetchModels());

        // Auth Listeners
        if (this.loginNavBtn) this.loginNavBtn.addEventListener('click', () => this.toggleAuthModal(true));
        if (this.groupsLoginTrigger) this.groupsLoginTrigger.addEventListener('click', () => this.toggleAuthModal(true));
        if (this.closeAuth) this.closeAuth.addEventListener('click', () => this.toggleAuthModal(false));
        if (this.toggleAuth) this.toggleAuth.addEventListener('click', () => this.switchAuthMode());
        if (this.logoutBtn) this.logoutBtn.addEventListener('click', () => this.handleLogout());
        if (this.authForm) {
            this.authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAuth();
            });
        }

        // Bottom Auth Listeners
        if (this.loginMemberBtn) this.loginMemberBtn.addEventListener('click', () => this.openAuthWithRole('member'));
        if (this.loginOrganizerBtn) this.loginOrganizerBtn.addEventListener('click', () => this.openAuthWithRole('leader'));

        // Group Listeners
        if (this.joinGroupBtn) this.joinGroupBtn.addEventListener('click', () => this.handleJoinGroup());
        if (this.leaveGroupBtn) this.leaveGroupBtn.addEventListener('click', () => this.handleLeaveGroup());
        if (this.updateVibeBtn) this.updateVibeBtn.addEventListener('click', () => this.handleUpdateVibe());
        if (this.createGroupBtn) this.createGroupBtn.addEventListener('click', () => this.handleCreateGroup());

        // Newsletter Listeners
        if (this.generateNewsletterBtn) this.generateNewsletterBtn.addEventListener('click', () => this.handleGenerateNewsletter());
        if (this.viewNewsletterBtn) this.viewNewsletterBtn.addEventListener('click', () => this.toggleNewsletterModal(true));
        if (this.closeNewsletter) this.closeNewsletter.addEventListener('click', () => this.toggleNewsletterModal(false));

        // Reset Password Listeners
        if (this.forgotPasswordBtn) this.forgotPasswordBtn.addEventListener('click', () => this.toggleResetView(true));
        if (this.backToLoginBtn) this.backToLoginBtn.addEventListener('click', () => this.toggleResetView(false));
        if (this.confirmResetBtn) this.confirmResetBtn.addEventListener('click', () => this.handleResetPassword());

        // Leader Toolbar Listeners
        if (this.generateCodeBtnLine) this.generateCodeBtnLine.addEventListener('click', () => this.handleGenerateGroupCode());

        if (this.copyCodeBtn) this.copyCodeBtn.addEventListener('click', () => this.handleCopyCode());
        if (this.copyInviteLinkBtn) this.copyInviteLinkBtn.addEventListener('click', () => this.handleCopyInviteLink());
        if (this.shareSmsBtn) this.shareSmsBtn.addEventListener('click', () => this.handleShareSMS());
        if (this.shareEmailBtn) this.shareEmailBtn.addEventListener('click', () => this.handleShareEmail());



        // Mobile Menu Listeners
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        if (this.navMore) {
            this.navMore.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu(true);
            });
        }

        if (this.navLinks) {
            this.navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => this.toggleMobileMenu(false));
            });
        }

        // Bottom Nav "Ask" special handling
        if (this.navAsk) {
            this.navAsk.addEventListener('click', (e) => {
                const path = window.location.pathname;
                if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
                    // Stay on page, focus input
                    e.preventDefault();
                    if (this.feelingInput) {
                        this.feelingInput.focus();
                        this.feelingInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Pulse the input to show it's focused
                        this.feelingInput.classList.add('highlight-pulse');
                        setTimeout(() => this.feelingInput.classList.remove('highlight-pulse'), 2000);
                    }
                }
            });
        }
    }

    toggleNewsletterModal(show) {
        if (!this.newsletterModal) return;
        if (show) {
            this.newsletterModal.classList.remove('hidden');
            this.renderNewsletter();
        } else {
            this.newsletterModal.classList.add('hidden');
        }
    }

    toggleAuthModal(show) {
        if (!this.authModal) return;
        if (show) {
            this.authModal.classList.remove('hidden');
            this.toggleResetView(false); // Reset to login view when opening
        } else {
            this.authModal.classList.add('hidden');
        }
    }

    toggleResetView(show) {
        if (!this.resetView || !this.loginView) return;
        if (show) {
            this.resetView.classList.remove('hidden');
            this.loginView.classList.add('hidden');
            this.authTitle.innerText = 'Reset Password';
            this.authSubtitle.innerText = 'Enter your email to set a new password.';
        } else {
            this.resetView.classList.add('hidden');
            this.loginView.classList.remove('hidden');
            this.authTitle.innerText = this.isSignup ? 'Create Account' : 'Welcome Back';
            this.authSubtitle.innerText = this.isSignup ? 'Start your wellness journey today.' : 'Enter your email and password to log in.';
        }
    }

    switchAuthMode() {
        this.isSignup = !this.isSignup;
        this.authTitle.innerText = this.isSignup ? 'Create Account' : 'Welcome Back';
        this.authSubtitle.innerText = this.isSignup ? 'Start your wellness journey today.' : 'Enter your email and password to log in.';
        this.authSubmit.innerText = this.isSignup ? 'Sign Up' : 'Log In';
        this.toggleText.innerText = this.isSignup ? 'Already have an account?' : "Don't have an account?";
        this.toggleAuth.innerText = this.isSignup ? 'Log In' : 'Create Account';

        if (this.authRoleGroup) {
            if (this.isSignup) {
                this.authRoleGroup.classList.remove('hidden');
            } else {
                this.authRoleGroup.classList.add('hidden');
            }
        }
    }

    openAuthWithRole(role) {
        // Switch to signup mode if needed to show role selection
        if (!this.isSignup) {
            this.switchAuthMode();
        }

        if (this.authRoleSelect) {
            this.authRoleSelect.value = role;
        }

        this.toggleAuthModal(true);
    }

    showToast(message, duration = 0) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'social-toast';
        toast.innerHTML = `
            <div class="toast-header" style="display:flex; justify-content:space-between; align-items:center;">
                <span>Warrior Update</span>
                <span class="close-toast" style="cursor:pointer; font-size:1.2rem;">&times;</span>
            </div>
            <div class="toast-body" style="margin: 0.5rem 0;">${message}</div>
            <button class="toast-dismiss-btn">Got it 👍</button>
        `;
        container.appendChild(toast);

        // Sound effect (subtle pop)
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        // For now, silent or simple visual is enough.

        const remove = () => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(100%)';
            setTimeout(() => toast.remove(), 500);
        };

        toast.querySelector('.close-toast').addEventListener('click', remove);
        toast.querySelector('.toast-dismiss-btn').addEventListener('click', remove);

        // User requested ALL messages stay until clicked.
        // We strictly ignore duration and auto-dismissal.
    }

    handleAuth() {
        const email = this.authEmail.value;
        const password = this.authPassword.value;
        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};

        if (this.isSignup) {
            if (users[email]) {
                this.showToast('User already exists!');
                return;
            }
            const role = this.authRoleSelect ? this.authRoleSelect.value : 'member';
            users[email] = { password, role, hasLoggedInBefore: true }; // Mark as logged in immediately
            localStorage.setItem('warrior_users', JSON.stringify(users));
            this.showToast('Account created! Welcome to the team. 🚀');
        } else {
            if (!users[email] || users[email].password !== password) {
                this.showToast('Invalid email or password.');
                return;
            }
        }

        this.currentUser = { email, role: users[email].role };

        if (this.authRemember && this.authRemember.checked) {
            localStorage.setItem('current_warrior_user', JSON.stringify(this.currentUser));
            sessionStorage.removeItem('current_warrior_user');
        } else {
            sessionStorage.setItem('current_warrior_user', JSON.stringify(this.currentUser));
            localStorage.removeItem('current_warrior_user');
        }

        // Load history for this user
        this.history = JSON.parse(localStorage.getItem('warrior_history_' + this.currentUser.email)) || [];

        // First Time vs Welcome Back Logic
        if (!users[email].hasLoggedInBefore) {
            this.showToast('Welcome to the Warrior Team! 🚀', 5000);
            users[email].hasLoggedInBefore = true;
            localStorage.setItem('warrior_users', JSON.stringify(users));
        } else {
            this.showToast(`Welcome back, ${email.split('@')[0]}!`, 4000);
        }

        // Check for pending join code
        const pendingCode = sessionStorage.getItem('pending_join_code');
        if (pendingCode) {
            const currentCode = users[email].groupCode;
            if (currentCode !== pendingCode) {
                if (confirm(`Do you want to join the group "${pendingCode}"?`)) {
                    users[email].groupCode = pendingCode;
                    localStorage.setItem('warrior_users', JSON.stringify(users));
                    this.showToast('You have successfully joined the group!');
                }
            }
            sessionStorage.removeItem('pending_join_code');
        }

        this.toggleAuthModal(false);
        this.updateAuthUI();
        this.initGroups();

        // If on profile page, update the view
        if (window.updateProfileView) {
            window.updateProfileView(this.currentUser, this.history);
        }
    }

    handleResetPassword() {
        const email = this.resetEmailInput.value.trim();
        const newPassword = this.newPasswordInput.value.trim();

        if (!email || !newPassword) {
            alert('Please enter both email and new password.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        if (!users[email]) {
            alert('No account found with that email.');
            return;
        }

        users[email].password = newPassword;
        localStorage.setItem('warrior_users', JSON.stringify(users));
        alert('Password reset successfully! You can now log in.');
        this.toggleResetView(false);
    }

    handleLogout() {
        this.currentUser = null;
        this.history = [];
        localStorage.removeItem('current_warrior_user');
        this.updateAuthUI();
        this.initGroups();

        if (window.updateProfileView) {
            window.updateProfileView(null, []);
        }
    }

    updateAuthUI() {
        if (!this.loginNavBtn) return;
        if (this.currentUser) {
            this.loginNavBtn.classList.add('hidden');
            this.userInfo.classList.remove('hidden');
            this.userDisplay.innerText = this.currentUser.email.split('@')[0];
            if (this.bottomAuthSection) this.bottomAuthSection.classList.add('hidden');

            // Comprehensive UI cleanup for all pages
            document.querySelectorAll('.bottom-auth-section').forEach(el => el.classList.add('hidden'));
            const loginTriggers = ['profile-login-trigger', 'groups-login-trigger'];
            loginTriggers.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.closest('.info-card')?.classList.add('hidden');
            });
        } else {
            this.loginNavBtn.classList.remove('hidden');
            this.userInfo.classList.add('hidden');
            if (this.bottomAuthSection) this.bottomAuthSection.classList.remove('hidden');

            // Show triggers if logged out
            document.querySelectorAll('.bottom-auth-section').forEach(el => el.classList.remove('hidden'));
        }
    }

    // Groups Logic
    initGroups() {
        if (!this.loggedInGroups || !this.loggedOutGroups) return;

        if (this.currentUser) {
            this.loggedOutGroups.classList.add('hidden');
            this.loggedInGroups.classList.remove('hidden');

            const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
            const userData = users[this.currentUser.email] || {};
            this.currentUser.role = userData.role || 'member'; // Sync role and default to member

            if (userData.groupCode) {
                if (this.joinGroupView) this.joinGroupView.classList.add('hidden');
                if (this.leaderCreateView) this.leaderCreateView.classList.add('hidden');
                if (this.groupDashboardView) this.groupDashboardView.classList.remove('hidden');
                if (this.displayGroupCode) this.displayGroupCode.innerText = userData.groupCode;
                if (this.displayGroupName) this.displayGroupName.innerText = userData.groupName || 'Warrior Team';

                this.renderGroupMembers(userData.groupCode);
                this.renderGroupPlan(userData.groupCode);

                // Newsletter visibility
                if (this.newsletterSection) {
                    this.newsletterSection.classList.remove('hidden');
                    if (this.currentUser.role === 'leader') {
                        if (this.leaderNewsletterTools) this.leaderNewsletterTools.classList.remove('hidden');
                    } else {
                        if (this.leaderNewsletterTools) this.leaderNewsletterTools.classList.add('hidden');
                    }

                    const newsletter = JSON.parse(localStorage.getItem('newsletter_' + userData.groupCode));
                    if (newsletter) {
                        if (this.noNewsletterMsg) this.noNewsletterMsg.classList.add('hidden');
                        if (this.latestNewsletterCard) this.latestNewsletterCard.classList.remove('hidden');
                        if (this.newsletterTitle) this.newsletterTitle.innerText = newsletter.title;
                        if (this.newsletterDate) this.newsletterDate.innerText = 'Sent ' + new Date(newsletter.timestamp).toLocaleDateString();
                        if (this.viewNewsletterBtn) this.viewNewsletterBtn.classList.remove('hidden');

                        // Newsletter Notification Logic
                        const lastSeen = localStorage.getItem('warrior_last_newsletter_' + userData.groupCode);
                        if (newsletter.timestamp !== lastSeen) {
                            // Delay slightly so it doesn't overlap with welcome toast
                            setTimeout(() => {
                                this.showToast('📧 New Weekly Report available!', 5000);
                            }, 2000);
                            localStorage.setItem('warrior_last_newsletter_' + userData.groupCode, newsletter.timestamp);
                        }
                    } else {
                        if (this.noNewsletterMsg) this.noNewsletterMsg.classList.remove('hidden');
                        if (this.latestNewsletterCard) this.latestNewsletterCard.classList.add('hidden');
                        if (this.viewNewsletterBtn) this.viewNewsletterBtn.classList.add('hidden');
                    }
                }
            } else {
                if (this.groupDashboardView) this.groupDashboardView.classList.add('hidden');
                if (this.currentUser.role === 'leader') {
                    if (this.joinGroupView) this.joinGroupView.classList.add('hidden');
                    if (this.leaderCreateView) this.leaderCreateView.classList.remove('hidden');
                } else {
                    if (this.joinGroupView) this.joinGroupView.classList.remove('hidden');
                    if (this.leaderCreateView) this.leaderCreateView.classList.add('hidden');
                }
            }
            if (this.currentUser.role === 'leader') {
                if (this.leaderToolbar) this.leaderToolbar.classList.remove('hidden');
            } else {
                if (this.leaderToolbar) this.leaderToolbar.classList.add('hidden');
            }
            this.renderHomeStrategy();
        } else {
            this.loggedOutGroups.classList.remove('hidden');
            this.loggedInGroups.classList.add('hidden');
            if (this.leaderToolbar) this.leaderToolbar.classList.add('hidden');
        }
    }

    handleCreateGroup() {
        const groupName = this.createGroupNameInput.value.trim();
        if (!groupName) {
            this.showToast('Please enter a group name.');
            return;
        }

        const code = 'WARRIOR-' + Math.random().toString(36).substring(2, 6).toUpperCase();

        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        users[this.currentUser.email].groupCode = code;
        users[this.currentUser.email].groupName = groupName;
        localStorage.setItem('warrior_users', JSON.stringify(users));

        this.showToast(`Group "${groupName}" created! Code: ${code}`, 5000);
        this.initGroups();
    }

    handleJoinGroup() {
        const code = this.groupCodeInput.value.trim().toUpperCase();
        if (!code) return;

        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        users[this.currentUser.email].groupCode = code;
        localStorage.setItem('warrior_users', JSON.stringify(users));

        this.initGroups();
    }

    handleLeaveGroup() {
        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        delete users[this.currentUser.email].groupCode;
        localStorage.setItem('warrior_users', JSON.stringify(users));

        this.initGroups();
    }

    handleUpdateVibe() {
        const quote = this.vibeQuote.value;
        const emoji = this.vibeEmoji.value;

        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        users[this.currentUser.email].vibe = { quote, emoji };
        localStorage.setItem('warrior_users', JSON.stringify(users));

        this.showToast('Vibe broadcasted to your group! 📡');
        this.initGroups();
    }

    handleGenerateGroupCode() {
        const code = 'WARRIOR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        if (this.newGroupCodeText) this.newGroupCodeText.innerText = code;
        if (this.generatedCodeDisplay) this.generatedCodeDisplay.classList.remove('hidden');
    }

    handleCopyCode() {
        const code = this.newGroupCodeText.innerText;
        if (!code) return;

        navigator.clipboard.writeText(code).then(() => {
            const originalText = this.copyCodeBtn.innerText;
            this.copyCodeBtn.innerText = 'Copied!';
            setTimeout(() => {
                this.copyCodeBtn.innerText = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            this.showToast('Failed to copy code. Please copy manually.');
        });
    }

    handleCopyInviteLink() {
        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        const userData = users[this.currentUser.email] || {};
        const code = userData.groupCode || this.newGroupCodeText.innerText;

        if (!code || code === '...') {
            this.showToast('No active group code found to share.');
            return;
        }

        const inviteLink = `${window.location.origin}/groups.html?join=${code}`;

        navigator.clipboard.writeText(inviteLink).then(() => {
            const originalText = this.copyInviteLinkBtn.innerText;
            this.copyInviteLinkBtn.innerText = 'Link Copied!';
            setTimeout(() => {
                this.copyInviteLinkBtn.innerText = '🔗 Copy Invite Link';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            this.showToast('Failed to copy link. Code is: ' + code);
        });
    }

    getInviteData() {
        if (!this.currentUser) return null;
        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        const userData = users[this.currentUser.email] || {};
        const code = userData.groupCode || (this.newGroupCodeText ? this.newGroupCodeText.innerText : '');

        if (!code || code === '...') return null;

        const inviteLink = `${window.location.origin}/groups.html?join=${code}`;
        const message = `Join my Warrior Group on Wellness Workspace! \n\nGroup Code: ${code} \nLink: ${inviteLink}`;

        return { code, inviteLink, message };
    }

    handleShareSMS() {
        const data = this.getInviteData();
        if (!data) {
            this.showToast('No active group code to share.');
            return;
        }

        // On mobile, navigator.share is best if available
        if (navigator.share) {
            navigator.share({
                title: 'Join my Warrior Group',
                text: data.message,
                url: data.inviteLink
            }).catch(console.error);
        } else {
            // Fallback to SMS link
            // Note: iOS uses '&', Android uses '?' separator often, but '?' is safer standard start
            const ua = navigator.userAgent.toLowerCase();
            const changes = (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) ? '&' : '?';
            window.location.href = `sms:${changes}body=${encodeURIComponent(data.message)}`;
        }
    }

    handleShareEmail() {
        const data = this.getInviteData();
        if (!data) {
            this.showToast('No active group code to share.');
            return;
        }

        const subject = encodeURIComponent("Join my Warrior Group 💪");
        const body = encodeURIComponent(data.message);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    initFullscreenPersistence() {
        let isUnloading = false;
        window.addEventListener('beforeunload', () => {
            isUnloading = true;
        });

        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                sessionStorage.setItem('fullScreenPersistent', 'true');
            } else {
                if (!isUnloading) {
                    sessionStorage.setItem('fullScreenPersistent', 'false');
                }
            }
        });

        if (sessionStorage.getItem('fullScreenPersistent') === 'true') {
            const reEnter = () => {
                if (sessionStorage.getItem('fullScreenPersistent') === 'true' && !document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.warn('Auto-fullscreen re-entry deferred or failed:', err);
                    });
                }
                document.removeEventListener('click', reEnter);
            };
            document.addEventListener('click', reEnter);
        }
    }



    toggleMobileMenu(show) {
        if (this.navLinks) {
            const isActive = show !== undefined ? show : !this.navLinks.classList.contains('active');

            if (isActive) {
                this.navLinks.classList.add('active');
                this.mobileMenuToggle.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>';
                document.body.style.overflow = 'hidden'; // Lock scroll
            } else {
                this.navLinks.classList.remove('active');
                this.mobileMenuToggle.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>';
                document.body.style.overflow = ''; // Unlock scroll
            }
        }
    }

    syncBottomNav() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';

        document.querySelectorAll('.bottom-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Terminology matches: Move -> Exercises, Social -> Groups
        if (page === 'index.html' || page === '') {
            this.navHome?.classList.add('active');
        } else if (page === 'exercises.html') {
            this.navMove?.classList.add('active'); // navMove is the button for Exercises
        } else if (page === 'groups.html') {
            this.navSocial?.classList.add('active'); // navSocial is the button for Groups
        } else if (page === 'profile.html' || page === 'profile') {
            this.navProfile?.classList.add('active');
        }
    }

    handleGenerateNewsletter() {
        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        const userData = users[this.currentUser.email] || {};
        if (!userData.groupCode) return;

        // Get all members of this group
        const groupMembers = Object.entries(users)
            .filter(([email, data]) => data.groupCode === userData.groupCode)
            .map(([email, data]) => ({
                email,
                name: email.split('@')[0],
                // Simulate some scores for the week
                score: Math.floor(Math.random() * 100) + 10
            }))
            .sort((a, b) => b.score - a.score);

        const bestMember = groupMembers[0];
        const worstMember = groupMembers[groupMembers.length - 1];

        const goals = [
            "Complete 200 combined Standing Stretches",
            "Achieve a 90% average Mobility Score",
            "Log 50 consecutive 'High Vibe' emojis",
            "Execute a team-wide 'Neck Tilt' challenge"
        ];

        const comparisons = [
            { name: "Digital Nomads", score: 850 },
            { name: "Marketing Mavens", score: 720 },
            { name: "The Desk Ninjas", score: 940 },
            { name: userData.groupName || "Your Group", score: groupMembers.reduce((acc, m) => acc + m.score, 0) }
        ].sort((a, b) => b.score - a.score);

        const newsletter = {
            title: `Warrior Weekly #${Math.floor(Math.random() * 100) + 1}`,
            goal: goals[Math.floor(Math.random() * goals.length)],
            leaderboard: comparisons,
            bestPerformer: bestMember,
            worstPerformer: worstMember,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('newsletter_' + userData.groupCode, JSON.stringify(newsletter));
        this.showToast('Newsletter generated and broadcasted! 📨');
        this.initGroups();
    }

    renderNewsletter() {
        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        const userData = users[this.currentUser.email] || {};
        const newsletter = JSON.parse(localStorage.getItem('newsletter_' + userData.groupCode));
        if (!newsletter) return;

        let leaderboardHtml = newsletter.leaderboard.map((group, index) => `
            <div class="leaderboard-row ${group.name === (userData.groupName || "Your Group") ? 'highlight' : ''}">
                <span>#${index + 1} ${group.name}</span>
                <span>${group.score} pts</span>
            </div>
        `).join('');

        const performanceHtml = `
            <div class="performance-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
                <div class="performance-card best" style="background: rgba(34, 197, 94, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid #22c55e;">
                    <h4 style="color: #15803d; margin-bottom: 0.5rem;">🌟 Best Performer</h4>
                    <p><strong>${newsletter.bestPerformer?.name || 'N/A'}</strong></p>
                    <p class="hint" style="font-size: 0.75rem;">Leading the way with ${newsletter.bestPerformer?.score || 0} activity points!</p>
                </div>
                <div class="performance-card worst" style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid #ef4444;">
                    <h4 style="color: #b91c1c; margin-bottom: 0.5rem;">🐌 Needs a Boost</h4>
                    <p><strong>${newsletter.worstPerformer?.name || 'N/A'}</strong></p>
                    <p class="hint" style="font-size: 0.75rem;">Only ${newsletter.worstPerformer?.score || 0} points. Let's get moving together!</p>
                </div>
            </div>
        `;

        if (!this.newsletterRenderArea) return;
        this.newsletterRenderArea.innerHTML = `
            <div class="newsletter-container" style="padding: 2rem;">
                <div class="newsletter-header" style="text-align: center; margin-bottom: 2rem;">
                    <div class="newsletter-badge" style="display: inline-block; background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; margin-bottom: 1rem;">WARRIOR WEEKLY</div>
                    <h1 style="font-family: 'Instrument Sans', sans-serif;">${newsletter.title}</h1>
                    <p style="margin-top: 0.5rem; color: #666;">Leveling up your movement, together.</p>
                </div>

                <div class="newsletter-section" style="margin-bottom: 2rem;">
                    <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">Weekly Performance</h2>
                    <p>Here's how our group did this past week. Every stretch counts toward our collective goal!</p>
                    ${performanceHtml}
                </div>

                <div class="newsletter-section" style="margin-bottom: 2rem;">
                    <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">Group Comparisons</h2>
                    <p>How do we stack up against the competition this week?</p>
                    <div class="leaderboard-table" style="margin-top: 1rem; background: #f9fafb; padding: 1rem; border-radius: 12px;">
                        ${leaderboardHtml}
                    </div>
                </div>

                <div class="newsletter-section" style="margin-bottom: 2rem;">
                    <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">The Big Weekly Goal</h2>
                    <div class="goal-card" style="background: var(--primary); color: white; padding: 1.5rem; border-radius: 16px; text-align: center;">
                        <h3 style="margin-bottom: 0.5rem;">🎯 ${newsletter.goal}</h3>
                        <p style="opacity: 0.9;">If we hit this by Sunday, everyone in the group earns the <strong>'Desk Ninja'</strong> prestige badge.</p>
                    </div>
                </div>

                <div class="newsletter-footer" style="text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #eee; font-size: 0.8rem; color: #999;">
                    <p>You received this because you are a member of ${userData.groupName || "this group"}.</p>
                    <p>Wellness Workspace © 2026</p>
                </div>
            </div>
        `;
    }

    renderGroupMembers(code) {
        // In a real app, this would fetch from a database.
        // We will simulate some group members.
        const simulatedMembers = [
            { name: "Sarah Ninja", quote: "Focus on the progress. 📈", emoji: "🧘‍♂️", last: "Crushed a Neck Tilt 5 min ago" },
            { name: "Digital Dave", quote: "Stay agile, stay strong. 🦁", emoji: "🤸", last: "Completed Shoulder Shrugs 1 hour ago" },
            { name: "Coffee Chris", quote: "Motion is medicine. 🧪", emoji: "🚀", last: "Just started a Standing Stretch" }
        ];

        if (!this.memberList) return;
        this.memberList.innerHTML = '';

        // Add current user
        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        const myData = users[this.currentUser.email] || {};
        const myVibe = myData.vibe || { quote: "Setting my vibe...", emoji: "🥑" };

        const myCard = document.createElement('div');
        myCard.className = 'member-card';
        myCard.style.border = '2px solid var(--primary)';
        const roleTag = this.currentUser.role === 'leader' ? '<span class="category-tag" style="background: var(--primary); color: white; margin-left: 0.5rem; font-size: 0.6rem;">LEADER</span>' : '';

        myCard.innerHTML = `
            <div class="member-info">
                <div class="member-avatar">ME</div>
                <div>
                    <h4 style="margin:0">${this.currentUser.email.split('@')[0]} (You)${roleTag}</h4>
                    <span class="hint" style="font-size: 0.7rem">Active Now</span>
                </div>
            </div>
            <div class="member-vibe">
                <span style="font-size: 1.5rem; display: block; margin-bottom: 0.5rem">${myVibe.emoji}</span>
                "${myVibe.quote}"
            </div>
        `;
        this.memberList.appendChild(myCard);

        simulatedMembers.forEach(m => {
            const card = document.createElement('div');
            card.className = 'member-card';
            card.innerHTML = `
                <div class="member-info">
                    <div class="member-avatar">${m.name[0]}</div>
                    <div>
                        <h4 style="margin:0">${m.name}</h4>
                        <span class="hint" style="font-size: 0.7rem">${m.last}</span>
                    </div>
                </div>
                <div class="member-vibe">
                    <span style="font-size: 1.5rem; display: block; margin-bottom: 0.5rem">${m.emoji}</span>
                    "${m.quote}"
                </div>
                <div class="cheer-overlay">
                    <button class="cheer-btn" onclick="window.app.handleCheer('${m.name}')">🙌 High Five!</button>
                </div>
            `;
            this.memberList.appendChild(card);
        });

        // Toggle Empty State (Simulated since we always have fake members for demo)
        if (this.emptyMembersState) {
            if (simulatedMembers.length === 0) {
                this.emptyMembersState.classList.remove('hidden');
            } else {
                this.emptyMembersState.classList.add('hidden');
            }
        }
    }

    handleCheer(memberName) {
        // Visual Feedback
        this.showSocialToast("You", `high-fived ${memberName}!`, "🙌", "sent some positive energy!");

        // In a real app, this would send a push notification to that user.
    }

    checkForSocialNotifications() {
        if (!this.currentUser) return;

        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        const myData = users[this.currentUser.email] || {};
        if (!myData.groupCode) return;

        // Simulate receiving a notification from a group member after 3 seconds
        setTimeout(() => {
            const sender = "Sarah Ninja";
            const quote = "Stay agile, stay strong. 🦁";
            const emoji = "🧘‍♂️";
            this.showSocialToast(sender, quote, emoji, "just completed an exercise!");
        }, 3000);
    }

    showSocialToast(sender, quote, emoji, action) {
        const toast = document.createElement('div');
        toast.className = 'social-toast';
        toast.innerHTML = `
            <div class="toast-header">
                <span>Group Update</span>
                <span>✨</span>
            </div>
            <p><strong>${sender}</strong> ${action}</p>
            <div class="member-vibe" style="margin-top: 0.5rem; background: rgba(0,0,0,0.1)">
                <span style="font-size: 1.2rem">${emoji}</span> "${quote}"
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-100%)';
            toast.style.transition = 'all 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 6000);
    }

    loadSettings() {
        if (this.apiKeyInput) this.apiKeyInput.value = this.apiKey;
        if (this.modelInput) this.modelInput.value = this.model;
        if (this.systemPromptInput) this.systemPromptInput.value = this.systemPrompt;
    }

    toggleSettings(show) {
        if (show) {
            this.settingsPanel.classList.remove('hidden');
        } else {
            this.settingsPanel.classList.add('hidden');
        }
    }

    saveSettings() {
        this.apiKey = this.apiKeyInput.value.trim();
        this.model = this.modelInput.value;
        this.systemPrompt = this.systemPromptInput.value.trim();

        localStorage.setItem('gemini_api_key', this.apiKey);
        localStorage.setItem('gemini_model', this.model);
        localStorage.setItem('system_prompt', this.systemPrompt);

        this.showToast('Configuration saved! ✅');
        this.toggleSettings(false);
    }

    async handleGeminiRequest() {
        const feeling = this.feelingInput.value.trim();
        if (!feeling) {
            this.showToast('Please tell me how you are feeling first.');
            return;
        }



        // PROXY MODE SUPPORT:
        // We now allow proceeding even if this.apiKey is empty, because we have the Vercel Proxy as fallback.
        // We only block if the user specifically entered an INVALID key pattern in the past (starts with AIzaSy_PLACEHOLDER logic).

        if (this.apiKey && this.apiKey.startsWith('AIzaSy_PLACEHOLDER')) {
            this.showToast('Your API Key seems invalid. Please check Settings. 🔑');
            this.toggleSettings(true);
            return;
        }

        this.setLoading(true);

        // --- WEEKLY FOCUS INJECTION ---
        // Get the user's group code to find their weekly plan
        let contextAddition = "";
        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        if (this.currentUser && users[this.currentUser.email] && users[this.currentUser.email].groupCode) {
            const groupCode = users[this.currentUser.email].groupCode;
            const plan = this.getGroupWeeklyPlan(groupCode);
            const todayIndex = new Date().getDay() - 1; // 0=Mon

            if (todayIndex >= 0 && todayIndex < 5) {
                const todaysItem = plan[todayIndex];
                contextAddition = `\n\nCONTEXT OBSERVED: The user is in a group (Code: ${groupCode}). Their designated "Group Focus Exercise" for TODAY is "${todaysItem.exercise.title}".\nINSTRUCTION: You MUST mention this specific exercise ("${todaysItem.exercise.title}") in your response as a reminder, even if you also recommend other things. Connect it to their current feeling if possible.`;
            }
        }

        // Pass a modified "feeling" string that effectively appends context without changing system prompt permanently
        const augmentedInput = `${feeling} ${contextAddition}`;

        try {
            // FIX: removed effectiveApiKey since it is no longer defined. 
            // callGemini handles null key by using the Proxy.
            const response = await this.callGemini(augmentedInput, this.apiKey);
            this.renderResult(response);
        } catch (error) {
            console.error(error);
            let errorMsg = error.message;
            if (errorMsg.includes('not found') || errorMsg.includes('supported')) {
                errorMsg += '\n\nTIP: Your API key might not have access to this specific model name. Try clicking the "Check Available Models" button in Settings to find models your key supports.';
            } else if (errorMsg.includes('API key not valid')) {
                errorMsg += '\n\nThe configured API key is invalid.';
            } else if (errorMsg.includes('safety filters')) {
                errorMsg += '\n\nThe AI blocked this request due to safety filters. Try rephrasing without strong medical terms.';
            }
            this.showToast('Warrior Bot failed: ' + errorMsg, 6000);
        } finally {
            this.setLoading(false);
        }
    }




    setLoading(isLoading) {
        if (isLoading) {
            this.loadingOverlay.classList.remove('hidden');
        } else {
            this.loadingOverlay.classList.add('hidden');
        }
    }

    async callGemini(feeling, apiKey, isRetry = false) {
        // Log outgoing request for debugging
        const hasUserKey = !!(apiKey || this.apiKey);

        // If no user key, we use the Vercel Proxy (Site Mode)
        // We TRUST the optimization logic now instead of hardcoding Flash.
        if (!hasUserKey) {
            console.log('Using Site Proxy for API call.');
        }

        console.log(`Calling Gemini with model: ${this.model} using v1beta (Retry: ${isRetry})`);

        try {
            let response;

            if (hasUserKey) {
                // Client-side call with User Key
                const usedKey = apiKey || this.apiKey;
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${usedKey}`;

                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `${this.systemPrompt}\n\nUser Input: "${feeling}"`
                            }]
                        }],
                        safetySettings: [
                            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
                        ]
                    })
                });
            } else {
                // Server-side call via Vercel Proxy (No key exposure)
                response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: this.model,
                        contents: [{
                            parts: [{
                                text: `${this.systemPrompt}\n\nUser Input: "${feeling}"`
                            }]
                        }]
                    })
                });
            }

            if (!response.ok) {
                const err = await response.json();
                console.error('Gemini Error Response:', err);
                const errorMsg = err.error?.message || 'Gemini API Error';

                // Retry logic remains useful even for proxy if the proxy itself returns a model 404 (unlikely with hardcoded Flash)
                if (!isRetry && (errorMsg.includes('not found') || errorMsg.includes('not supported') || response.status === 404)) {
                    console.warn(`Model ${this.model} failed. Switching to gemini-1.5-flash and retrying.`);
                    this.model = 'gemini-1.5-flash';
                    return this.callGemini(feeling, apiKey, true);
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            // Check if prompt was blocked
            if (!data.candidates || data.candidates.length === 0) {
                if (data.promptFeedback && data.promptFeedback.blockReason) {
                    throw new Error(`Blocked by safety filters: ${data.promptFeedback.blockReason}`);
                }
                throw new Error('No response candidates returned.');
            }
            return data.candidates[0].content.parts[0].text;

        } catch (error) {
            console.error('Gemini API Error:', error);

            // SELF-HEALING: Check for "leaked key" error
            if (error.message && (error.message.includes('leaked') || error.message.includes('expired') || error.message.includes('not valid'))) {
                console.warn('Leaked/Invalid Key detected. Clearing local storage.');
                localStorage.removeItem('gemini_api_key');
                this.apiKey = '';
                this.apiKeyInput.value = '';
                this.showToast('⚠️ Detected invalid API key. It has been removed. Please try again (will use Site Proxy).', 6000);
                return "Error: Your API key was invalid and has been reset. Please try your request again.";
            }

            throw error;
        }
    }

    async getAvailableModels() {
        // Helper to get models either directly or via Proxy
        let url;
        if (this.apiKey) {
            url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
        } else {
            // Proxy Mode
            url = '/api/models';
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch models: ' + response.statusText);
            const data = await response.json();

            if (!data.models) return [];

            return data.models
                .map(m => m.name.replace('models/', ''))
                .filter(name => name.toLowerCase().includes('gemini'));
        } catch (e) {
            console.error('Error fetching models:', e);
            return [];
        }
    }

    async fetchModels() {
        const keyToUse = this.apiKeyInput.value.trim();

        // If user is typing a key, we try to use that. 
        // If empty and no stored key, we use Proxy.

        if (keyToUse) {
            // Manual check with entered key
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${keyToUse}`;
            // ... existing manual logic could go here but let's simplify by using shared helper for the stored state
            // For the input search specifically:
            this.modelDebug.innerText = 'Checking key...';
            fetch(url).then(res => res.json()).then(data => {
                if (data.error) throw new Error(data.error.message);
                const models = data.models.map(m => m.name.replace('models/', '')).filter(n => n.includes('gemini'));
                this.populateModelList(models);
                this.modelDebug.innerHTML = `<span style="color:#22c55e">✓ Found ${models.length} models for this key.</span>`;
            }).catch(err => {
                this.modelDebug.innerHTML = `<span style="color:#ef4444">${err.message}</span>`;
            });
            return;
        }

        // If we are here, we use the stored state (User Key or Proxy)
        this.modelDebug.innerText = 'Fetching available models...';
        const models = await this.getAvailableModels();

        if (models.length === 0) {
            this.modelDebug.innerHTML = '<span style="color:#ef4444">No Gemini models found. Check API key.</span>';
            return;
        }

        this.populateModelList(models);
        this.modelDebug.innerHTML = `<span style="color:#22c55e">✓ Found ${models.length} models.</span>`;
    }

    populateModelList(models) {
        this.modelInput.innerHTML = '';
        models.sort().reverse();
        models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.innerText = m;
            this.modelInput.appendChild(opt);
        });
        if (models.includes(this.model)) {
            this.modelInput.value = this.model;
        } else if (models.length > 0) {
            this.modelInput.value = models[0];
        }
    }

    async optimizeModelSelection() {
        console.log('Optimizing model selection...');

        const availableModels = await this.getAvailableModels();
        if (availableModels.length === 0) return;

        // Priority list: Flash (fastest/cheapest) -> Pro 1.5 -> Pro 1.0
        // User requested dynamic updates compatible with the key.
        // If the key supports 1.5 Pro, we might want to prefer it if stability isn't the only concern.
        // However, typically Flash is preferred for speed in this app. 
        // Let's stick to the preference list [Flash, Pro 1.5, Pro 1.0] to match previous logic, 
        // OR [Pro 1.5, Flash] if user wants "best". 
        // Given "Warrior Bot", Flash is usually better for latency. 

        const preferred = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro'];

        // Check if current model is valid
        const isCurrentValid = availableModels.includes(this.model);

        // If invalid OR if it's the legacy "gemini-pro", negotiate best match
        if (!isCurrentValid || this.model === 'gemini-pro') {
            let bestMatch = null;
            for (const p of preferred) {
                if (availableModels.includes(p)) {
                    bestMatch = p;
                    break;
                }
            }

            if (!bestMatch && availableModels.length > 0) bestMatch = availableModels[0];

            if (bestMatch && bestMatch !== this.model) {
                console.log(`Upgrading model from ${this.model} to ${bestMatch}`);
                this.model = bestMatch;
                localStorage.setItem('gemini_model', bestMatch);
                if (this.modelInput) this.modelInput.value = bestMatch;
                // Only toast if it's a significant change to avoid spam
                if (!isCurrentValid) {
                    this.showToast(`Updated AI Model to ${bestMatch} ⚡️`);
                }
            }
        }
    }

    renderResult(text) {
        // Toggle Views: Hide Hero, Show Result
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) heroSection.classList.add('hidden');
        this.resultSection.classList.remove('hidden');

        // Scroll to top to ensure the user sees the start of the protocol
        window.scrollTo({ top: 0, behavior: 'smooth' });

        let protocol = null;
        let displayMsg = '';
        let recommendedIds = [];

        try {
            // Attempt to parse JSON. Clean up markdown code blocks if present.
            const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            protocol = JSON.parse(jsonText);

            displayMsg = protocol.coach_message;
            recommendedIds = protocol.exercises.map(e => e.id);
        } catch (e) {
            console.warn("JSON Parse Failed, falling back to legacy regex or text search", e);
            displayMsg = text;
            const idMatch = text.match(/RECOMMENDED_IDS:\s*\[(.*?)\]/s);
            if (idMatch) {
                recommendedIds = idMatch[1].split(',').map(id => id.trim().replace(/['"“”‘’]/g, ''));
            }
        }

        // Render Protocol Card with Back Button
        this.geminiResponse.innerHTML = `
            <div class="protocol-card">
                <button id="back-to-home" class="text-btn" style="margin-bottom: 1.5rem; padding: 0; display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted);">
                    <span>←</span> Back to Home
                </button>
                <div class="protocol-header">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                        <span class="protocol-badge">Warrior Protocol</span>
                        <span class="protocol-badge" style="background: rgba(168, 195, 181, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); font-size: 0.7rem;">✓ AI Verified</span>
                    </div>
                    <h3>${protocol ? protocol.protocol_name : 'Custom Routine'}</h3>
                </div>
                <div class="protocol-message">
                    <p style="font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Clinical Justification</p>
                    ${marked.parse(displayMsg)}
                </div>
                ${(() => {
                const ids = recommendedIds.slice();
                const defaultStretch = 'seated-neck-release';
                if (!ids.includes(defaultStretch)) ids.push(defaultStretch);
                const url = 'exercises.html?ids=' + encodeURIComponent(ids.join(','));
                return `
                    <a href="${url}" class="secondary-btn" style="margin-top: 1rem; display: inline-block;">View All Exercises</a>
                    <a href="${url}" class="primary-btn" style="margin-top: 1rem; margin-left: 0.5rem; display: inline-block;">Start Protocol</a>`;
            })()}
            </div>
        `;

        // Attach listener to new back button
        document.getElementById('back-to-home').addEventListener('click', () => {
            this.resetView();
        });

        // Render cards
        this.exerciseList.innerHTML = '';
        this.exerciseList.className = 'exercise-sections-list'; // Ensure class

        let selectedExercises = EXERCISES.filter(ex => recommendedIds.includes(ex.id));


        selectedExercises.forEach((ex, index) => {
            const card = document.createElement('div');
            card.className = 'exercise-card';

            card.innerHTML = `
                <div class="card-icon">${ex.icon}</div>
                <h3>${ex.title}</h3>
                <span class="category-tag">Exercise</span>
                <p>${ex.description}</p>
                <div class="benefit">
                    <strong>Benefit:</strong> ${ex.benefit}
                </div>
                <a href="exercises.html#${ex.id}" class="secondary-btn" style="margin-top: 1rem; text-decoration: none; text-align: center;">View Details</a>
            `;
            this.exerciseList.appendChild(card);
        });

        // Scroll to results
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
        // Initialize Scroll Reveal for new elements
        this.initRevealOnScroll();
    }

    resetView() {
        // Hide Result, Show Hero
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) heroSection.classList.remove('hidden');
        this.resultSection.classList.add('hidden');

        // Clear previous results to avoid flashing old content next time
        this.geminiResponse.innerHTML = '';
        this.exerciseList.innerHTML = '';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    saveToHistory(message, exercises) {
        if (!this.currentUser) return;

        const historyItem = {
            timestamp: new Date().getTime(),
            message: message,
            exercises: exercises.map(ex => ({ id: ex.id, title: ex.title, icon: ex.icon })) // Store ID for linking
        };

        this.history.push(historyItem);
        localStorage.setItem('warrior_history_' + this.currentUser.email, JSON.stringify(this.history));
    }

    // --- Weekly & Group Logic ---

    getWeeklyRecommendation() {
        // Simple logic to rotate a weekly featured exercise
        const weekNum = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24 * 7));
        const index = weekNum % EXERCISES.length;
        return EXERCISES[index];
    }

    getGroupWeeklyPlan(groupCode) {
        // Deterministic 5-day plan based on group code
        let seed = 0;
        for (let i = 0; i < groupCode.length; i++) seed += groupCode.charCodeAt(i);

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        return days.map((day, i) => {
            const exIndex = (seed + i) % EXERCISES.length;
            return { day, exercise: EXERCISES[exIndex] };
        });
    }

    renderHomeStrategy() {
        if (!this.weeklyStrategySection || !this.weeklyStrategyCard || !this.currentUser) {
            if (this.weeklyStrategySection) this.weeklyStrategySection.classList.add('hidden');
            return;
        }

        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        const userData = users[this.currentUser.email] || {};

        if (!userData.groupCode) {
            this.weeklyStrategySection.classList.add('hidden');
            return;
        }

        const plan = this.getGroupWeeklyPlan(userData.groupCode);
        const todayNum = new Date().getDay(); // 0 for Sun, 1 for Mon, etc.
        // Map Sun(0) to Mon(1) and Sat(6) to Fri(5)
        const targetIdx = Math.max(0, Math.min(4, todayNum - 1));
        const todayPlan = plan[targetIdx];
        const ex = todayPlan.exercise;

        this.weeklyStrategySection.classList.remove('hidden');
        this.weeklyStrategyCard.innerHTML = `
            <div class="strategy-info">
                <span class="strategy-badge">Today's Team focus</span>
                <h3 class="strategy-title">${ex.title}</h3>
                <p class="hint" style="margin-bottom: 1rem;">${ex.benefit}</p>
                <div class="strategy-meta">
                    <span>📅 ${todayPlan.day} Protocol</span>
                    <span><div class="presence-dot"></div> Team Resilience Sync: Active</span>
                </div>
                <a href="exercises.html#${ex.id}" class="primary-btn" style="margin-top: 1.5rem; width: auto; display: inline-flex; justify-content: center;">Start Today's Reset</a>
            </div>
            <div class="strategy-visual">
                ${ex.icon}
            </div>
        `;
    }

    renderGroupPlan(groupCode) {
        if (!this.groupPlanArea) return;

        const plan = this.getGroupWeeklyPlan(groupCode);
        const todayIndex = new Date().getDay() - 1; // 0-indexed Mon-Fri (assuming 1-5)

        // --- CLEAN INTERFACE: TODAY'S FOCUS ---
        let todaysFocusHtml = '';
        if (todayIndex >= 0 && todayIndex < 5) {
            const todaysItem = plan[todayIndex];
            todaysFocusHtml = `
                <div class="todays-focus-container">
                    <div class="todays-focus-header">
                        <span>📅 Today's Group Focus</span>
                    </div>
                    <div class="todays-focus-card">
                        <span class="todays-focus-icon">${todaysItem.exercise.icon}</span>
                        <h2>${todaysItem.exercise.title}</h2>
                        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${todaysItem.exercise.benefit}</p>
                        <a href="exercises.html#${todaysItem.exercise.id}" class="primary-btn" style="justify-content: center; width: 100%;">
                            Do Today's Stretch
                        </a>
                    </div>
                </div>
            `;
        } else {
            // Weekend fallback
            todaysFocusHtml = `
                <div class="todays-focus-container">
                    <div class="todays-focus-header">
                        <span>Weekend Vibes</span>
                    </div>
                    <p style="color: var(--text-muted);">Rest and recover. See you Monday!</p>
                </div>
             `;
        }

        this.groupPlanArea.innerHTML = `
            ${todaysFocusHtml}
            <h3 style="margin-bottom: 1.5rem; text-align: center;">This Week's Schedule</h3>
            <div class="weekly-plan-grid">
                ${plan.map((item, i) => `
                    <div class="plan-day ${i === todayIndex ? 'today' : ''} reveal">
                        <span class="day-name">${item.day}</span>
                        <a href="exercises.html#${item.exercise.id}" class="day-exercise">
                            ${item.exercise.icon} ${item.exercise.title}
                        </a>
                    </div>
                `).join('')}
            </div>
        `;
        this.initRevealOnScroll(); // Re-init to catch new elements
    }

    initRevealOnScroll() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WellnessApp();
});
