document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/contacts/';

    let contacts = [];

    const contactForm = document.getElementById('contactForm');
    const validationMessage = document.getElementById('validationMessage');
    const contactsList = document.getElementById('contactsList');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const emptyState = document.getElementById('emptyState');

    fetchContacts();

    contactForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', renderContacts);
    sortSelect.addEventListener('change', renderContacts);

    async function fetchContacts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch contacts');
            const data = await response.json();
            contacts = data.contacts || [];
            renderContacts();
        } catch (error) {
            console.error('Error:', error);
            showValidationMessage('Error loading contacts. Please try again.', 'error');
        }
    }

    async function saveContact(contact) {
        const url = contact.id ? '/api/update/' : '/api/add/';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contact)
            });

            if (!response.ok) throw new Error('Failed to save contact');

            await fetchContacts();
            resetForm();
            showValidationMessage('Contact saved successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showValidationMessage('Error saving contact.', 'error');
        }
    }

    async function deleteContact(id) {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            const response = await fetch('/api/delete/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            if (!response.ok) throw new Error('Failed to delete contact');

            await fetchContacts();
            showValidationMessage('Contact deleted.', 'success');
        } catch (error) {
            console.error('Error:', error);
            showValidationMessage('Error deleting contact.', 'error');
        }
    }

    async function toggleFavorite(contact) {
        try {
            const response = await fetch('/api/favorite/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: contact.id })
            });

            if (!response.ok) throw new Error('Failed to toggle favorite');

            await fetchContacts();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('contactId').value;
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();

        if (!name) {
            showValidationMessage('Name is required.', 'error');
            return;
        }

        const phoneRegex = /^[0-9+\s()-]+$/;
        if (!phoneRegex.test(phone)) {
            showValidationMessage('Phone must be valid.', 'error');
            return;
        }

        if (email && !email.includes('@')) {
            showValidationMessage('Email must be valid.', 'error');
            return;
        }

        const contactData = {
            name,
            phone,
            email,
            address,
            favorite: id ? getContactById(id).favorite : false
        };

        if (id) contactData.id = id;

        saveContact(contactData);
    }

    function showValidationMessage(msg, type) {
        validationMessage.textContent = msg;
        validationMessage.style.color = type === 'error' ? 'var(--danger-color)' : 'var(--success-color)';
        setTimeout(() => {
            validationMessage.textContent = '';
        }, 3000);
    }

    function resetForm() {
        contactForm.reset();
        document.getElementById('contactId').value = '';
        document.querySelector('.card-header h2').textContent = 'Add Contact';
    }

    function fillForm(contact) {
        document.getElementById('contactId').value = contact.id || '';
        document.getElementById('name').value = contact.name || '';
        document.getElementById('phone').value = contact.phone || '';
        document.getElementById('email').value = contact.email || '';
        document.getElementById('address').value = contact.address || '';
        document.querySelector('.card-header h2').textContent = 'Edit Contact';
    }

    function getContactById(id) {
        return contacts.find(c => c.id == id);
    }

    function renderContacts() {
        const query = searchInput.value.toLowerCase();
        const sortBy = sortSelect.value;

        let filtered = contacts.filter(contact =>
            contact.name.toLowerCase().includes(query) ||
            contact.phone.replace(/\D/g, '').includes(query)
        );

        filtered.sort((a, b) => {
            if (a.favorite && !b.favorite) return -1;
            if (!a.favorite && b.favorite) return 1;

            if (sortBy === 'az') {
                return a.name.localeCompare(b.name);
            } else {
                return (b.id || 0) - (a.id || 0);
            }
        });

        contactsList.innerHTML = '';

        if (filtered.length === 0) {
            emptyState.style.display = 'block';
            return;
        } else {
            emptyState.style.display = 'none';
        }

        filtered.forEach(contact => {
            const el = createContactElement(contact);
            contactsList.appendChild(el);
        });
    }

    function createContactElement(contact) {
        const div = document.createElement('div');
        div.className = `contact-item ${contact.favorite ? 'favorite' : ''}`;

        const initial = contact.name.charAt(0).toUpperCase();

        div.innerHTML = `
            <div class="avatar">${initial}</div>
            <div class="info">
                <h4 class="name">${escapeHtml(contact.name)}</h4>
                <p class="phone">${escapeHtml(contact.phone)}</p>
                ${contact.email ? `<p class="email">${escapeHtml(contact.email)}</p>` : ''}
            </div>
            <div class="actions">
                <button class="btn-icon fav-btn ${contact.favorite ? 'active' : ''}" title="Favorite">★</button>
                <button class="btn-icon edit-btn" title="Edit">✎</button>
                <button class="btn-icon delete-btn" title="Delete">🗑</button>
            </div>
        `;

        div.querySelector('.fav-btn').addEventListener('click', () => toggleFavorite(contact));
        div.querySelector('.edit-btn').addEventListener('click', () => fillForm(contact));
        div.querySelector('.delete-btn').addEventListener('click', () => deleteContact(contact.id));

        return div;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }
});
