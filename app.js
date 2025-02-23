// Initialize Supabase client
const SUPABASE_URL = 'https://ygegljvtuwcgcgilflja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnZWdsanZ0dXdjZ2NnaWxmbGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NTQxNTQsImV4cCI6MjA1NTEzMDE1NH0.mpEjIeRqiH06SZ8TmtvvudLHcd6EqBAWvUmep71FhxI';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let userPoints = 0;

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const userEmail = document.getElementById('userEmail');
const pointsBalance = document.getElementById('pointsBalance');
const withdrawalButton = document.getElementById('withdrawalButton');
const loginPromptModal = document.getElementById('loginPromptModal');
const modalLoginButton = document.getElementById('modalLoginButton');
const closeModalButtons = document.querySelectorAll('.close-modal');
const profileButton = document.getElementById('profileButton');
const profileModal = document.getElementById('profileModal');
const profileEmail = document.getElementById('profileEmail');
const profilePoints = document.getElementById('profilePoints');
const toolsUsed = document.getElementById('toolsUsed');
const memberSince = document.getElementById('memberSince');
const activityList = document.getElementById('activityList');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const profileSettingsForm = document.getElementById('profileSettingsForm');
const changeAvatarBtn = document.getElementById('changeAvatarBtn');
const userAvatar = document.getElementById('userAvatar');
const copyReferralBtn = document.getElementById('copyReferralBtn');
const referralCode = document.getElementById('referralCode');
const totalReferrals = document.getElementById('totalReferrals');
const referralPoints = document.getElementById('referralPoints');
const referralEntry = document.getElementById('referralEntry');
const enterReferralCode = document.getElementById('enterReferralCode');
const applyReferralBtn = document.getElementById('applyReferralBtn');

// Event Listeners
loginButton.addEventListener('click', handleLogin);
logoutButton.addEventListener('click', handleLogout);
modalLoginButton.addEventListener('click', handleLogin);
closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        loginPromptModal.classList.add('hidden');
    });
});

document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => handleToolClick(card.dataset.tool));
});

profileButton.addEventListener('click', () => {
    updateProfileInfo();
    loadProfileData();
    profileModal.classList.remove('hidden');
});

// Tab switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show selected tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}Tab`) {
                content.classList.add('active');
            }
        });
    });
});

// Handle avatar change
changeAvatarBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Upload to Supabase Storage
                const { data, error } = await supabase.storage
                    .from('avatars')
                    .upload(`${currentUser.id}/${file.name}`, file);

                if (error) throw error;

                // Get public URL
                const { publicURL } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(`${currentUser.id}/${file.name}`);

                // Update user profile
                await supabase
                    .from('user_profiles')
                    .upsert({
                        user_id: currentUser.id,
                        avatar_url: publicURL
                    });

                userAvatar.src = publicURL;
            } catch (error) {
                console.error('Error uploading avatar:', error);
                alert('Failed to upload avatar. Please try again.');
            }
        }
    };

    input.click();
});

// Handle settings form submission
profileSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        user_id: currentUser.id,
        display_name: e.target.displayName.value,
        bio: e.target.bio.value,
        email_notifications: e.target.emailNotifications.checked,
        activity_updates: e.target.activityUpdates.checked,
        theme: e.target.theme.value
    };

    try {
        const { error } = await supabase
            .from('user_profiles')
            .upsert(formData);

        if (error) throw error;

        alert('Profile settings saved successfully!');
    } catch (error) {
        console.error('Error saving profile settings:', error);
        alert('Failed to save settings. Please try again.');
    }
});

// Login Handler
async function handleLogin() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: {
                    client_id: '253948026142-4tggh9her6e1pj9l9mkjp1ds684eg3as.apps.googleusercontent.com'
                }
            }
        });

        if (error) throw error;
        
        // User data will be handled in the auth state change listener
    } catch (error) {
        console.error('Error logging in:', error.message);
        alert('Failed to login. Please try again.');
    }
}

// Logout Handler
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        showLoginScreen();
    } catch (error) {
        console.error('Error logging out:', error.message);
        alert('Failed to logout. Please try again.');
    }
}

// Tool Click Handler
async function handleToolClick(tool) {
    if (!currentUser) {
        loginPromptModal.classList.remove('hidden');
        return;
    }

    // Add points for using a tool
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ points: userPoints + 100 })
            .eq('id', currentUser.id);

        if (error) throw error;

        userPoints += 100;
        updatePointsDisplay();
        checkWithdrawalEligibility();

        // Handle specific tool functionality
        switch(tool) {
            case 'background-eraser':
                // Implement background eraser functionality
                break;
            case 'compressor':
                // Implement image compressor functionality
                break;
            case 'converter':
                // Implement image converter functionality
                break;
            case 'passport':
                // Implement passport photo creator functionality
                break;
            case 'dress-change':
                // Implement dress change functionality
                break;
        }

        // Add activity record
        await supabase
            .from('user_stats')
            .upsert({
                user_id: currentUser.id,
                tools_used: increment('tools_used'),
                activities: array_append('activities', {
                    type: 'tool_use',
                    description: `Used ${tool} tool`,
                    timestamp: new Date().toISOString()
                })
            });
    } catch (error) {
        console.error('Error updating points:', error.message);
        alert('Failed to update points. Please try again.');
    }
}

// UI Updates
function showDashboard() {
    loginContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
}

function showLoginScreen() {
    loginContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
}

function updatePointsDisplay() {
    pointsBalance.textContent = `Points: ${userPoints}`;
}

function checkWithdrawalEligibility() {
    if (userPoints >= 1000000) {
        withdrawalButton.classList.remove('hidden');
    } else {
        withdrawalButton.classList.add('hidden');
    }
}

// Add this function to show/hide Google One Tap
function handleGoogleOneTap() {
    if (!currentUser) {
        // Initialize Google One Tap
        google.accounts.id.initialize({
            client_id: '253948026142-4tggh9her6e1pj9l9mkjp1ds684eg3as.apps.googleusercontent.com',
            callback: handleGoogleOneTapSignIn,
            auto_select: true,
            cancel_on_tap_outside: false
        });

        // Display the One Tap dialog
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // If One Tap is not displayed or skipped, show the normal sign-in button
                document.querySelector('.g_id_signin').style.display = 'block';
            }
        });
    } else {
        // Hide One Tap if user is already signed in
        google.accounts.id.cancel();
        document.querySelector('.g_id_signin').style.display = 'none';
    }
}

// Update the Google One Tap Sign In Handler
async function handleGoogleOneTapSignIn(response) {
    try {
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
            nonce: 'NONCE', // Replace with a secure nonce if needed
        });

        if (error) throw error;

        // Hide the One Tap UI after successful sign-in
        google.accounts.id.cancel();
        
        // The auth state change listener will handle the rest
    } catch (error) {
        console.error('Error with One Tap sign in:', error.message);
        alert('Failed to sign in. Please try again.');
    }
}

// Update Auth State Change Listener
supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        userEmail.textContent = currentUser.email;

        // Close login prompt modal if it's open
        loginPromptModal.classList.add('hidden');

        // Fetch user points from database
        const { data, error } = await supabase
            .from('users')
            .select('points')
            .eq('id', currentUser.id)
            .single();

        if (!error && data) {
            userPoints = data.points;
            updatePointsDisplay();
            checkWithdrawalEligibility();
        } else {
            // Create new user record if it doesn't exist
            const { error: createError } = await supabase
                .from('users')
                .insert([
                    { id: currentUser.id, email: currentUser.email, points: 0 }
                ]);
            
            if (!createError) {
                userPoints = 0;
                updatePointsDisplay();
            }
        }

        showDashboard();

        // Check if user was referred
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('ref');
        if (referralCode) {
            enterReferralCode.value = referralCode;
            referralEntry.classList.remove('hidden');
        }

        // Hide Google One Tap
        google.accounts.id.cancel();
        document.querySelector('.g_id_signin').style.display = 'none';
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        userPoints = 0;
        showLoginScreen();

        // Show Google One Tap
        handleGoogleOneTap();
    }
});

// Call handleGoogleOneTap when the page loads
document.addEventListener('DOMContentLoaded', () => {
    handleGoogleOneTap();
});

// Update profile information
async function updateProfileInfo() {
    if (!currentUser) return;

    profileEmail.textContent = currentUser.email;
    profilePoints.textContent = userPoints;

    try {
        // Fetch user stats from Supabase
        const { data, error } = await supabase
            .from('user_stats')
            .select('tools_used, created_at, activities')
            .eq('user_id', currentUser.id)
            .single();

        if (error) throw error;

        if (data) {
            toolsUsed.textContent = data.tools_used || 0;
            memberSince.textContent = new Date(data.created_at).toLocaleDateString();
            
            // Update activity list
            activityList.innerHTML = '';
            const activities = data.activities || [];
            activities.slice(0, 5).forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                    <div class="activity-details">
                        <div>${activity.description}</div>
                        <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
                    </div>
                `;
                activityList.appendChild(activityItem);
            });
        }
    } catch (error) {
        console.error('Error fetching user stats:', error);
    }
}

// Helper function to get activity icons
function getActivityIcon(type) {
    const icons = {
        'tool_use': 'fa-tools',
        'points_earned': 'fa-star',
        'login': 'fa-sign-in-alt',
        'withdrawal': 'fa-wallet'
    };
    return icons[type] || 'fa-circle';
}

// Update loadProfileData function
async function loadProfileData() {
    if (!currentUser) return;

    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();

        if (error) throw error;

        if (data) {
            // Update form fields
            profileSettingsForm.displayName.value = data.display_name || '';
            profileSettingsForm.bio.value = data.bio || '';
            profileSettingsForm.emailNotifications.checked = data.email_notifications;
            profileSettingsForm.activityUpdates.checked = data.activity_updates;
            profileSettingsForm.theme.value = data.theme || 'light';

            // Update avatar
            if (data.avatar_url) {
                userAvatar.src = data.avatar_url;
            }

            // Update referral information
            referralCode.value = data.referral_code || generateReferralCode(currentUser.email);
            totalReferrals.textContent = data.total_referrals || 0;
            referralPoints.textContent = data.referral_points || 0;

            // If no referral code exists, create one
            if (!data.referral_code) {
                await supabase.from('user_profiles').update({
                    referral_code: referralCode.value
                }).eq('user_id', currentUser.id);
            }
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

// Generate referral code
function generateReferralCode(email) {
    return email.split('@')[0] + Math.random().toString(36).substring(2, 6);
}

// Copy referral code
copyReferralBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(referralCode.value);
        copyReferralBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyReferralBtn.classList.add('copy-success');
        setTimeout(() => {
            copyReferralBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyReferralBtn.classList.remove('copy-success');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
});

// Apply referral code
applyReferralBtn.addEventListener('click', async () => {
    const code = enterReferralCode.value.trim();
    if (!code) return;

    try {
        // Check if code exists and is valid
        const { data: referrer, error } = await supabase
            .from('user_profiles')
            .select('user_id, referral_code')
            .eq('referral_code', code)
            .single();

        if (error || !referrer) {
            alert('Invalid referral code');
            return;
        }

        // Update referrer's stats
        await supabase.from('user_profiles').update({
            total_referrals: increment('total_referrals'),
            referral_points: increment('referral_points', 1000)
        }).eq('user_id', referrer.user_id);

        // Add bonus points to new user
        await supabase.from('users').update({
            points: increment('points', 500)
        }).eq('id', currentUser.id);

        // Record referral relationship
        await supabase.from('referrals').insert({
            referrer_id: referrer.user_id,
            referred_id: currentUser.id,
            points_earned: 1000
        });

        alert('Referral code applied successfully! You received 500 bonus points.');
        referralEntry.classList.add('hidden');
    } catch (error) {
        console.error('Error applying referral:', error);
        alert('Failed to apply referral code');
    }
}); 