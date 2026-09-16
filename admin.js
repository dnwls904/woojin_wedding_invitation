
const SUPABASE_URL =
  "https://qkmfxujtmiffbossehbc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_2KVALB3FagZbWx4nmEOwuA_URV7KfYg";

const { createClient } = supabase;

const db = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// 로그인 요소

const loginSection =
  document.getElementById("loginSection");

const loginForm =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const loginButton =
  document.getElementById("loginButton");


// 관리자 화면

const dashboard =
  document.getElementById("dashboard");

const logoutButton =
  document.getElementById("logoutButton");


// 통계 요소

const attendingCount =
  document.getElementById("attendingCount");

const notAttendingCount =
  document.getElementById("notAttendingCount");

const guestCount =
  document.getElementById("guestCount");

const mealCount =
  document.getElementById("mealCount");

const responseCount =
  document.getElementById("responseCount");

const responseList =
  document.getElementById("responseList");

// 방명록 요소

const guestbookCount =
  document.getElementById("guestbookCount");

const adminGuestbookList =
  document.getElementById("adminGuestbookList");

const rsvpToggle =
  document.getElementById("rsvpToggle");

const rsvpContent =
  document.getElementById("rsvpContent");

const guestbookToggle =
  document.getElementById("guestbookToggle");

const guestbookContent =
  document.getElementById("guestbookContent");


function toggleSection(
  section,
  content,
  otherSection,
  otherContent,
  button,
  otherButton
) {
  const isOpen = !content.hidden;

  content.hidden = isOpen;

  section.classList.toggle(
    "is-open",
    !isOpen
  );

  button.querySelector(
    ".admin-section__arrow"
  ).textContent = isOpen ? "＋" : "−";


  if (!isOpen) {
    otherContent.hidden = true;

    otherSection.classList.remove(
      "is-open"
    );

    otherButton.querySelector(
      ".admin-section__arrow"
    ).textContent = "＋";
  }
}


rsvpToggle.addEventListener(
  "click",
  () => {
    toggleSection(
      rsvpToggle.parentElement,
      rsvpContent,
      guestbookToggle.parentElement,
      guestbookContent,
      rsvpToggle,
      guestbookToggle
    );
  }
);


guestbookToggle.addEventListener(
  "click",
  () => {
    toggleSection(
      guestbookToggle.parentElement,
      guestbookContent,
      rsvpToggle.parentElement,
      rsvpContent,
      guestbookToggle,
      rsvpToggle
    );
  }
);

// 로그인

loginForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;

  loginButton.disabled = true;
  loginButton.textContent = "로그인 중...";


  const { error } =
    await db.auth.signInWithPassword({
      email,
      password
    });


  if (error) {

    console.error("로그인 실패:", error);

    alert(
      "이메일 또는 비밀번호가 올바르지 않습니다."
    );

    loginButton.disabled = false;
    loginButton.textContent = "로그인";

    return;
  }

  loginForm.reset();

  await showDashboard();

});


// 관리자 화면 표시

async function showDashboard() {

  loginSection.hidden = true;
  dashboard.hidden = false;

  await loadRsvpData();
  await loadGuestbookData();

}


// RSVP 데이터 불러오기

async function loadRsvpData() {

  responseList.innerHTML =
    '<p class="empty-message">불러오는 중...</p>';


  const { data, error } =
    await db
      .from("rsvp")
      .select("*")
      .order("created_at", {
        ascending: false
      });


  if (error) {

    console.error(
      "RSVP 데이터 불러오기 실패:",
      error
    );

    responseList.innerHTML =
      '<p class="empty-message">데이터를 불러오지 못했습니다.</p>';

    return;
  }


  const responses = data || [];


  // 통계 계산

  const attending =
    responses.filter(
      (item) => item.attending
    );

  const notAttending =
    responses.filter(
      (item) => !item.attending
    );

  const totalGuests =
    attending.reduce(
      (sum, item) =>
        sum + Number(item.guests || 0),
      0
    );

  const totalMeal =
    attending
      .filter((item) => item.meal)
      .reduce(
        (sum, item) =>
          sum + 1 + Number(item.guests || 0),
        0
      );


  attendingCount.textContent =
    attending.length;

  notAttendingCount.textContent =
    notAttending.length;

  guestCount.textContent =
    totalGuests;

  mealCount.textContent =
    totalMeal;

  responseCount.textContent =
    `${responses.length}건`;


  // 응답 목록

  if (responses.length === 0) {

    responseList.innerHTML =
      '<p class="empty-message">아직 응답이 없습니다.</p>';

    return;
  }


  responseList.innerHTML = "";


  responses.forEach((item) => {

    const responseItem =
      document.createElement("div");

    responseItem.className =
      "response-item";


    const statusText =
      item.attending
        ? "참석"
        : "불참";


    const statusClass =
      item.attending
        ? "attending"
        : "not-attending";


    const guestText =
      item.attending
        ? `동반 ${item.guests}명`
        : "";


    const mealText =
      item.attending
        ? item.meal
          ? "식사"
          : "식사 안 함"
        : "";


    const detail =
      [guestText, mealText]
        .filter(Boolean)
        .join(" · ");


    responseItem.innerHTML = `
      <div class="response-item__top">

        <span class="response-item__name">
          ${escapeHtml(item.name)}
        </span>

        <span class="response-item__status ${statusClass}">
          ${statusText}
        </span>

      </div>

      <div class="response-item__detail">
        ${detail}
      </div>

      ${
        item.message
          ? `
            <div class="response-item__message">
              ${escapeHtml(item.message)}
            </div>
          `
          : ""
      }

    `;


    responseList.appendChild(
      responseItem
    );

  });

}

async function loadGuestbookData() {
  adminGuestbookList.innerHTML =
    '<p class="empty-message">불러오는 중...</p>';

  const { data, error } =
    await db
      .from("guestbook")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error(
      "방명록 불러오기 실패:",
      error
    );

    adminGuestbookList.innerHTML =
      '<p class="empty-message">방명록을 불러오지 못했습니다.</p>';

    return;
  }

  const messages = data || [];

  guestbookCount.textContent =
    `${messages.length}건`;

  if (messages.length === 0) {
    adminGuestbookList.innerHTML =
      '<p class="empty-message">아직 방명록이 없습니다.</p>';

    return;
  }

  adminGuestbookList.innerHTML = "";

  messages.forEach((item) => {
    const itemElement =
      document.createElement("div");

    itemElement.className =
      "response-item";

    const date =
      new Date(item.created_at)
        .toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });

    itemElement.innerHTML = `
      <div class="response-item__top">
        <span class="response-item__name">
          ${escapeHtml(item.name)}
        </span>

        <button
          type="button"
          class="guestbook-delete"
          data-id="${item.id}"
        >
          삭제
        </button>
      </div>

      <div class="response-item__detail">
        ${date}
      </div>

      <div class="response-item__message">
        ${escapeHtml(item.message)}
      </div>
    `;

    adminGuestbookList.appendChild(
      itemElement
    );
  });

  document
    .querySelectorAll(".guestbook-delete")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          deleteGuestbook(button.dataset.id);
        }
      );
    });
}

async function deleteGuestbook(id) {
  const confirmed =
    confirm("이 방명록을 삭제할까요?");

  if (!confirmed) {
    return;
  }

  const { error } =
    await db
      .from("guestbook")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "방명록 삭제 실패:",
      error
    );

    alert("방명록을 삭제하지 못했습니다.");
    return;
  }

  await loadGuestbookData();
}


// 사용자 입력값 안전하게 표시

function escapeHtml(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value ?? "";

  return div.innerHTML;

}


// 로그아웃

logoutButton.addEventListener(
  "click",
  async () => {

    await db.auth.signOut();

    dashboard.hidden = true;
    loginSection.hidden = false;

  }
);


// 이미 로그인되어 있는지 확인

async function checkSession() {

  const {
    data: {
      session
    }
  } = await db.auth.getSession();


  if (session) {

    await showDashboard();

  }

}


checkSession();