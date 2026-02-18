const DEFAULT_PROMPT = `You are "Warrior Bot", an elite wellness and ergonomics expert for the "Work Warrior" website. 
Your goal is to recommend 2-3 specific exercises from the website's library based on how the user feels.

STRICT RULE: ONLY recommend exercises from the provided list below. Do NOT suggest exercises outside this list.

CRITICAL INSTRUCTION:
You must ALWAYS find a connection to one of the exercises, no matter what the user says.
- If the input is physical (e.g., "my neck hurts"), recommend the direct physical solution.
- If the input is emotional (e.g., "I'm sad", "I'm angry"), connect it to a physical release (e.g., "Open your chest to release grief", "Shake it out to release anger").
- If the input is abstract or nonsense (e.g., "banana", "I hate my boss", "aliens"), find a creative metaphorical bridge (e.g., "That sounds chaotic! Ground yourself with a Tree Pose", or "Let's stretch out that frustration").
- NEVER say "I cannot help" or "I don't understand". BE CREATIVE. EVERYTHING is solvable with movement.

CUSTOMIZATION RULE:
For EACH recommended exercise, you MUST provide a "Warrior Tweak"—a specialized slight adjustment or focus point based on *exactly* what the user said.
Example: "For the Seated Twist, since you mentioned 'lower back pain', focus on lengthening your spine *before* you twist to avoid compression."

Available Exercises:
\${JSON.stringify(EXERCISES)}

Response Format:
1. A brief, encouraging message.
2. The recommendations, with the "Warrior Tweak" clearly listed for each.
3. CRITICAL: Include the exact string "RECOMMENDED_IDS: ["id1", "id2"]" at the end of your response.

Example Opening:
"Warrior Bot here. Even for something like that, movement is the answer..."

RECOMMENDED_IDS: ["seated-twist", "standing-stretch"]`;

class WellnessApp {
    constructor() {
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        this.model = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';
        this.systemPrompt = localStorage.getItem('system_prompt') || DEFAULT_PROMPT;

        this.currentUser = JSON.parse(localStorage.getItem('current_warrior_user')) || null;
        this.history = JSON.parse(localStorage.getItem('warrior_history_' + (this.currentUser?.email || 'anon'))) || [];
        this.isSignup = false;

        // Cookie Logic
        this.cookiesAccepted = localStorage.getItem('warrior_cookies_accepted') === 'true';
        this.siteApiKey = 'AIzaSyAXozqxQrQFmQ7w37k6JGWMXMHwbGImFjo'; // User provided site-wide key


        this.initElements();
        this.initEventListeners();
        this.loadSettings();
        this.updateAuthUI();
        this.initGroups();
        this.checkForSocialNotifications();
        this.initFullscreenPersistence();
        this.initCookieBanner();
        this.initFullscreenPersistence();
        this.initCookieBanner();
        this.initRevealOnScroll();
        this.checkForInviteLink();
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
                        alert('You have successfully joined the group!');
                        this.initGroups();
                    }
                }
            } else {
                // If not logged in, switch to login view and pre-fill code logic if we had a dedicated join flow
                // For now, simpler: alert user to login first
                sessionStorage.setItem('pending_join_code', joinCode);
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
        this.newGroupCodeText = document.getElementById('new-group-code');
        this.newGroupCodeText = document.getElementById('new-group-code');
        this.copyCodeBtn = document.getElementById('copy-code-btn');
        this.copyInviteLinkBtn = document.getElementById('copy-invite-link-btn');
        this.emptyMembersState = document.getElementById('empty-members-state');



        // Mobile Menu Elements
        this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        this.navLinks = document.querySelector('.nav-links');

        // Cookie Elements
        this.cookieBanner = document.getElementById('cookie-banner');
        this.acceptCookiesBtn = document.getElementById('accept-cookies');
        this.declineCookiesBtn = document.getElementById('decline-cookies');

        // Newsletter Section
        this.newsletterSection = document.getElementById('newsletter-section');

        // Group Plan Elements
        this.groupPlanArea = document.getElementById('group-plan-render-area');
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
        if (this.generateCodeBtnLine) this.generateCodeBtnLine.addEventListener('click', () => this.handleGenerateGroupCode());
        if (this.copyCodeBtn) this.copyCodeBtn.addEventListener('click', () => this.handleCopyCode());
        if (this.copyInviteLinkBtn) this.copyInviteLinkBtn.addEventListener('click', () => this.handleCopyInviteLink());



        // Mobile Menu Listeners
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        if (this.navLinks) {
            this.navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => this.toggleMobileMenu(false));
            });
        }

        // Cookie Listeners
        if (this.acceptCookiesBtn) this.acceptCookiesBtn.addEventListener('click', () => this.handleCookieAcceptance(true));
        if (this.declineCookiesBtn) this.declineCookiesBtn.addEventListener('click', () => this.handleCookieAcceptance(false));
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

    handleAuth() {
        const email = this.authEmail.value;
        const password = this.authPassword.value;
        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};

        if (this.isSignup) {
            if (users[email]) {
                alert('User already exists!');
                return;
            }
            const role = this.authRoleSelect ? this.authRoleSelect.value : 'member';
            users[email] = { password, role };
            localStorage.setItem('warrior_users', JSON.stringify(users));
            alert('Account created successfully! Logging you in...');
        } else {
            if (!users[email] || users[email].password !== password) {
                alert('Invalid email or password.');
                return;
            }
        }

        this.currentUser = { email, role: users[email].role };
        localStorage.setItem('current_warrior_user', JSON.stringify(this.currentUser));

        // Load history for this user
        this.history = JSON.parse(localStorage.getItem('warrior_history_' + this.currentUser.email)) || [];

        // Check for pending join code
        const pendingCode = sessionStorage.getItem('pending_join_code');
        if (pendingCode) {
            const currentCode = users[email].groupCode;
            if (currentCode !== pendingCode) {
                if (confirm(`Do you want to join the group "${pendingCode}"?`)) {
                    users[email].groupCode = pendingCode;
                    localStorage.setItem('warrior_users', JSON.stringify(users));
                    alert('You have successfully joined the group!');
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
        } else {
            this.loggedOutGroups.classList.remove('hidden');
            this.loggedInGroups.classList.add('hidden');
            if (this.leaderToolbar) this.leaderToolbar.classList.add('hidden');
        }
    }

    handleCreateGroup() {
        const groupName = this.createGroupNameInput.value.trim();
        if (!groupName) {
            alert('Please enter a group name.');
            return;
        }

        const code = 'WARRIOR-' + Math.random().toString(36).substring(2, 6).toUpperCase();

        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        users[this.currentUser.email].groupCode = code;
        users[this.currentUser.email].groupName = groupName;
        localStorage.setItem('warrior_users', JSON.stringify(users));

        alert(`Group "${groupName}" created! Your code is: ${code}`);
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

        alert('Vibe broadcasted! Your group will see this next time they log in.');
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
            alert('Failed to copy code. Please select and copy manually.');
        });
    }

    handleCopyInviteLink() {
        const users = JSON.parse(localStorage.getItem('warrior_users')) || {};
        const userData = users[this.currentUser.email] || {};
        const code = userData.groupCode || this.newGroupCodeText.innerText;

        if (!code || code === '...') {
            alert('No active group code found to share.');
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
            alert('Failed to copy link. Code is: ' + code);
        });
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
                this.mobileMenuToggle.innerText = '✕';
                document.body.style.overflow = 'hidden'; // Lock scroll
            } else {
                this.navLinks.classList.remove('active');
                this.mobileMenuToggle.innerText = '☰';
                document.body.style.overflow = ''; // Unlock scroll
            }
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
        alert('Newsletter generated and broadcasted to your group!');
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
                    <button class="cheer-btn" onclick="app.handleCheer('${m.name}')">🙌 High Five!</button>
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

        alert('Configuration saved!');
        this.toggleSettings(false);
    }

    async handleGeminiRequest() {
        const feeling = this.feelingInput.value.trim();
        if (!feeling) {
            alert('Please tell me how you are feeling first.');
            return;
        }

        if (!this.apiKey && !this.cookiesAccepted) {
            // Optional: Auto-show banner but allow proceeding if we have a site key
            this.showCookieBanner();
        }

        // Use User Key if available, otherwise use Site Key
        // NOTE for User: We allow site key usage even if cookies aren't explicitly accepted in UI yet, 
        // to reduce friction. Ensure this aligns with your privacy policy.
        const effectiveApiKey = this.apiKey || this.siteApiKey;

        if (!effectiveApiKey || effectiveApiKey.startsWith('AIzaSy_PLACEHOLDER')) {
            if (!this.apiKey) {
                alert('Site-wide API Key is missing. Please ask the administrator to configure it.');
                // For the developer:
                console.warn('CRITICAL: You need to set "this.siteApiKey" in the constructor or "const SITE_API_KEY" at the top of app.js');
            } else {
                alert('Your personal API Key seems invalid or missing.');
            }
            this.toggleSettings(true);
            return;
        }

        this.setLoading(true);

        try {
            const response = await this.callGemini(feeling, effectiveApiKey);
            this.renderResult(response);
        } catch (error) {
            console.error(error);
            let errorMsg = error.message;
            if (errorMsg.includes('not found') || errorMsg.includes('supported')) {
                errorMsg += '\n\nTIP: Your API key might not have access to this specific model name. Try clicking the "Check Available Models" button in Settings to find models your key supports.';
            } else if (errorMsg.includes('API key not valid')) {
                errorMsg += '\n\nThe configured API key is invalid.';
            }
            alert('Warrior Bot failed to generate a recommendation: ' + errorMsg);
        } finally {
            this.setLoading(false);
        }
    }

    initCookieBanner() {
        if (!this.cookieBanner) {
            this.injectCookieBannerHTML();
        }
        if (!this.cookiesAccepted && !localStorage.getItem('warrior_cookies_declined')) {
            this.showCookieBanner();
        }
    }

    injectCookieBannerHTML() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner hidden';
        banner.innerHTML = `
            <div class="cookie-content">
                <div class="cookie-text">
                    <h4>✨ Enable Warrior Bot Features</h4>
                    <p>Experience personalized wellness recommendations powered by Warrior Bot AI. By accepting, you can use all AI features immediately using our site-wide configuration.</p>
                </div>
                <div class="cookie-actions">
                    <button id="accept-cookies" class="primary-btn">Accept & Enable</button>
                    <button id="decline-cookies" class="secondary-btn">Maybe later</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
        this.cookieBanner = banner;
        this.acceptCookiesBtn = document.getElementById('accept-cookies');
        this.declineCookiesBtn = document.getElementById('decline-cookies');

        // Add listeners for injected elements
        if (this.acceptCookiesBtn) this.acceptCookiesBtn.addEventListener('click', () => this.handleCookieAcceptance(true));
        if (this.declineCookiesBtn) this.declineCookiesBtn.addEventListener('click', () => this.handleCookieAcceptance(false));
    }

    showCookieBanner() {
        if (this.cookieBanner) {
            this.cookieBanner.classList.remove('hidden');
        }
    }

    handleCookieAcceptance(accepted) {
        if (accepted) {
            this.cookiesAccepted = true;
            localStorage.setItem('warrior_cookies_accepted', 'true');
            localStorage.removeItem('warrior_cookies_declined');
            alert('Cookies accepted! You can now use Gemini features without an API key.');

            // If user has entered text, auto-trigger the recommendation
            if (this.feelingInput && this.feelingInput.value.trim()) {
                this.handleGeminiRequest();
            }
        } else {
            localStorage.setItem('warrior_cookies_declined', 'true');
        }
        if (this.cookieBanner) {
            this.cookieBanner.classList.add('hidden');
        }
    }


    setLoading(isLoading) {
        if (isLoading) {
            this.loadingOverlay.classList.remove('hidden');
        } else {
            this.loadingOverlay.classList.add('hidden');
        }
    }

    async callGemini(feeling, apiKey) {
        // Log outgoing request for debugging
        console.log(`Calling Gemini with model: ${this.model} using v1beta`);
        const usedKey = apiKey || this.apiKey;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${usedKey}`;




        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${this.systemPrompt}\n\nUser Input: "${feeling}"`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const err = await response.json();
                console.error('Gemini Error Response:', err);
                throw new Error(err.error?.message || 'Gemini API Error');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Fecth Error:', error);
            throw error;
        }
    }

    async fetchModels() {
        if (!this.apiKeyInput.value.trim()) {
            alert('Please enter an API key first.');
            return;
        }

        this.modelDebug.innerText = 'Fetching models...';
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKeyInput.value.trim()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch models: ' + response.statusText);
            const data = await response.json();

            if (!data.models) throw new Error('No models found for this API key. Ensure the Gemini API is enabled in your Google AI Studio project.');

            const models = data.models
                .map(m => m.name.replace('models/', ''))
                .filter(name => name.includes('gemini') && name.includes('1.5'));

            if (models.length === 0) {
                this.modelDebug.innerHTML = '<span style="color:#ef4444">No Gemini 1.5 models found. Check your API key permissions.</span>';
                return;
            }

            // Clear and repopulate dropdown
            this.modelInput.innerHTML = '';
            models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.innerText = m;
                this.modelInput.appendChild(opt);
            });

            this.modelDebug.innerHTML = `<span style="color:#22c55e">✓ Successfully found ${models.length} models.</span><br>The dropdown has been updated with your available models. Select one and click Save.`;
            this.modelInput.value = models[0];
            console.log('Available Models:', models);
        } catch (error) {
            this.modelDebug.innerHTML = `<div style="color:#ef4444; font-size: 0.9rem;">
                <strong>Error:</strong> ${error.message}<br><br>
                1. Verify your key at <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--primary)">AI Studio</a><br>
                2. Ensure "Generative Language API" is enabled.<br>
                3. Your region might not support specific models.
            </div>`;
            console.error(error);
        }
    }

    renderResult(text) {
        this.resultSection.classList.remove('hidden');

        // Parse IDs from response with more robust regex (multiline, flexible spacing)
        // Matches: RECOMMENDED_IDS: [ ... ]
        const idMatch = text.match(/RECOMMENDED_IDS:\s*\[(.*?)\]/s);
        let recommendedIds = [];
        let displayMsg = text;

        if (idMatch) {
            // content inside dashes
            const rawContent = idMatch[1];
            recommendedIds = rawContent.split(',').map(id => {
                // Clean up: remove quotes (single, double, smart), whitespace, newlines
                return id.trim().replace(/['"“”‘’]/g, '').replace(/\s/g, '');
            });
            // Remove the ID block from the display message
            displayMsg = text.split(/RECOMMENDED_IDS:/)[0].trim();
        } else {
            // Fallback: simple text search for IDs if strict block missing
            console.warn("Could not find RECOMMENDED_IDS block. Attempting fallback.");
            EXERCISES.forEach(ex => {
                if (text.includes(ex.id) || text.includes(`"${ex.id}"`)) {
                    recommendedIds.push(ex.id);
                }
            });
        }

        this.geminiResponse.innerHTML = `<p>${displayMsg.replace(/\n/g, '<br>')}</p>`;

        // Render cards
        this.exerciseList.innerHTML = '';

        // Filter exercises. Robust fuzzy match if exact match fails.
        let selectedExercises = EXERCISES.filter(ex => recommendedIds.includes(ex.id));

        // If exact match failed, try finding exercises where the ID is mentioned in the bot's raw text 
        // (sometimes bot mentions "Try the Seated Twist" without putting it in the array correctly)
        if (selectedExercises.length === 0) {
            selectedExercises = EXERCISES.filter(ex => {
                // Check if title or ID appears in text (case insensitive)
                const lowerText = text.toLowerCase();
                return lowerText.includes(ex.title.toLowerCase()) || lowerText.includes(ex.id);
            });
        }

        if (selectedExercises.length === 0) {
            // UNIVERSAL FALLBACK: If AI fails or user input is too obscure,
            // we MUST provide something. We default to the "Anti-Sit Stretch" and "Box Breathing"
            // as they are universally beneficial.
            console.warn("AI parsing failed. Engaging Universal Fallback.");

            selectedExercises = EXERCISES.filter(ex => ['standing-stretch', 'box-breathing'].includes(ex.id));

            if (!displayMsg || displayMsg.length < 10) {
                displayMsg = "I couldn't find a direct match in my database, but these two exercises are my universal prescription for resetting the body and mind.";
            } else {
                displayMsg += "<br><br><em>(I've added my top universal recommendations for you below.)</em>";
            }

            this.geminiResponse.innerHTML = `<p>${displayMsg}</p>`;
        }

        if (selectedExercises.length > 0) {
            // Save to history if logged in
            this.saveToHistory(displayMsg, selectedExercises);

            // --- CLEAN INTERFACE: QUICK ACTION ---
            // Create a prominent "Start Now" card for the FIRST recommendation
            const topPick = selectedExercises[0];
            const quickActionHtml = `
                <div class="action-highlight-card">
                    <div style="font-size: 2.5rem;">${topPick.icon}</div>
                    <div class="action-content">
                        <h4>Warrior Bot Suggested</h4>
                        <h3>${topPick.title}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0;">Perfect for how you're feeling right now.</p>
                    </div>
                    <a href="exercises.html#${topPick.id}" class="action-btn">
                        Start Now <span>→</span>
                    </a>
                </div>
            `;
            // Prepend this to the exercise list container, or place it before the grid
            // Here we will insert it as the first child of exerciseList for visibility
            this.exerciseList.insertAdjacentHTML('afterbegin', quickActionHtml);
        }

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
