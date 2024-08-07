const createPropertyForm = document.getElementById('createPropertyForm');
const createPropertyButton = document.getElementById('createPropertyButton');
console.dir(createPropertyForm)
createPropertyButton.disabled = true
createPropertyButton.classList.add('disableMe');
let allOK = false;
Array.from(createPropertyForm.elements).forEach(x => {
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
    allOK = true;
    Array.from(createPropertyForm.elements).forEach(element => {
      if (!(element.checkValidity())) {
        allOK = false;
        createPropertyButton.disabled = true
        createPropertyButton.classList.add('disableMe');
      }



    })
    if (allOK) {
      createPropertyButton.disabled = false
      createPropertyButton.classList.remove('disableMe');
    } else {
      createPropertyButton.disabled = true
      createPropertyButton.classList.add('disableMe');
    }

  })
});


document.getElementById('createPropertyForm').addEventListener('submit', function (event) {
  let formIsValid = true;
  Array.from(this.elements).forEach(element => {
    if (!element.checkValidity()) {
      formIsValid = false;
      element.classList.add('border-red-600'); // Add red border to invalid inputs
      // Show a custom error message
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
