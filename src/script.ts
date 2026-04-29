interface Status {
  indicator: string;
  description: string;
}

interface StatusSummary {
  status: Status;
  incidents: Incident[];
}

interface IncidentUpdate {
  body: string;
  created_at: string;
  status: string;
}

interface Incident {
  incident_updates: IncidentUpdate[];
}

class SituationClock {
  clock: HTMLElement;
  timezone: string;
  time: HTMLElement;
  formatter?: Intl.DateTimeFormat;

  constructor(clock: HTMLElement) {
    this.clock = clock;
    this.timezone = clock.dataset.timezone ?? "";
    this.time = clock.querySelector(".time") as HTMLElement;

    if (this.timezone === "EPOCH") {
      setInterval(() => this.updateTimeEpoch(), 1000);
    } else {
      this.formatter = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: this.timezone || undefined,
      });
      setInterval(() => this.updateTime(), 1000);
    }
  }

  updateTime() {
    this.setTime(this.formatter!.format(new Date()));
  }

  updateTimeEpoch() {
    const time = Math.floor(Date.now() / 1000);
    this.setTime(time.toString());
  }

  setTime(time: string) {
    this.time.textContent = time;
  }
}

class SituationClockResizer {
  constructor() {
    window.addEventListener("resize", () => this.resize());

    setTimeout(() => {
      document.querySelectorAll(".clock").forEach((el) => {
        el.classList.remove("hidden");
      });
      this.resize();
    }, 1000);
  }

  windowHeight(): number {
    return window.innerHeight;
  }

  clocksHeight(): number {
    const clocks = document.querySelector(".clocks");
    return clocks?.clientHeight ?? 0;
  }

  fontSize(): number {
    return parseFloat(getComputedStyle(document.body).fontSize);
  }

  resize() {
    while (this.tooBig() && this.fontSize() > 1) {
      document.body.style.fontSize = `${this.fontSize() - 1}px`;
    }

    while (this.tooSmall()) {
      document.body.style.fontSize = `${this.fontSize() + 1}px`;
    }

    // Step back if the grow loop overshot
    if (this.tooBig() && this.fontSize() > 1) {
      document.body.style.fontSize = `${this.fontSize() - 1}px`;
    }
  }

  tooBig(): boolean {
    if (this.clocksHeight() > this.windowHeight()) {
      return true;
    }

    return Array.from(document.querySelectorAll(".clock")).some(
      (clock) => clock.scrollWidth > window.innerWidth
    );
  }

  tooSmall(): boolean {
    if (this.tooBig()) {
      return false;
    }

    return this.clocksHeight() < this.windowHeight();
  }
}

function relativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffSeconds = Math.round((now - then) / 1000);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      const value = Math.round(-diffSeconds / secondsInUnit);
      return formatter.format(value, unit);
    }
  }

  return formatter.format(0, "second");
}

class GitHubStatus {
  id = "kctbh9vrtdwd";
  url = `https://${this.id}.statuspage.io/api/v2/summary.json`;
  div = document.querySelector(".status") as HTMLElement;

  constructor() {
    setInterval(() => this.checkStatus(), 60000);
    this.checkStatus();
  }

  async checkStatus() {
    try {
      const response = await fetch(this.url);
      if (!response.ok) return;
      const summary: StatusSummary = await response.json();
      this.setStatus(summary);
    } catch {
      // Silently ignore fetch errors
    }
  }

  clearStatus() {
    this.div.classList.remove("minor", "major", "critical");
    this.div.innerHTML = "";
    this.div.style.display = "none";
  }

  setStatus(statusSummary: StatusSummary) {
    const status = statusSummary.status;

    if (status.indicator === "none") {
      this.clearStatus();
    } else {
      this.div.classList.remove("minor", "major", "critical");
      this.div.innerHTML = "";

      statusSummary.incidents.forEach((incident) => {
        if (incident.incident_updates.length === 0) return;

        const latestUpdate = incident.incident_updates[0];
        const timestamp = relativeTime(latestUpdate.created_at);

        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = latestUpdate.status;
        p.append(`${timestamp}: `, strong, ` - ${latestUpdate.body}`);
        this.div.appendChild(p);
      });

      this.div.classList.add(status.indicator);
      this.div.style.display = "block";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Legacy ?location= support
  const locationParam = new URLSearchParams(location.search).get("location");
  if (locationParam) {
    const clock = document.createElement("div");
    clock.className = "clock";

    const timeDiv = document.createElement("div");
    timeDiv.className = "time";

    const locationDiv = document.createElement("div");
    locationDiv.className = "location";
    locationDiv.textContent = locationParam;

    clock.append(timeDiv, locationDiv);
    document.querySelector(".clocks")?.appendChild(clock);
  }

  document.querySelectorAll(".clock").forEach((clock) => {
    new SituationClock(clock as HTMLElement);
  });

  new SituationClockResizer();
  new GitHubStatus();
});
