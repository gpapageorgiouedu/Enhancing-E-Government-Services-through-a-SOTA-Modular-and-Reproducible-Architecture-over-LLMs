let uploadedFile = null;

document.querySelectorAll('.tabs a').forEach(tab => {
    tab.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.tabs a').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.content-container').forEach(container => container.classList.remove('active'));
        const activeTabContent = document.querySelector(this.getAttribute('href'));
        this.classList.add('active');
        if (activeTabContent) {
            activeTabContent.classList.add('active');
        }
    });
});

document.getElementById('indexing-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const fileInput = this.querySelector('input[name="file"]');
    if (fileInput && fileInput.files.length > 0) {
        uploadedFile = fileInput.files[0];
        fetch('/upload_and_preview', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.content) {
                document.getElementById('document-details-container').style.display = 'block';
                document.getElementById('document-title').textContent = data.fileName || "Document";
                document.getElementById('document-content').innerHTML = data.content.split('\n').join('<br>');
            } else {
                document.getElementById('message').innerText = data.message || "An error occurred.";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('message').innerText = "An error occurred: " + error.message;
        });
    } else {
        document.getElementById('message').innerText = "No file selected.";
    }
});

document.getElementById('confirm-index')?.addEventListener('click', function() {
    if (!uploadedFile) {
        document.getElementById('message').innerText = "No file uploaded.";
        return;
    }
    const formData = new FormData();
    formData.append('file', uploadedFile);
    fetch('/index_file', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('message').innerText = data.message || "An error occurred during indexing.";
        document.getElementById('document-details-container').style.display = 'none';
    })
    .catch(error => {
        console.error('Error during indexing:', error);
        document.getElementById('message').innerText = "An error occurred during indexing: " + error.message;
    });
});

document.getElementById('cancel-index')?.addEventListener('click', function() {
    document.getElementById('document-details-container').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function() {
    const clearButton = document.getElementById('clear-chat-button');
    if (clearButton) {
        clearButton.addEventListener('click', function(event) {
            event.preventDefault();
            clearChat();
        });
    } else {
        console.error('Clear Chat button not found.');
    }
});

function clearChat() {
    console.log("Clear Chat button clicked.");
    fetch('/clear_chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
    .then(response => response.text())
    .then(html => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.innerHTML = html;
            console.log("Chat cleared and HTML updated.");
        }
    })
    .catch(error => {
        console.error('Error clearing chat:', error);
    });
}

document.getElementById('inmemory-file')?.addEventListener('change', function() {
    const formData = new FormData();
    formData.append('file', this.files[0]);

    const fetchWithTimeout = (url, options, timeout = 600000) => {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), timeout)
            )
        ]);
    };

    const uploadMessageElement = document.getElementById('upload-message');
    
    // Clear previous message and display "Processing" message
    uploadMessageElement.innerText = "";
    uploadMessageElement.innerText = "Processing...";

    fetchWithTimeout('/upload_and_index_inmemory', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => { throw new Error(error.detail) });
        }
        return response.json();
    })
    .then(data => {
        uploadMessageElement.innerText = data.message;
    })
    .catch(error => {
        uploadMessageElement.innerText = "Error: " + error.message;
    });
});
