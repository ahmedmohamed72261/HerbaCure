document.addEventListener("DOMContentLoaded", function () {
  // Certificate Modal Functionality
  const viewButtons = document.querySelectorAll(".view-cert");
  const modal = document.querySelector(".certificate-modal");
  const modalContent = document.querySelector(".modal-content");
  const closeModal = document.querySelector(".close-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalImage = document.getElementById("modal-image");
  const modalDescription = document.getElementById("modal-description");
  const modalDate = document.getElementById("modal-date");

  // Certificate data (in a real application, this would come from a database)
  const certificateData = [
    {
      title: "USDA Organic",
      image: "assets/images/cert1.png",
      description:
        "This certificate confirms that our products meet all USDA organic standards. Our organic certification ensures that our products are grown and processed according to federal guidelines addressing soil quality, animal raising practices, pest and weed control, and use of additives. Organic producers rely on natural substances and physical, mechanical, or biologically based farming methods to the fullest extent possible.",
      date: "Issued: January 2020 | Valid until: January 2025",
    },
    {
      title: "Fair Trade Certified",
      image: "assets/images/cert2.png",
      description:
        "Fair Trade certification demonstrates our commitment to fair prices, direct trade, transparent and accountable relationships, community development, and environmental stewardship. This certification ensures that farmers and workers behind our products get a fair deal for their labor, helping them build sustainable businesses and thriving communities.",
      date: "Issued: March 2019 | Valid until: March 2024",
    },
    {
      title: "Non-GMO Project Verified",
      image: "assets/images/cert3.png",
      description:
        "The Non-GMO Project Verified seal assures that our products have been produced according to rigorous best practices for GMO avoidance, including testing of risk ingredients. This verification is North America's most trusted third-party verification for non-GMO food and products, ensuring transparency and integrity in our supply chain.",
      date: "Issued: June 2021 | Valid until: June 2024",
    },
    {
      title: "ISO 22000:2018",
      image: "assets/images/cert4.jpeg",
      description:
        "ISO 22000:2018 specifies requirements for a food safety management system where an organization needs to demonstrate its ability to control food safety hazards. This international standard ensures that our food safety management system is robust and effective, providing customers with confidence in our products' safety.",
      date: "Issued: September 2020 | Valid until: September 2023",
    },
    {
      title: "Kosher Certified",
      image: "assets/images/cert5.png",
      description:
        "Our Kosher certification ensures that our products comply with the strict dietary standards of traditional Jewish law. This certification involves regular inspections of our production facilities by rabbinical supervisors to ensure all ingredients and production processes meet Kosher requirements.",
      date: "Issued: May 2021 | Valid until: May 2023",
    },
    {
      title: "Halal Certified",
      image: "assets/images/cert6.png",
      description:
        "This certification confirms that our products are permissible according to Islamic law and have been processed in accordance with these guidelines. Halal certification ensures that our products do not contain any components that Muslims are prohibited from consuming according to Islamic law.",
      date: "Issued: August 2021 | Valid until: August 2023",
    },
  ];

  // Preload certificate images to ensure they're available when modal opens
  function preloadImages() {
    certificateData.forEach((certificate) => {
      const img = new Image();
      img.src = certificate.image;
    });
  }

  // Call preload function
  preloadImages();

  // Add animation to certificate cards
  const certificateCards = document.querySelectorAll(".certificate-card");
  certificateCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-15px)";
      this.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.12)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "";
      this.style.boxShadow = "";
    });
  });

  // Add animation to intro content section
  const introContentWrapper = document.querySelector(".intro-content-wrapper");
  if (introContentWrapper) {
    // Add subtle pulse animation to the icon
    const introIcon = document.querySelector(".intro-content-icon");
    if (introIcon) {
      introIcon.classList.add("pulse-animation");
    }

    // Add counter animation to stat numbers
    const statNumbers = document.querySelectorAll(".stat-number");
    if (statNumbers.length > 0) {
      statNumbers.forEach((statNumber) => {
        const targetValue = parseInt(statNumber.textContent);
        if (!isNaN(targetValue)) {
          animateCounter(statNumber, 0, targetValue, 2000);
        }
      });
    }
  }

  // Counter animation function
  function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      let value = Math.floor(progress * (end - start) + start);

      // Handle percentage sign
      if (element.textContent.includes("%")) {
        element.textContent = value + "%";
      } else {
        element.textContent = value;
        // Add + sign if original had it
        if (element.textContent.includes("+")) {
          element.textContent = value + "+";
        }
      }

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        // Ensure final value is exactly as specified in HTML
        element.textContent =
          end +
          (element.textContent.includes("%")
            ? "%"
            : element.textContent.includes("+")
            ? "+"
            : "");
      }
    };
    window.requestAnimationFrame(step);
  }

  // Open modal with certificate details
  viewButtons.forEach((button, index) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const certificate = certificateData[index];
      const cardElement = this.closest(".certificate-card");
      let badgeText = "Official";

      // Get badge text from the card if available
      if (cardElement) {
        const badgeElement = cardElement.querySelector(".certificate-badge");
        if (badgeElement) {
          badgeText = badgeElement.textContent;
        }
      }

      // Add button press animation
      this.classList.add("pressed");
      setTimeout(() => {
        this.classList.remove("pressed");
      }, 200);

      // Set modal content
      modalTitle.textContent = certificate.title;

      // Set badge text
      const modalBadge = document.getElementById("modal-badge");
      if (modalBadge) {
        modalBadge.textContent = badgeText;
      }

      // Show loading overlay
      const loadingOverlay = document.querySelector(".image-loading-overlay");
      if (loadingOverlay) {
        loadingOverlay.style.display = "flex";
      }

      // Hide previous image while loading
      modalImage.style.opacity = "0";
      modalImage.style.display = "none";

      // Load the image
      const img = new Image();
      img.onload = function () {
        // Hide loading overlay
        if (loadingOverlay) {
          loadingOverlay.style.display = "none";
        }

        // Show image with fade-in effect
        modalImage.src = certificate.image;
        modalImage.alt = certificate.title;
        modalImage.style.display = "block";

        // Trigger reflow for animation
        void modalImage.offsetWidth;

        // Add fade-in animation to the image
        modalImage.classList.add("fade-in");
        modalImage.style.opacity = "1";
      };

      img.onerror = function () {
        // Hide loading overlay
        if (loadingOverlay) {
          loadingOverlay.style.display = "none";
        }

        // Show fallback image
        modalImage.src = "assets/images/certificate-placeholder.jpg"; // Fallback image
        modalImage.alt = "Certificate image could not be loaded";
        modalImage.style.display = "block";
        modalImage.style.opacity = "1";

        // Add error message
        const errorMsg = document.createElement("div");
        errorMsg.className = "image-error-message";
        errorMsg.innerHTML =
          '<i class="fas fa-exclamation-triangle"></i> Image could not be loaded';

        const modalImageContainer = document.querySelector(
          ".modal-image-container"
        );
        if (modalImageContainer) {
          modalImageContainer.appendChild(errorMsg);
        }
      };

      // Start loading the image
      img.src = certificate.image;

      modalDescription.textContent = certificate.description;
      modalDate.textContent = certificate.date;

      // Set up action buttons
      const downloadBtn = document.querySelector(".download-cert");
      if (downloadBtn) {
        downloadBtn.onclick = function () {
          // Create a temporary link to download the image
          const link = document.createElement("a");
          link.href = certificate.image;
          link.download =
            certificate.title.replace(/\s+/g, "_") + "_Certificate.jpg";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
      }

      const verifyBtn = document.querySelector(".verify-cert");
      if (verifyBtn) {
        verifyBtn.onclick = function () {
          alert(
            "Certificate verification process initiated. This feature would connect to a blockchain or verification service in a production environment."
          );
        };
      }

      // Show modal with animation
      modal.style.display = "block";
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open

      // Add active class for animation
      setTimeout(() => {
        modal.classList.add("active");
        setTimeout(() => {
          modalContent.classList.add("active");
        }, 100);
      }, 10);
    });
  });

  // Close modal function
  function closeModalWithAnimation() {
    modalContent.classList.remove("active");
    setTimeout(() => {
      modal.classList.remove("active");
      setTimeout(() => {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Re-enable scrolling

        // Reset image fade-in class
        modalImage.classList.remove("fade-in");
      }, 300);
    }, 100);
  }

  // Close modal
  closeModal.addEventListener("click", function () {
    closeModalWithAnimation();
  });

  // Close modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModalWithAnimation();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.style.display === "block") {
      closeModalWithAnimation();
    }
  });

  // Add animations and effects
  const style = document.createElement("style");
  style.textContent = `
        .view-cert.pressed {
            transform: scale(0.95);
            box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
        }

        .btn-rotate {
            transition: all 0.3s ease;
        }

        .btn-rotate:hover {
            transform: translateY(-3px) rotate(1deg);
        }

        .loading-indicator {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            font-size: 2rem;
            color: #2e7d32;
        }

        .fade-in {
            animation: fadeIn 0.8s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .pulse-animation {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 10px 25px rgba(46, 125, 50, 0.2);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 15px 30px rgba(46, 125, 50, 0.3);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 10px 25px rgba(46, 125, 50, 0.2);
            }
        }
    `;
  document.head.appendChild(style);
});
