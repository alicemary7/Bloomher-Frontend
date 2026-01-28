// Global configuration for the application
window.API_BASE_URL = "https://bloomher-backend.onrender.com";

// Toast Notification System
(function () {
    // Inject Styles
    const style = document.createElement('style');
    style.textContent = `
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        }
        .toast {
            min-width: 280px;
            max-width: 400px;
            padding: 16px 20px;
            border-radius: 12px;
            background: #ffffff;
            color: #1a1a1a;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            animation: toastSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            border-left: 6px solid #c41e3a;
            pointer-events: auto;
        }
        .toast.success { 
            border-left-color: #28a745; 
            background: #f8fff9; 
        }
        .toast.error { 
            border-left-color: #c41e3a; 
            background: #fff8f9; 
        }
        .toast.info { 
            border-left-color: #c41e3a; 
            background: #ffffff;
        }
        
        .toast-content { 
            flex: 1; 
            font-weight: 600; 
            font-size: 15px;
            line-height: 1.4;
        }
        .toast-close { 
            cursor: pointer; 
            opacity: 0.4; 
            font-size: 22px; 
            line-height: 1; 
            transition: 0.2s; 
            padding: 4px;
        }
        .toast-close:hover { 
            opacity: 1; 
            color: #c41e3a;
        }

        @keyframes toastSlideIn {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(120%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    let container;
    const getContainer = () => {
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    };

    window.showToast = function (message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <div class="toast-content">${message}</div>
            <div class="toast-close">&times;</div>
        `;

        getContainer().appendChild(toast);

        const removeToast = () => {
            if (toast.parentElement) {
                toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
                setTimeout(() => toast.remove(), 300);
            }
        };

        toast.querySelector('.toast-close').onclick = removeToast;
        setTimeout(removeToast, 4000);
    };
})();
