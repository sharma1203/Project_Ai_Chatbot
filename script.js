document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication Check ---
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return; // Stop script execution if not logged in
    }

     // --- DOM Element Selection ---
    const promptInput = document.querySelector("#prompt");
    const submitBtn = document.querySelector("#submit-btn");
    const chatContainer = document.querySelector(".chat-container");
    const imageBtn = document.querySelector("#image-btn");
    const imageInput = document.querySelector("#image-input");
    const imagePreview = document.querySelector("#image-preview");
    const logoutBtn = document.querySelector("#logout-btn");
    const usernameDisplay = document.querySelector("#username-display");

    // --- User and API Configuration ---
    // Per user instructions, this API section is not to be changed.
    const API_KEY = "AIzaSyA4oPZ2rCYMCqPJh9YWGuLaoqiHDTDipCs"; // ⚠️ IMPORTANT: In a production environment, this should be handled securely on a backend server.
    const Api_Url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    let user = {
        message: null,
        file: null // { mime_type, data }
    };

    // --- Initial Setup ---
    usernameDisplay.textContent = localStorage.getItem('username');
    promptInput.addEventListener("input", autoResizeTextarea);
    promptInput.addEventListener("keydown", handleKeyDown);
    submitBtn.addEventListener("click", handleChatSubmission);
    imageBtn.addEventListener("click", () => imageInput.click());
    imageInput.addEventListener("change", handleImageUpload);
    logoutBtn.addEventListener("click", handleLogout);

    // --- Core Functions ---

    function handleChatSubmission() {
        const userMessage = promptInput.value.trim();
        if (!userMessage && !user.file) return;

        user.message = userMessage;
        appendMessage('user', user.message, user.file);
        
        promptInput.value = "";
        resetImageUpload();
        autoResizeTextarea();

        const aiChatBox = appendMessage('ai', null); // Append a loading state
        
        // Add a slight delay for a more natural feel before calling the API
        setTimeout(() => {
            generateResponse(aiChatBox);
        }, 600);
    }
    
    // Per user instructions, this API call function is not to be changed.
    // I have only improved the DOM manipulation around it for better UX.
    async function generateResponse(aiChatBox) {
        const textContainer = aiChatBox.querySelector(".chat-area");
    
        const contentParts = [{ text: user.message }];
        if (user.file) {
            contentParts.push({
                inline_data: {
                    mime_type: user.file.mime_type,
                    data: user.file.data
                }
            });
        }

        const requestOptions = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "contents": [{ "parts": contentParts }] })
        };

        try {
            const response = await fetch(Api_Url, requestOptions);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            
            if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                let apiResponse = data.candidates[0].content.parts[0].text;
                // A proper markdown library would be better for a production app.
                textContainer.innerHTML = apiResponse
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');
            } else {
                textContainer.textContent = "Sorry, I couldn't generate a response. Please try again.";
            }
        } catch (error) {
            console.error("API call failed:", error);
            textContainer.textContent = "An error occurred. Please check your API key and network connection.";
        } finally {
            scrollToBottom();
            user.file = null; // Clear user file after processing
        }
    }

    // --- Helper & UI Functions ---

    function appendMessage(sender, message, file = null) {
        const isUser = sender === 'user';
        const chatBox = document.createElement("div");
        chatBox.classList.add("chat-box", isUser ? "user-chat-box" : "ai-chat-box");

        let imageHTML = '';
        if (file) {
            imageHTML = `<img src="data:${file.mime_type};base64,${file.data}" class="uploaded-image" alt="Uploaded Content" />`;
        }

        let messageContentHTML;
        if (message) {
            messageContentHTML = `<p>${message}</p>`;
        } else if (isUser) {
            messageContentHTML = ''; // User can send just an image
        } else {
            // New typing indicator for AI loading state
            messageContentHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        }

        const avatarSrc = isUser ? 'user.png' : 'ai.png';
        chatBox.innerHTML = `
            <img src="${avatarSrc}" alt="${sender}" class="chat-avatar">
            <div class="chat-area ${isUser ? 'user-chat-area' : 'ai-chat-area'}">
                ${messageContentHTML}
                ${imageHTML}
            </div>`;
        
        chatContainer.appendChild(chatBox);
        scrollToBottom();
        return chatBox;
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) {
            resetImageUpload();
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64string = event.target.result.split(",")[1];
            user.file = {
                mime_type: file.type,
                data: base64string
            };
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    function resetImageUpload() {
        user.file = null;
        imageInput.value = "";
        imagePreview.style.display = 'none';
        imagePreview.src = '#';
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChatSubmission();
        }
    }

    function handleLogout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    }
    
    function autoResizeTextarea() {
        promptInput.style.height = 'auto';
        promptInput.style.height = (promptInput.scrollHeight) + 'px';
    }
    
    function scrollToBottom() {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    }
});