  // simple fade animation on scroll (optional)
    const reveal = () => {
      document.querySelectorAll(".value-card, .member, .intro-text, .intro-img").forEach((el) => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight - 100) el.classList.add("visible");
      });
    };
    window.addEventListener("scroll", reveal)