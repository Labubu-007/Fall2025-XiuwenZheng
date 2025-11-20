document.addEventListener("DOMContentLoaded", () => {
    stampCurrentYear();
    highlightNavigation();
    styleBookButtons();
    initRoomCards();
    initBookingForm();
    initConfirmationPage();
    initContactForm();
});

function stampCurrentYear() {
    const now = new Date().getFullYear();
    document.querySelectorAll("[data-year]").forEach((node) => {
        node.textContent = now;
    });
}

function highlightNavigation() {
    const currentPage = document.body.dataset.page;
    document.querySelectorAll(".nav-link").forEach((link) => {
        if (link.dataset.nav === currentPage) {
            link.classList.add("is-active");
        }
    });
}

function styleBookButtons() {
    const buttons = document.querySelectorAll("[data-role='book-button']");
    buttons.forEach((button) => {
        if (button.dataset.enhanced) return;
        button.dataset.enhanced = "true";

        button.classList.add("cta-button");
        if (button.dataset.variant === "ghost") {
            button.classList.add("cta-button--ghost");
        }

        const label = button.dataset.label || "Book";
        button.innerHTML = `<span>${label}</span>`;

        const target = button.dataset.target || "book.html";
        button.addEventListener("click", () => {
            window.location.href = target;
        });
    });
}

function initRoomCards() {
    const cards = document.querySelectorAll("[data-room-card]");
    if (!cards.length) return;

    cards.forEach((card) => {
        const photoLayer = card.querySelector(".room-card__layer--photo");
        const image = card.dataset.photo;
        if (photoLayer && image) {
            photoLayer.style.backgroundImage = `url('${image}')`;
        }

        const activate = () => card.classList.add("is-photo");
        const deactivate = () => card.classList.remove("is-photo");

        card.addEventListener("mouseenter", activate);
        card.addEventListener("focusin", activate);
        card.addEventListener("mouseleave", deactivate);
        card.addEventListener("focusout", deactivate);
        card.addEventListener("touchstart", () => {
            card.classList.toggle("is-photo");
        });
    });
}

function initBookingForm() {
    const form = document.querySelector("[data-booking-form]");
    if (!form) return;

    const dateInput = form.querySelector("#booking-date");
    const calendarRoot = form.querySelector("[data-calendar]");
    const submitButton = form.querySelector("#bookingSubmit");

    if (calendarRoot && dateInput) {
        new BookingCalendar(calendarRoot, dateInput);
    }

    if (!submitButton) return;

    const updateSubmitState = () => {
        submitButton.disabled = !form.checkValidity();
    };

    form.addEventListener("input", updateSubmitState);
    form.addEventListener("change", updateSubmitState);
    updateSubmitState();
}

class BookingCalendar {
    constructor(root, input) {
        this.root = root;
        this.input = input;
        this.current = new Date();
        this.selectedDate = null;
        this.label = root.querySelector("[data-calendar-label]");
        this.weekdayRow = root.querySelector(".calendar__weekdays");
        this.grid = root.querySelector(".calendar__grid");
        this.setupWeekdays();
        this.attachControls();
        this.render();
    }

    setupWeekdays() {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        this.weekdayRow.innerHTML = "";
        days.forEach((day) => {
            const span = document.createElement("span");
            span.textContent = day;
            this.weekdayRow.appendChild(span);
        });
    }

    attachControls() {
        this.root.querySelectorAll("[data-change]").forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.dataset.change;
                if (action === "prev-month") this.shiftMonth(-1);
                if (action === "next-month") this.shiftMonth(1);
                if (action === "prev-year") this.shiftYear(-1);
                if (action === "next-year") this.shiftYear(1);
            });
        });
    }

    shiftMonth(delta) {
        const next = new Date(this.current);
        next.setMonth(next.getMonth() + delta);
        this.current = next;
        this.render();
    }

    shiftYear(delta) {
        const next = new Date(this.current);
        next.setFullYear(next.getFullYear() + delta);
        this.current = next;
        this.render();
    }

    render() {
        const formatter = new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric",
        });
        this.label.textContent = formatter.format(this.current);

        const firstDay = new Date(this.current.getFullYear(), this.current.getMonth(), 1);
        const lastDay = new Date(this.current.getFullYear(), this.current.getMonth() + 1, 0);
        const offset = firstDay.getDay();

        this.grid.innerHTML = "";
        for (let i = 0; i < offset; i += 1) {
            const placeholder = document.createElement("span");
            this.grid.appendChild(placeholder);
        }

        for (let day = 1; day <= lastDay.getDate(); day += 1) {
            const dateObj = new Date(this.current.getFullYear(), this.current.getMonth(), day);
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = day;

            if (this.isToday(dateObj)) {
                button.classList.add("is-today");
            }

            if (this.selectedDate && this.isSameDay(dateObj, this.selectedDate)) {
                button.classList.add("is-selected");
            }

            button.addEventListener("click", () => {
                this.selectDate(dateObj);
            });

            this.grid.appendChild(button);
        }
    }

    selectDate(dateObj) {
        this.selectedDate = dateObj;
        this.input.value = this.formatDate(dateObj);
        this.input.dataset.iso = dateObj.toISOString();
        this.render();
        this.input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    formatDate(dateObj) {
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const yyyy = dateObj.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    }

    isToday(dateObj) {
        const today = new Date();
        return this.isSameDay(dateObj, today);
    }

    isSameDay(a, b) {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    }
}

function initConfirmationPage() {
    const detailsWrapper = document.querySelector("[data-booking-details]");
    if (!detailsWrapper) return;

    const params = new URLSearchParams(window.location.search);
    const requiredFields = ["fullName", "roomType", "date", "startTime", "durationHours"];
    const missing = requiredFields.some((field) => !params.get(field));
    const missingNode = document.querySelector("[data-missing]");

    if (missing) {
        missingNode?.classList.add("is-visible");
        detailsWrapper.style.display = "none";
        return;
    }

    const fullName = params.get("fullName");
    const roomType = params.get("roomType");
    const dateStr = params.get("date");
    const startTime = params.get("startTime");
    const duration = parseInt(params.get("durationHours"), 10) || 0;

    const parsedDate = parseDateString(dateStr);
    const formattedDate = parsedDate
        ? new Intl.DateTimeFormat("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
          }).format(parsedDate)
        : dateStr;

    const timePeriod = formatTimePeriod(parsedDate, startTime, duration);
    const confirmationCode = buildConfirmationCode(parsedDate, fullName);

    setDetail("roomType", roomType);
    setDetail("date", formattedDate);
    setDetail("time", timePeriod);
    setDetail("code", confirmationCode);
}

function parseDateString(value) {
    if (!value) return null;
    const [month, day, year] = value.split("/").map((part) => parseInt(part, 10));
    if (!month || !day || !year) return null;
    return new Date(year, month - 1, day);
}

function formatTimePeriod(dateObj, startTime, durationHours) {
    if (!startTime || Number.isNaN(durationHours)) return startTime || "—";

    const [hours, minutes] = startTime.split(":").map((part) => parseInt(part, 10));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return startTime;

    const start = dateObj ? new Date(dateObj) : new Date();
    start.setHours(hours, minutes, 0, 0);

    const end = new Date(start);
    end.setHours(end.getHours() + durationHours);

    const format = (date) =>
        `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    return `${format(start)} - ${format(end)}`;
}

function buildConfirmationCode(dateObj, fullName) {
    const defaultCode = "CMPND-0000-GUEST";
    if (!dateObj || !fullName) return defaultCode;
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const lastName = fullName.trim().split(" ").slice(-1)[0] || "Guest";
    const sanitizedLastName = lastName.replace(/[^a-zA-Z]/g, "").toUpperCase() || "GUEST";
    return `CMPND-${mm}${dd}-${sanitizedLastName}`;
}

function setDetail(key, value) {
    const target = document.querySelector(`[data-detail='${key}']`);
    if (target) {
        target.textContent = value || "—";
    }
}

function initContactForm() {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;
    const submitButton = document.querySelector("#contactSubmit");
    if (!submitButton) return;

    const updateButton = () => {
        submitButton.disabled = !form.checkValidity();
    };

    form.addEventListener("input", updateButton);
    form.addEventListener("change", updateButton);
    updateButton();

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        form.reset();
        updateButton();
        alert("Thanks! CMPND received your message and will reply shortly.");
    });
}
