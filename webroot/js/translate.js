document.addEventListener('DOMContentLoaded', () => {
    const langToggleBtn = document.getElementById('lang-toggle');
    const content = document.getElementById('content');
    let isEnglish = false; // Start with the default language (Dutch)

    langToggleBtn.addEventListener('click', () => {
        isEnglish = !isEnglish; // Toggle the language status

        // Display the correct language content
        document.querySelectorAll('.nl').forEach(elem => elem.style.display = isEnglish ? 'none' : 'block');
        document.querySelectorAll('.en').forEach(elem => elem.style.display = isEnglish ? 'block' : 'none');
        
        // Change the button text
        langToggleBtn.textContent = isEnglish ? 'Switch to Dutch' : 'Switch to English';
    });
});
