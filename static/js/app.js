const isAdminPage = window.location.pathname === '/admin';

async function submitPost(type) {
    const input = document.getElementById(`${type}-input`);
    const imageInput = document.getElementById(`${type}-image`);
    const content = input.value.trim();
    
    if (!content) {
        alert('Post content cannot be empty.');
        return;
    }
    
    const formData = new FormData();
    formData.append('type', type);
    formData.append('content', content);
    
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }
    
    const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData
    });
    
    if (response.ok) {
        input.value = '';
        imageInput.value = '';
        document.getElementById(`${type}-file-name`).textContent = '';
        loadPosts(type);
    } else {
        alert('Failed to submit post. Please try again.');
    }
}

function convertUrlsToLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
}

async function loadPosts(type) {
    const response = await fetch(`/api/posts?type=${type}`);
    const posts = await response.json();
    const postsContainer = document.getElementById(`${type}-posts`);
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = `p-4 rounded mb-4 ${type === 'work' ? 'bg-blue-100' : 'bg-green-100'}`;
        postElement.setAttribute('data-post-id', post.id);
        postElement.innerHTML = `
            <p class="mb-2 ${type === 'work' ? 'text-blue-800 font-semibold' : 'text-green-800'}">${convertUrlsToLinks(post.content)}</p>
            ${post.image_url ? `<img src="${post.image_url}" alt="Post image" class="w-full mb-2 rounded">` : ''}
            <small class="text-gray-600">${new Date(post.created_at).toLocaleString()}</small>
            ${isAdminPage ? `
            <div class="mt-2">
                <button onclick="openEditModal(${post.id}, '${type}', '${post.content.replace(/'/g, "\\'")}')" class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">Edit</button>
                <button onclick="deletePost(${post.id}, '${type}')" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
            </div>
            ` : ''}
        `;
        postsContainer.appendChild(postElement);
    });
}

async function deletePost(postId, type) {
    if (confirm('Are you sure you want to delete this post?')) {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            loadPosts(type);
        } else {
            alert('Failed to delete post. Please try again.');
        }
    }
}

let currentEditPostId = null;
let currentEditPostType = null;

function openEditModal(postId, type, content) {
    currentEditPostId = postId;
    currentEditPostType = type;
    const modal = document.getElementById('edit-modal');
    const editContent = document.getElementById('edit-content');
    editContent.value = content;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cancelEdit() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentEditPostId = null;
    currentEditPostType = null;
}

async function saveEdit() {
    const editContent = document.getElementById('edit-content');
    const newContent = editContent.value.trim();
    
    if (!newContent) {
        alert('Post content cannot be empty.');
        return;
    }
    
    const response = await fetch(`/api/posts/${currentEditPostId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
    });
    
    if (response.ok) {
        cancelEdit();
        loadPosts(currentEditPostType);
    } else {
        alert('Failed to edit post. Please try again.');
    }
}

function setupMobileToggle() {
    const toggleButton = document.getElementById('toggle-feed');
    const workFeed = document.getElementById('work-feed');
    const personalFeed = document.getElementById('personal-feed');

    if (toggleButton && workFeed && personalFeed) {
        function updateFeedVisibility() {
            if (window.innerWidth <= 768) {
                if (!workFeed.classList.contains('active') && !personalFeed.classList.contains('active')) {
                    workFeed.classList.add('active');
                }
                toggleButton.style.display = 'block';
            } else {
                workFeed.classList.remove('active');
                personalFeed.classList.remove('active');
                toggleButton.style.display = 'none';
            }
        }

        updateFeedVisibility();

        toggleButton.addEventListener('click', () => {
            workFeed.classList.toggle('active');
            personalFeed.classList.toggle('active');
        });

        window.addEventListener('resize', updateFeedVisibility);
    }
}

function setupFileInputs() {
    ['work', 'personal'].forEach(type => {
        const fileInput = document.getElementById(`${type}-image`);
        const fileNameSpan = document.getElementById(`${type}-file-name`);
        
        if (fileInput && fileNameSpan) {
            fileInput.addEventListener('change', (event) => {
                if (event.target.files.length > 0) {
                    fileNameSpan.textContent = event.target.files[0].name;
                } else {
                    fileNameSpan.textContent = '';
                }
            });
        }
    });
}

async function updateSubtitle() {
    const subtitleInput = document.getElementById('subtitle');
    const newSubtitle = subtitleInput.value.trim();

    const response = await fetch('/api/subtitle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subtitle: newSubtitle }),
    });

    if (response.ok) {
        alert('Subtitle updated successfully!');
    } else {
        alert('Failed to update subtitle. Please try again.');
    }
}

async function loadSubtitle() {
    const response = await fetch('/api/subtitle');
    if (response.ok) {
        const data = await response.json();
        const subtitleElement = document.getElementById('subtitle');
        if (subtitleElement) {
            subtitleElement.textContent = data.subtitle;
        }
        const subtitleInput = document.getElementById('subtitle');
        if (subtitleInput) {
            subtitleInput.value = data.subtitle;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPosts('work');
    loadPosts('personal');
    setupMobileToggle();
    loadSubtitle();
    if (isAdminPage) {
        setupFileInputs();
    }
});
