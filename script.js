// ==============================
// Supabase 연결
// ==============================
const SUPABASE_URL = "https://qkmfxujtmiffbossehbc.supabase.co";
const SUPABASE_KEY = "sb_publishable_2KVALB3FagZbWx4nmEOwuA_URV7KfYg";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

document.querySelectorAll("[data-scroll]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(btn.dataset.scroll)?.scrollIntoView({ behavior: "smooth" });
  });
});

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // 화면에 들어오면 애니메이션
      entry.target.classList.add("is-visible");
    } else {
      // 화면에서 나가면 다시 초기화
      entry.target.classList.remove("is-visible");
    }
  });
}, {
  threshold: 0.15
});

document.querySelectorAll(".reveal").forEach((el) => {
  observer.observe(el);
});

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCounter = document.getElementById("lightboxCounter");

const galleryItems = document.querySelectorAll(".gallery-item");

let currentIndex = 0;
let touchStartX = 0;
let touchCurrentX = 0;
let isDragging = false;

function showImage(index) {
  currentIndex = index;

  lightboxImage.src = galleryItems[index].dataset.full;

  if (lightboxCounter) {
    lightboxCounter.textContent =
      `${String(index + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
  }

  lightboxImage.style.transform = "translateX(0)";
}

galleryItems.forEach((item, index) => {

  item.addEventListener("click", () => {

    showImage(index);

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

  });

});


function closeLightbox() {

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

}


document.querySelector(".lightbox__close")
  .addEventListener("click", closeLightbox);


lightbox.addEventListener("click", e => {

  if (e.target === lightbox) {
    closeLightbox();
  }

});


/* 모바일 사진 스와이프 */

lightboxImage.addEventListener("touchstart", e => {

  touchStartX = e.touches[0].clientX;
  touchCurrentX = touchStartX;
  isDragging = true;

  lightboxImage.style.transition = "none";

}, { passive: true });


lightboxImage.addEventListener("touchmove", e => {

  if (!isDragging) return;

  touchCurrentX = e.touches[0].clientX;

  const moveX = touchCurrentX - touchStartX;

  lightboxImage.style.transform =
    `translateX(${moveX}px)`;

}, { passive: true });


lightboxImage.addEventListener("touchend", () => {

  if (!isDragging) return;

  isDragging = false;

  const moveX = touchCurrentX - touchStartX;
  const threshold = 70;

  lightboxImage.style.transition =
    "transform 0.35s cubic-bezier(.22, 1, .36, 1)";


  /* 왼쪽으로 밀기 → 다음 사진 */

  if (moveX < -threshold && currentIndex < galleryItems.length - 1) {

    lightboxImage.style.transform = "translateX(-100%)";

    setTimeout(() => {
      showImage(currentIndex + 1);
    }, 180);

    return;
  }


  /* 오른쪽으로 밀기 → 이전 사진 */

  if (moveX > threshold && currentIndex > 0) {

    lightboxImage.style.transform = "translateX(100%)";

    setTimeout(() => {
      showImage(currentIndex - 1);
    }, 180);

    return;
  }


  /* 충분히 밀지 않았으면 원래 위치로 */

  lightboxImage.style.transform = "translateX(0)";

});


document.addEventListener("keydown", e => {

  if (e.key === "Escape") {
    closeLightbox();
  }

});

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
document.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeLightbox();
});

const toast = document.getElementById("toast");
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}
document.querySelectorAll(".copy-button").forEach(button => {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      showToast("계좌번호가 복사되었습니다.");
    } catch {
      showToast("복사에 실패했습니다.");
    }
  });
});

// 실제 지도 URL로 교체하세요.
document.getElementById("naverMap").href = "https://naver.me/GHvwe9Xi";
document.getElementById("kakaoMap").href = "https://map.kakao.com/?urlX=898471.0000001073&urlY=856166.0000000056&urlLevel=3&itemId=26811493&q=%EC%95%88%EB%8F%99%EA%B7%B8%EB%9E%9C%EB%93%9C%ED%98%B8%ED%85%94&srcid=26811493&map_type=TYPE_MAP";


// ==============================
// 방명록
// ==============================

const guestbookForm = document.getElementById("guestbookForm");
const guestbookName = document.getElementById("guestbookName");
const guestbookMessage = document.getElementById("guestbookMessage");
const guestbookList = document.getElementById("guestbookList");

let guestbookData = [];
let guestbookPage = 0;
let guestbookAnimation = "";

const guestbookPerPage = 6;


// 방명록 불러오기
async function loadGuestbook() {
  if (!guestbookList) return;

  const { data, error } = await db
    .from("guestbook")
    .select("id, name, message, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("방명록 불러오기 실패:", error);

    guestbookList.innerHTML =
      '<p class="muted">방명록을 불러오지 못했습니다.</p>';

    return;
  }

  guestbookData = data;
  guestbookPage = 0;

  renderGuestbook();
}


// 방명록 화면 표시
function renderGuestbook() {
  if (!guestbookList) return;

  // 현재 애니메이션 방향 저장
  const animationDirection = guestbookAnimation;

  // 애니메이션 상태 초기화
  guestbookAnimation = "";


  // 기존 목록이 있고 페이지 이동이라면 먼저 퇴장 애니메이션
  if (
    animationDirection &&
    guestbookList.children.length > 0
  ) {
    guestbookList.classList.remove(
      "guestbook-slide-next",
      "guestbook-slide-prev"
    );

    guestbookList.classList.add(
      animationDirection === "guestbook-slide-next"
        ? "guestbook-exit-next"
        : "guestbook-exit-prev"
    );


    setTimeout(() => {
      renderGuestbookContent(animationDirection);
    }, 180);

    return;
  }


  // 첫 로딩 또는 일반적인 렌더링
  renderGuestbookContent(animationDirection);
}


// 실제 방명록 내용 표시
function renderGuestbookContent(animationDirection = "") {
  guestbookList.classList.remove(
    "guestbook-exit-next",
    "guestbook-exit-prev",
    "guestbook-slide-next",
    "guestbook-slide-prev"
  );

  guestbookList.innerHTML = "";


  // 방명록이 없는 경우
  if (guestbookData.length === 0) {
    guestbookList.innerHTML =
      '<p class="muted">첫 번째 축하 메시지를 남겨주세요. 💐';

    return;
  }


  const start = guestbookPage * guestbookPerPage;
  const end = start + guestbookPerPage;

  const visibleItems =
    guestbookData.slice(start, end);


  // 방명록 표시
  visibleItems.forEach((item) => {
    const article = document.createElement("article");
    article.className = "guestbook-item";

    const header = document.createElement("div");
    header.className = "guestbook-item__header";

    const name = document.createElement("span");
    name.className = "guestbook-item__name";
    name.textContent = item.name;

    const date = document.createElement("span");
    date.className = "guestbook-item__date";

    const createdDate = new Date(item.created_at);

    date.textContent =
      `${createdDate.getFullYear()}.${String(createdDate.getMonth() + 1).padStart(2, "0")}.${String(createdDate.getDate()).padStart(2, "0")}`;

    const message = document.createElement("p");
    message.className = "guestbook-item__message";
    message.textContent = item.message;

    header.appendChild(name);
    header.appendChild(date);

    article.appendChild(header);
    article.appendChild(message);

    guestbookList.appendChild(article);
  });


  // 페이지 이동 애니메이션
  if (animationDirection) {
    requestAnimationFrame(() => {
      guestbookList.classList.add(animationDirection);
    });
  }


  // 전체 페이지 수
  const totalPages =
    Math.ceil(guestbookData.length / guestbookPerPage);


  // 방명록이 6개 이하라면 페이지 버튼 숨김
  if (totalPages <= 1) {
    return;
  }


  // 페이지 이동 영역
  const pagination =
    document.createElement("div");

  pagination.className =
    "guestbook-pagination";


  // 이전 버튼
  const prevButton =
    document.createElement("button");

  prevButton.className =
    "guestbook-page-button";

  prevButton.textContent = "‹";

  prevButton.setAttribute(
    "aria-label",
    "이전 방명록"
  );

  if (guestbookPage === 0) {
    prevButton.disabled = true;
  }

  prevButton.addEventListener("click", () => {
    if (guestbookPage > 0) {
      guestbookPage--;

      guestbookAnimation =
        "guestbook-slide-prev";

      renderGuestbook();
    }
  });


  // 페이지 번호
  const pageNumber =
    document.createElement("span");

  pageNumber.className =
    "guestbook-page-number";

  pageNumber.textContent =
    `${guestbookPage + 1} / ${totalPages}`;


  // 다음 버튼
  const nextButton =
    document.createElement("button");

  nextButton.className =
    "guestbook-page-button";

  nextButton.textContent = "›";

  nextButton.setAttribute(
    "aria-label",
    "다음 방명록"
  );

  if (guestbookPage >= totalPages - 1) {
    nextButton.disabled = true;
  }

  nextButton.addEventListener("click", () => {
    if (guestbookPage < totalPages - 1) {
      guestbookPage++;

      guestbookAnimation =
        "guestbook-slide-next";

      renderGuestbook();
    }
  });


  pagination.appendChild(prevButton);
  pagination.appendChild(pageNumber);
  pagination.appendChild(nextButton);

  guestbookList.appendChild(pagination);
}


// 방명록 등록
let isSubmitting = false;
let lastSubmittedName = "";
let lastSubmittedMessage = "";

guestbookForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 이미 등록 중이거나 등록 제한 시간이라면 중단
  if (isSubmitting) {
    return;
  }

  const name = guestbookName.value.trim();
  const message = guestbookMessage.value.trim();

  if (!name || !message) {
    alert("이름과 축하 메시지를 입력해주세요.");
    return;
  }


  // 같은 이름 + 같은 메시지 중복 확인
  const isDuplicate =
    guestbookData.some((item) =>
      item.name.trim() === name &&
      item.message.trim() === message
    );

  if (isDuplicate) {
    alert("이미 등록된 동일한 메시지가 있습니다.");
    return;
  }


  // 방금 등록한 내용과 동일한 내용을 바로 다시 등록하는 것도 방지
  if (
    lastSubmittedName === name &&
    lastSubmittedMessage === message
  ) {
    alert("같은 메시지는 연속해서 등록할 수 없습니다.");
    return;
  }


  const submitButton =
    guestbookForm.querySelector("button[type='submit']");


  // 등록 시작
  isSubmitting = true;

  submitButton.disabled = true;
  submitButton.textContent = "등록 중...";


  const { error } = await db
    .from("guestbook")
    .insert([
      {
        name: name,
        message: message
      }
    ]);


  if (error) {
    console.error("방명록 등록 실패:", error);

    alert(
      "방명록 등록에 실패했습니다.\n잠시 후 다시 시도해주세요."
    );

    isSubmitting = false;
    submitButton.disabled = false;
    submitButton.textContent = "방명록 남기기";

    return;
  }


  // 마지막 등록 내용 저장
  lastSubmittedName = name;
  lastSubmittedMessage = message;

  guestbookForm.reset();


  // 5초 등록 제한
  let remainingSeconds = 5;

  submitButton.textContent =
    `등록 완료 · ${remainingSeconds}초`;

  const cooldown = setInterval(() => {
    remainingSeconds--;

    if (remainingSeconds <= 0) {
      clearInterval(cooldown);

      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = "방명록 남기기";

      return;
    }

    submitButton.textContent =
      `등록 완료 · ${remainingSeconds}초`;
  }, 1000);


  alert("따뜻한 축하 메시지가 등록되었습니다. 💐");


  // DB에서 최신 방명록 다시 불러오기
  await loadGuestbook();
});


// 페이지가 열리면 방명록 불러오기
loadGuestbook();
