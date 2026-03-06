(function () {
  "use strict";

  // Select all forms with the class 'php-email-form'
  const forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent default form submission

      const thisForm = this;
      const action = thisForm.getAttribute('action');

      if (!action) {
        displayError(thisForm, 'The form does not have an action URL set!');
        return;
      }

      // Show loading indicator, hide previous messages
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      const formData = new FormData(thisForm);

      // Send the form data using fetch API
      fetch(action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }, // Expected by Formspree and similar services
      })
        .then(response => {
          if (response.ok) {
            return response.json(); // Parse the response as JSON
          } else {
            throw new Error(`${response.status} ${response.statusText} - ${response.url}`);
          }
        })
        .then(data => {
          thisForm.querySelector('.loading').classList.remove('d-block');
          if (data.ok) {
            // If the service confirms successful submission
            thisForm.querySelector('.sent-message').classList.add('d-block');
            thisForm.reset(); // Reset form fields
          } else {
            throw new Error(data.error || 'Form submission failed with no error message.');
          }
        })
        .catch(error => {
          displayError(thisForm, error.message || 'An error occurred while submitting the form.');
        });
    });
  });

  // Function to show an error message in the form
  function displayError(form, errorMessage) {
    form.querySelector('.loading').classList.remove('d-block');
    form.querySelector('.error-message').textContent = errorMessage;
    form.querySelector('.error-message').classList.add('d-block');
  }
})();
