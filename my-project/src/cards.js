document.addEventListener("DOMContentLoaded", () => {
  const carouselItems = [
    {
      image: "/uv_awareness.png",
      link: "awareness.html",
      alt: "UV Awareness"
    },
    {
      image: "/calculator.png",
      link: "calculator.html",
      alt: "Sunscreen Calculator"
    },
    {
      image: "/clothing_advice.png",
      link: "clothing_advice.html",
      alt: "Clothing Advice"
    }
  ];

  let currentIndex = 1;
  let autoPlay = null;
  let isAnimating = false;
  const autoPlayDelay = 3500;

  const wrapper = document.getElementById("carousel-wrapper");

  const cardLeft = document.getElementById("card-left");
  const cardCenter = document.getElementById("card-center");
  const cardRight = document.getElementById("card-right");

  const imgLeft = document.getElementById("img-left");
  const imgCenter = document.getElementById("img-center");
  const imgRight = document.getElementById("img-right");

  const dots = document.querySelectorAll(".dot");

  if (
    !wrapper ||
    !cardLeft || !cardCenter || !cardRight ||
    !imgLeft || !imgCenter || !imgRight ||
    dots.length === 0
  ) {
    return;
  }

  function getLeftIndex() {
    return (currentIndex - 1 + carouselItems.length) % carouselItems.length;
  }

  function getRightIndex() {
    return (currentIndex + 1) % carouselItems.length;
  }

  function updateDots() {
    dots.forEach((dot, index) => {
        if (index === currentIndex) {
        dot.classList.remove("bg-black/25");
        dot.classList.add("bg-black/70", "scale-125");
        } else {
        dot.classList.remove("bg-black/70", "scale-125");
        dot.classList.add("bg-black/25");
        }
    });
   }

  function applyCardImages() {
    const leftIndex = getLeftIndex();
    const rightIndex = getRightIndex();

    imgLeft.src = carouselItems[leftIndex].image;
    imgLeft.alt = carouselItems[leftIndex].alt;
    cardLeft.href = carouselItems[leftIndex].link;

    imgCenter.src = carouselItems[currentIndex].image;
    imgCenter.alt = carouselItems[currentIndex].alt;
    cardCenter.href = carouselItems[currentIndex].link;

    imgRight.src = carouselItems[rightIndex].image;
    imgRight.alt = carouselItems[rightIndex].alt;
    cardRight.href = carouselItems[rightIndex].link;

    updateDots();
  }

  function animateTransition(nextIndex) {
    if (isAnimating) return;
    isAnimating = true;

    // First, make cards slightly smaller and transparent
    [cardLeft, cardCenter, cardRight].forEach((card) => {
      card.classList.add("opacity-70", "scale-[0.98]");
    });

    setTimeout(() => {
      currentIndex = nextIndex;
      applyCardImages();

      // Restore display after update
      [cardLeft, cardCenter, cardRight].forEach((card) => {
        card.classList.remove("opacity-70", "scale-[0.98]");
        card.classList.add("opacity-100", "scale-100");
      });

      setTimeout(() => {
        isAnimating = false;
      }, 350);
    }, 220);
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % carouselItems.length;
    animateTransition(nextIndex);
  }


  function goToSlide(index) {
    if (index === currentIndex) return;
    animateTransition(index);
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlay = setInterval(() => {
      nextSlide();
    }, autoPlayDelay);
  }

  function stopAutoPlay() {
    if (autoPlay) {
      clearInterval(autoPlay);
      autoPlay = null;
    }
  }

  // initial
  applyCardImages();
  startAutoPlay();

  // dots
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = Number(dot.dataset.index);
      goToSlide(index);
      startAutoPlay();
    });
  });
});