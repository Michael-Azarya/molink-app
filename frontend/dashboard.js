document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Configuration & Page Protection ---
    const API_URL = 'http://localhost:3001'; // CHANGE THIS to your live Render URL for production
    const token = localStorage.getItem('moLINK_token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // --- 2. State Variables ---
    let folders = [];
    let memos = [];
    let selectedFolderId = 'all';
    let alphaSortDirection = 'a-z';
    let itemToDelete = { id: null, type: null };

    // --- 3. DOM Element Selectors ---
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');
    const categoryList = document.getElementById('category-list');
    const addCategoryInput = document.getElementById('new-category-input');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const linkList = document.getElementById('link-list');
    const sortSelect = document.getElementById('sort-by');
    const searchBar = document.getElementById('search-bar'); // Added search bar
    const showAddModalBtn = document.getElementById('show-add-modal-btn');
    const addModal = document.getElementById('add-modal');
    const viewModal = document.getElementById('view-modal');
    const editModal = document.getElementById('edit-modal');
    const deleteModal = document.getElementById('delete-modal');
    const closeButtons = document.querySelectorAll('.close-modal-btn');
    const addLinkForm = document.getElementById('add-link-form');
    const editLinkForm = document.getElementById('edit-link-form');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const linkCategorySelect = document.getElementById('link-category-select');
    const iconChoicesContainer = document.querySelector('#add-modal .icon-choices');
    const editIconChoicesContainer = document.querySelector('#edit-modal .icon-choices');

    // --- 4. API Helper Function ---
    const apiFetch = async (endpoint, options = {}) => {
        options.headers = { ...options.headers, 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('moLINK_token');
            window.location.href = 'login.html';
            throw new Error('Authentication failed');
        }
        if (response.status === 204) return;
        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            const errorData = (contentType && contentType.includes("application/json")) ? await response.json() : { message: 'An unknown error occurred' };
            throw new Error(errorData.message);
        }
        if (contentType && contentType.includes("application/json")) return response.json();
    };

    // --- 5. Folder (Category) Functions ---
    async function fetchAndRenderFolders() {
        try {
            folders = await apiFetch('/api/folders');
            categoryList.innerHTML = '';
            if (!folders.find(f => f.id === selectedFolderId) && selectedFolderId !== 'all') {
                selectedFolderId = 'all';
            }
            const allCatEl = document.createElement('li');
            allCatEl.textContent = 'All';
            allCatEl.dataset.id = 'all';
            allCatEl.dataset.action = 'select-folder';
            if (selectedFolderId === 'all') allCatEl.classList.add('active-category');
            categoryList.appendChild(allCatEl);
            folders.forEach(folder => {
                const folderEl = document.createElement('li');
                folderEl.dataset.id = folder.id;
                folderEl.innerHTML = `<span data-action="select-folder">${folder.name}</span><span class="material-symbols-outlined delete-folder-btn" data-action="delete-folder">delete</span>`;
                if (selectedFolderId === folder.id) folderEl.classList.add('active-category');
                categoryList.appendChild(folderEl);
            });
            fetchAndRenderMemos();
        } catch (error) {
            console.error("Error fetching folders:", error);
            alert('Could not load your folders.');
        }
    }

    async function addFolder() {
        const name = addCategoryInput.value.trim();
        if (!name) return;
        try {
            await apiFetch('/api/folders', { method: 'POST', body: JSON.stringify({ name }) });
            addCategoryInput.value = '';
            fetchAndRenderFolders();
        } catch (error) {
            alert('Failed to create folder.');
        }
    }

    // --- 6. Memo (Link) Functions ---
    async function fetchAndRenderMemos() {
        const searchTerm = searchBar.value;
        let endpoint = '';
        try {
            if (selectedFolderId === 'all') {
                endpoint = '/api/memos';
            } else if (selectedFolderId) {
                endpoint = `/api/memos/${selectedFolderId}`;
            } else {
                memos = [];
                renderMemoList();
                return;
            }
            if (searchTerm) {
                endpoint += `?search=${encodeURIComponent(searchTerm)}`;
            }
            memos = await apiFetch(endpoint);
            renderMemoList();
        } catch (error) {
            console.error("Error fetching memos:", error);
            linkList.innerHTML = '<p>Could not load links.</p>';
        }
    }

    function renderMemoList() {
        let memosToRender = [...memos];
        const sortOrder = sortSelect.value;
        if (sortOrder !== 'alpha') alphaSortDirection = 'a-z';
        memosToRender.sort((a, b) => {
            if (sortOrder === 'latest') return new Date(b.date) - new Date(a.date);
            if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
            if (sortOrder === 'alpha') return alphaSortDirection === 'a-z' ? a.judul.localeCompare(b.judul) : b.judul.localeCompare(a.judul);
        });
        if (sortOrder === 'alpha') alphaSortDirection = alphaSortDirection === 'a-z' ? 'z-a' : 'a-z';

        linkList.innerHTML = '';
        if (memosToRender.length === 0) {
            if (selectedFolderId === 'all') {
                linkList.innerHTML = '<p>You have no links yet. Create a folder and add one!</p>';
            } else {
                linkList.innerHTML = '<p>No links in this folder. Add one!</p>';
            }
            return;
        }
        memosToRender.forEach(memo => {
            const linkEl = document.createElement('div');
            linkEl.className = 'link-item';
            const formattedDate = new Date(memo.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const iconName = memo.icon_name || 'link';
            linkEl.innerHTML = `<div style="display: flex; align-items: center; cursor: pointer; flex-grow: 1;" data-action="view" data-id="${memo.id}"><span class="material-symbols-outlined link-item-icon">${iconName}</span><h4>${memo.judul}</h4></div><p style="margin-left: 34px; color: #666;">${formattedDate}</p><span class="material-symbols-outlined delete-memo-btn" data-action="delete" data-id="${memo.id}">delete</span><span class="material-symbols-outlined edit-memo-btn" data-action="edit" data-id="${memo.id}">edit</span>`;
            linkEl.addEventListener('click', (e) => {
                const target = e.target.closest('[data-action]');
                if (!target) return;
                const action = target.dataset.action;
                const id = target.dataset.id;
                if (!id) return;
                if (action === 'view') showViewModal(id);
                else if (action === 'edit') openEditModal(id);
                else if (action === 'delete') openDeleteModal(id, 'memo');
            });
            linkList.appendChild(linkEl);
        });
    }

    async function showViewModal(memoId) {
        try {
            const memo = await apiFetch(`/api/memo/${memoId}`);
            viewModal.querySelector('#view-title').textContent = memo.judul;
            viewModal.querySelector('#view-description').textContent = memo.deskripsi || 'No description provided.';
            viewModal.querySelector('#view-url').value = memo.link;
            viewModal.querySelector('#go-link-btn').href = memo.link;
            viewModal.querySelector('.modal-icon').textContent = memo.icon_name || 'link';
            viewModal.classList.remove('hidden');
        } catch (error) {
            alert(`Could not load memo details: ${error.message}`);
        }

    }

    async function openEditModal(memoId) {
        try {
            const memo = await apiFetch(`/api/memo/${memoId}`);
            document.getElementById('edit-memo-id').value = memo.id;
            document.getElementById('edit-link-title').value = memo.judul;
            document.getElementById('edit-link-description').value = memo.deskripsi;
            document.getElementById('edit-link-url').value = memo.link;
            const editCategorySelect = document.getElementById('edit-link-category-select');
            editCategorySelect.innerHTML = '';
            folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.id;
                option.textContent = folder.name;
                editCategorySelect.appendChild(option);
            });
            editCategorySelect.value = memo.folder_id;
            editIconChoicesContainer.querySelectorAll('.material-symbols-outlined').forEach(span => {
                span.classList.remove('selected');
                if (span.dataset.iconName === memo.icon_name) span.classList.add('selected');
            });
            editModal.classList.remove('hidden');
        } catch (error) {
            alert(`Could not load memo details for editing: ${error.message}`);
        }
    }

    // --- 7. Unified Delete Functionality ---
    function openDeleteModal(id, type) {
        itemToDelete = { id, type };
        const modalText = deleteModal.querySelector('p');
        modalText.textContent = type === 'folder' ? "This will permanently delete the folder and ALL links inside it. This action cannot be undone." : "This action cannot be undone. You will permanently delete this link.";
        deleteModal.classList.remove('hidden');
    }

    async function confirmDelete() {
        if (!itemToDelete.id || !itemToDelete.type) return;
        const { id, type } = itemToDelete;
        const endpoint = type === 'folder' ? `/api/folders/${id}` : `/api/memos/${id}`;
        try {
            await apiFetch(endpoint, { method: 'DELETE' });
            deleteModal.classList.add('hidden');
            if (type === 'folder') {
                selectedFolderId = 'all';
                fetchAndRenderFolders();
            } else {
                fetchAndRenderMemos();
            }
        } catch (error) {
            alert(`Failed to delete ${type}.`);
        } finally {
            itemToDelete = { id: null, type: null };
        }
    }


    addCategoryBtn.addEventListener('click', addFolder);
    addCategoryInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addFolder(); });
    sortSelect.addEventListener('change', renderMemoList);
    searchBar.addEventListener('input', fetchAndRenderMemos); // Search listener
    logoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('moLINK_token'); window.location.href = 'login.html'; });
    showAddModalBtn.addEventListener('click', () => {
        linkCategorySelect.innerHTML = '';
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            linkCategorySelect.appendChild(option);
        });
        addModal.classList.remove('hidden');
    });
    addLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedIcon = iconChoicesContainer.querySelector('.selected');
        const iconName = selectedIcon ? selectedIcon.dataset.iconName : 'link';
        const memoData = {
            judul: document.getElementById('link-title').value,
            deskripsi: document.getElementById('link-description').value,
            link: document.getElementById('link-url').value,
            folder_id: linkCategorySelect.value,
            icon_name: iconName
        };
        if (!memoData.folder_id) { alert('Please select a folder.'); return; }
        try {
            await apiFetch('/api/memos', { method: 'POST', body: JSON.stringify(memoData) });
            addLinkForm.reset();
            addModal.classList.add('hidden');
            fetchAndRenderMemos();
        } catch (error) {
            alert('Failed to add new link.');
        }
    });
    editLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const memoId = document.getElementById('edit-memo-id').value;
        const selectedIcon = editIconChoicesContainer.querySelector('.selected');
        const iconName = selectedIcon ? selectedIcon.dataset.iconName : 'link';
        const updatedData = {
            judul: document.getElementById('edit-link-title').value,
            deskripsi: document.getElementById('edit-link-description').value,
            link: document.getElementById('edit-link-url').value,
            folder_id: document.getElementById('edit-link-category-select').value,
            icon_name: iconName
        };
        try {
            await apiFetch(`/api/memos/${memoId}`, { method: 'PUT', body: JSON.stringify(updatedData) });
            editModal.classList.add('hidden');
            fetchAndRenderMemos();
        } catch (error) {
            alert('Failed to save changes.');
        }
    });
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
        itemToDelete = { id: null, type: null };
    });
    [iconChoicesContainer, editIconChoicesContainer].forEach(container => {
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('material-symbols-outlined')) {
                container.querySelectorAll('.material-symbols-outlined').forEach(span => span.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        });
    });
    closeButtons.forEach(btn => btn.addEventListener('click', () => {
        addModal.classList.add('hidden');
        viewModal.classList.add('hidden');
        editModal.classList.add('hidden');
        deleteModal.classList.add('hidden');
    }));
    categoryList.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;
        const id = target.closest('li').dataset.id;
        if (action === 'delete-folder') {
            openDeleteModal(id, 'folder');
        } else if (action === 'select-folder') {
            selectedFolderId = id;
            fetchAndRenderFolders();
        }
    });


    function init() {
        const parseJwt = (token) => {
            try { return JSON.parse(atob(token.split('.')[1])); }
            catch (e) { return null; }
        };
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.username) {
            welcomeMessage.textContent = `Welcome Back, ${decodedToken.username}`;
        }
        fetchAndRenderFolders();
    }
    init();
});
