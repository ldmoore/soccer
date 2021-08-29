function collapserOnClick(btn) {
	btn.classList.toggle("active");
    var content = btn.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
}