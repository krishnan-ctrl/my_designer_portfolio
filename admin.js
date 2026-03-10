// Authentication Check - Run immediately
if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'admin-login.html';
}

// Helpers for extracting unique IDs from Social Media URLs
function getYouTubeThumbnail(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return null;
}

function getInstagramThumbnail(url) {
    // Matches /p/ID or /reel/ID
    const regExp = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([^/?#&]+)/;
    const match = url.match(regExp);
    if (match && match[1]) {
        // Appending media size query is a lightweight way to get the primary image from an Insta permalink
        return `https://www.instagram.com/p/${match[1]}/media/?size=l`;
    }
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-video-form');
    const alertBox = document.getElementById('alert-box');
    const logoutBtn = document.getElementById('logout-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const submitBtn = document.getElementById('submit-btn');
    const submitBtnSpan = document.querySelector('#submit-btn span');
    const formTitle = document.getElementById('form-title');
    const editingIdInput = document.getElementById('editingId');

    // Run initial render of the management table and inbox
    renderAdminList();
    renderInbox();

    // Logout Functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'admin-login.html';
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get form values
            const title = document.getElementById('title').value.trim();
            const platform = document.getElementById('platform').value;
            const videoUrl = document.getElementById('videoUrl').value.trim();
            const thumbnailUrl = document.getElementById('thumbnailUrl').value.trim();
            const editingId = editingIdInput.value;

            if (!title || !platform || !videoUrl) {
                return;
            }

            // Get existing videos from localStorage
            let existingData = localStorage.getItem('portfolioVideoData');
            let videos = existingData ? JSON.parse(existingData) : [];

            if (editingId) {
                // UPDATE EXISTING VIDEO
                const index = videos.findIndex(v => v.id == editingId);
                if (index !== -1) {
                    videos[index] = {
                        ...videos[index],
                        title: title,
                        platform: platform,
                        thumbnailUrl: thumbnailUrl,
                        videoUrl: videoUrl
                    };
                    alertBox.textContent = "Video successfully updated!";
                }
            } else {
                // CREATE NEW VIDEO
                const newVideo = {
                    id: Date.now(),
                    title: title,
                    platform: platform,
                    thumbnailUrl: thumbnailUrl,
                    videoUrl: videoUrl
                };
                videos.push(newVideo);
                alertBox.textContent = "Video successfully added!";
            }

            // Save back to localStorage
            localStorage.setItem('portfolioVideoData', JSON.stringify(videos));

            // Refresh table
            renderAdminList();

            // Show success message
            alertBox.style.display = 'block';
            alertBox.className = 'alert-success';
            
            // Reset form
            resetForm();

            // Hide alert after 3 seconds
            setTimeout(() => {
                alertBox.style.display = 'none';
            }, 3000);
        });
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', resetForm);
        }
    }

    // Helper to reset form state
    function resetForm() {
        form.reset();
        editingIdInput.value = '';
        submitBtnSpan.textContent = 'Save Video';
        formTitle.innerHTML = 'Add New Video<span class="glow-dot">.</span>';
        if (cancelBtn) cancelBtn.style.display = 'none';
    }
});

// Render the manage list
function renderAdminList() {
    const tableBody = document.getElementById('video-list-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Fetch directly from localStorage
    const savedData = localStorage.getItem('portfolioVideoData');
    if (!savedData) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem; color: var(--text-muted);">No videos found. Use the form to add one.</td></tr>';
        return;
    }

    const videos = JSON.parse(savedData);
    
    if (videos.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem; color: var(--text-muted);">No videos found. Use the form to add one.</td></tr>';
        return;
    }

    videos.forEach(video => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="font-weight: 500; color: var(--text-color);">${video.title}</div>
            </td>
            <td>
                <span style="font-size: 0.85rem; padding: 0.2rem 0.6rem; background: rgba(255,255,255,0.1); border-radius: 12px; color: var(--text-muted);">
                    ${video.platform}
                </span>
            </td>
            <td style="text-align: right;">
                <button onclick="editVideo(${video.id})" class="admin-action-btn edit" title="Edit Video">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteVideo(${video.id})" class="admin-action-btn delete" title="Delete Video">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Global functions attached to window for inline onclick handlers
window.editVideo = function(id) {
    const savedData = localStorage.getItem('portfolioVideoData');
    if (!savedData) return;
    
    const videos = JSON.parse(savedData);
    const video = videos.find(v => v.id == id);
    
    if (video) {
        document.getElementById('editingId').value = video.id;
        document.getElementById('title').value = video.title;
        document.getElementById('platform').value = video.platform;
        document.getElementById('videoUrl').value = video.videoUrl;
        document.getElementById('thumbnailUrl').value = video.thumbnailUrl || '';
        
        document.getElementById('form-title').innerHTML = 'Edit Video<span class="glow-dot">.</span>';
        document.querySelector('#submit-btn span').textContent = 'Update Video';
        document.getElementById('cancel-btn').style.display = 'inline-block';
        
        // Scroll up to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.deleteVideo = function(id) {
    if (confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
        const savedData = localStorage.getItem('portfolioVideoData');
        if (!savedData) return;
        
        let videos = JSON.parse(savedData);
        videos = videos.filter(v => v.id != id);
        
        localStorage.setItem('portfolioVideoData', JSON.stringify(videos));
        
        // Re-render table
        renderAdminList();
    }
};

// Render the messages inbox
function renderInbox() {
    const inboxList = document.getElementById('inbox-list');
    if (!inboxList) return;
    
    inboxList.innerHTML = '';
    
    const savedMessages = localStorage.getItem('portfolioMessages');
    if (!savedMessages) {
        inboxList.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-muted);">No messages yet. Inbox is clean!</div>';
        return;
    }

    const messages = JSON.parse(savedMessages);
    
    if (messages.length === 0) {
        inboxList.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-muted);">No messages yet. Inbox is clean!</div>';
        return;
    }

    // Sort newest messages first (assuming timestamp IDs)
    messages.sort((a, b) => b.id - a.id);

    messages.forEach(msg => {
        const msgBlock = document.createElement('div');
        msgBlock.style.background = 'rgba(255, 255, 255, 0.02)';
        msgBlock.style.border = '1px solid rgba(255, 255, 255, 0.05)';
        msgBlock.style.borderRadius = '12px';
        msgBlock.style.padding = '1.5rem';
        msgBlock.style.position = 'relative';

        msgBlock.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 1rem;">
                <div>
                    <h4 style="margin: 0; color: var(--text-color); font-size: 1.1rem;">${msg.name}</h4>
                    <a href="mailto:${msg.email}" style="color: var(--accent-blue); font-size: 0.9rem; text-decoration: none;">${msg.email}</a>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">${msg.date}</span>
                    <button onclick="deleteMessage(${msg.id})" class="admin-action-btn delete" style="margin: 0; font-size: 1rem;" title="Delete Message">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <p style="color: var(--text-muted); line-height: 1.6; margin: 0; white-space: pre-wrap;">${msg.message}</p>
        `;
        inboxList.appendChild(msgBlock);
    });
}

window.deleteMessage = function(id) {
    if (confirm("Are you sure you want to delete this message?")) {
        const savedMessages = localStorage.getItem('portfolioMessages');
        if (!savedMessages) return;
        
        let messages = JSON.parse(savedMessages);
        messages = messages.filter(m => m.id != id);
        
        localStorage.setItem('portfolioMessages', JSON.stringify(messages));
        
        // Re-render inbox
        renderInbox();
    }
};
