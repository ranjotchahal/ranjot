const navLinks = document.querySelectorAll(".nav a");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

const actionButtons = document.querySelectorAll("button");

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const label = button.textContent?.trim() || "Action";
    button.textContent = `${label} sent`;
    button.disabled = true;
    setTimeout(() => {
      button.textContent = label;
      button.disabled = false;
    }, 2000);
  });
});
