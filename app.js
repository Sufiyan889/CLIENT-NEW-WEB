// Select all service items
const serviceItems = document.querySelectorAll('.service-item');
const servicesList = document.querySelector('.services-list');

serviceItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    // Remove active from others
    serviceItems.forEach(i => i.classList.remove('active'));
    // Activate hovered
    item.classList.add('active');
    // Blur others
    servicesList.classList.add('blur');
  });

  item.addEventListener('mouseleave', () => {
    // Reset all when mouse leaves
    item.classList.remove('active');
    servicesList.classList.remove('blur');
  });
});
  // Scroll reveal effect for about section
const aboutSection = document.querySelector('.about');
const aboutElements = document.querySelectorAll('.about-content, .about-image');

window.addEventListener('scroll', () => {
  const triggerBottom = window.innerHeight * 0.85;
  const rect = aboutSection.getBoundingClientRect();
  if (rect.top < triggerBottom) {
    aboutElements.forEach((el) => el.classList.add('visible'));
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const projects = document.querySelectorAll(".project");
  projects.forEach((p, i) => {
    setTimeout(() => p.classList.add("visible"), i * 150);
  });
});
window.addEventListener("scroll", () => {
  const joinSection = document.querySelector(".join-us-section");
  const pos = joinSection.getBoundingClientRect().top;
  const winHeight = window.innerHeight;

  if (pos < winHeight - 100) {
    joinSection.classList.add("visible");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".join-us-section");
  section.style.opacity = "0";
  section.style.transform = "translateY(60px)";
  section.style.transition = "all 0.8s ease";
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
});

observer.observe(document.querySelector(".join-us-section"));
