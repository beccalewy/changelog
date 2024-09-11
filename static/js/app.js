document.addEventListener('DOMContentLoaded', () => {
    loadPosts('work');
    loadPosts('personal');
    setupMobileToggle();
});

function setupMobileToggle() {
    const container = document.querySelector('.container');
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle Feed';
    toggleButton.className = 'toggle-feed bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mb-4';
    toggleButton.addEventListener('click', toggleFeed);
    container.insertBefore(toggleButton, container.firstChild);

    if (window.innerWidth <= 768) {
        document.getElementById('work-feed').classList.add('active');
    }
}

function toggleFeed() {
    const workFeed = document.getElementById('work-feed');
    const personalFeed = document.getElementById('personal-feed');
    
    workFeed.classList.toggle('active');
    personalFeed.classList.toggle('active');
}

async function loadPosts(type) {
    const response = await fetch(`/api/posts?type=${type}`);
    const posts = await response.json();
    const postsContainer = document.getElementById(`${type}-posts`);
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'bg-gray-100 p-4 rounded';
        postElement.innerHTML = `
            <p class="mb-2">${post.content}</p>
            ${post.image_url ? `<img src="${post.image_url}" alt="Post image" class="w-full mb-2 rounded">` : ''}
            <small class="text-gray-500">${new Date(post.created_at).toLocaleString()}</small>
        `;
        postsContainer.appendChild(postElement);
    });
}

async function submitPost(type) {
    const input = document.getElementById(`${type}-input`);
    const imageInput = document.getElementById(`${type}-image`);
    const content = input.value.trim();
    
    if (!content) return;
    
    const formData = new FormData();
    formData.append('type', type);
    formData.append('content', content);
    
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }
    
    const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
    });
    
    if (response.ok) {
        input.value = '';
        imageInput.value = '';
        loadPosts(type);
    } else {
        alert('Failed to submit post. Please try again.');
    }
}
