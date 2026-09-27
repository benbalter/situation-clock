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

    if (this.timezone !== "EPOCH") {
      try {
        this.formatter = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
          timeZone: this.timezone || undefined,
        });
      } catch {
        // Invalid timezone: flag this clock without breaking the others
        this.setTime("ERR");
        return;
      }
    }

    this.tick();

    // Align ticks to the top of each second so minute rollovers are prompt
    setTimeout(() => {
      this.tick();
      setInterval(() => this.tick(), 1000);
    }, 1000 - (Date.now() % 1000));
  }

  tick() {
    if (this.formatter) {
      this.setTime(this.formatter.format(new Date()));
    } else {
      this.setTime(Math.floor(Date.now() / 1000).toString());
    }
  }

  setTime(time: string) {
    this.time.textContent = time;
  }
}

class SituationClockResizer {
  constructor() {
    window.addEventListener("resize", () => this.resize());

    // Size once the LED font has loaded so measurements are accurate. The
    // clocks are hidden, so explicitly request the font rather than waiting
    // on document.fonts.ready, which can resolve before it's fetched.
    document.fonts
      .load('1em "Ericsson GA628"')
      .catch(() => [])
      .then(() => {
        document.querySelectorAll(".clock").forEach((el) => {
          el.classList.remove("hidden");
        });
        this.resize();
      });
  }

  clocksHeight(): number {
    const clocks = document.querySelector(".clocks");
    return clocks?.clientHeight ?? 0;
  }

  setFontSize(size: number) {
    document.body.style.fontSize = `${size}px`;
  }

  // Binary search for the largest font size that still fits the viewport
  resize() {
    let low = 1;
    let high = Math.max(window.innerHeight, 1);

    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      this.setFontSize(mid);
      if (this.tooBig()) {
        high = mid - 1;
      } else {
        low = mid;
      }
    }

    this.setFontSize(low);
  }

  tooBig(): boolean {
    if (this.clocksHeight() > window.innerHeight) {
      return true;
    }

    return Array.from(document.querySelectorAll(".clock")).some(
      (clock) => clock.scrollWidth > window.innerWidth
    );
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

class StatusPage {
  div: HTMLElement;
  url: string;

  constructor(div: HTMLElement, id: string) {
    this.div = div;
    this.url = `https://${id}.statuspage.io/api/v2/summary.json`;

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

  setStatus(statusSummary: StatusSummary) {
    const status = statusSummary.status;

    this.div.classList.remove("minor", "major", "critical");
    this.div.replaceChildren();

    if (status.indicator === "none") {
      this.div.classList.add("hidden");
      return;
    }

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

    // Degraded components without an incident still deserve a message
    if (!this.div.hasChildNodes()) {
      const p = document.createElement("p");
      p.textContent = status.description;
      this.div.appendChild(p);
    }

    this.div.classList.add(status.indicator);
    this.div.classList.remove("hidden");
  }
}

// Keep the screen on while the clock is visible
function keepAwake() {
  if (!("wakeLock" in navigator)) return;

  const request = async () => {
    try {
      await navigator.wakeLock.request("screen");
    } catch {
      // Denied (e.g. low battery); nothing else to do
    }
  };

  // The lock is released whenever the page is hidden, so re-acquire it
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") request();
  });

  request();
}

document.addEventListener("DOMContentLoaded", () => {
  // Legacy ?location= support
  const locationParam = new URLSearchParams(location.search).get("location");
  if (locationParam) {
    const clock = document.createElement("div");
    clock.className = "clock hidden";

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

  const statusDiv = document.querySelector<HTMLElement>(".status");
  const statusPageId = statusDiv?.dataset.statuspage;
  if (statusDiv && statusPageId) {
    new StatusPage(statusDiv, statusPageId);
  }

  keepAwake();
});
