let allOkEdit = false;
const editPropertyForm = document.getElementById('editPropertyForm');
const editPropertyButton = document.getElementById('editPropertyButton');
editPropertyButton.disabled = false
Array.from(editPropertyForm.elements).forEach(x => {
  x.addEventListener('input', (event) => {
    if (x.tagName.toLowerCase() === 'input') {
      const value = x.value.trim();
      if (!value || !x.checkValidity()) {
        x.classList.add('invalid'); // Add red border to invalid inputs
        const errorSpan = x.nextElementSibling;
        if (errorSpan && errorSpan.tagName === 'SPAN') {
          errorSpan.classList.remove('hidden');
        }
      } else {
        x.classList.remove('invalid'); // Remove red border from valid inputs
        const errorSpan = x.nextElementSibling;
        if (errorSpan && errorSpan.tagName === 'SPAN') {
          errorSpan.classList.add('hidden');
        }
      }
    }
    allOkEdit = true;
    Array.from(editPropertyForm.elements).forEach(element => {
      if (!(element.checkValidity())) {
        allOkEdit = false;
        editPropertyButton.disabled = true
        editPropertyButton.classList.add('disableMe');
      }

    })
    if (allOkEdit) {
      editPropertyButton.disabled = false
      editPropertyButton.classList.remove('disableMe');
    } else {
      editPropertyButton.disabled = true
      editPropertyButton.classList.add('disableMe');
    }

  })
});

document.getElementById('editPropertyForm').addEventListener('submit', function (event) {
  let formIsValid = true;
  Array.from(this.elements).forEach(element => {
    if (!element.checkValidity()) {
      formIsValid = false;
      element.classList.add('border-red-600'); // Add red border to invalid inputs
      const errorSpan = element.nextElementSibling;
      if (errorSpan && errorSpan.tagName === 'SPAN') {
        errorSpan.classList.remove('hidden');
      }
    } else {
      element.classList.remove('border-red-600'); // Remove red border from valid inputs
      const errorSpan = element.nextElementSibling;
      if (errorSpan && errorSpan.tagName === 'SPAN') {
        errorSpan.classList.add('hidden');
      }
    }
  });

  if (!formIsValid) {
    event.preventDefault(); // Cancel form submission
    console.log('Form submission canceled due to invalid inputs.');
  } else {
    console.log('Form is valid. Submitting...');
  }
});