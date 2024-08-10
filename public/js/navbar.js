const burgerBtn = document.getElementById('burger-btn');
const mobileMenu = document.getElementById('mobile-menu');
burgerBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');

  setTimeout(() => {
    mobileMenu.classList.toggle('show');
  }, 10);
});



const profileDropdownMenu = document.getElementById('profile-dropdown-menu');
const userMenuButton = document.getElementById('user-menu-button');

userMenuButton.addEventListener('click', (event)=> {
  profileDropdownMenu.classList.toggle('opacity-0');
})