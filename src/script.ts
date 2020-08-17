import * as $ from "jquery";
import * as moment from "moment-timezone";

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
  clock: JQuery<HTMLElement>;
  timezone: string;
  time: JQuery<HTMLElement>;

  constructor(clock: HTMLElement) {
    this.clock = $(clock);
    this.timezone = this.clock.data("timezone");
    this.time = this.clock.find(".time");

    if (this.timezone === "EPOCH") {
      setInterval(this.updateTimeEpoch.bind(this), 1000);
    } else {
      setInterval(this.updateTime.bind(this), 1000);
    }
  }

  updateTime() {
    let time = moment();

    if (this.timezone) {
      time = time.tz(this.timezone);
    }

    this.setTime(time.format("HH:mm"));
  }

  updateTimeEpoch() {
    const time = Math.round(new Date().valueOf() / 1000);
    this.setTime(time.toString());
  }

  leadingZero(num: number): string {
    return num.toString().padStart(2, "0");
  }

  setTime(time: string) {
    this.time.html(time);
  }
}

class SituationClockResizer {
  constructor() {
    $(window).resize(this.resize.bind(this));

    setTimeout(() => {
      $(".clock").removeClass("d-none");
      this.resize();
    }, 1000);
  }

  windowHeight(): number {
    return window.innerHeight;
  }

  clocksHeight(): number {
    const height = $(".clocks").height();

    if (height === undefined) {
      return 0;
    } else {
      return height;
    }
  }

  fontSize(): number {
    return parseInt($("body").css("font-size").replace("px", ""));
  }

  resize() {
    while (this.tooBig() && this.fontSize() > 1) {
      $("body").css("font-size", `${this.fontSize() - 1}px`);
    }

    while (this.tooSmall()) {
      $("body").css("font-size", `${this.fontSize() + 1}px`);
    }
  }

  tooBig(): boolean {
    if (this.clocksHeight() > this.windowHeight()) {
      return true;
    }

    return Array.from($(".clock")).some((clock) => {
      clock.scrollWidth > window.innerWidth;
    });
  }

  tooSmall(): boolean {
    if (this.tooBig()) {
      return false;
    }

    return this.clocksHeight() + 150 < this.windowHeight();
  }
}

class GitHubStatus {
  id = "kctbh9vrtdwd";
  url = `https://${this.id}.statuspage.io/api/v2/summary.json`;
  div = $(".status");

  constructor() {
    setInterval(this.checkStatus.bind(this), 60000);
    this.checkStatus();
  }

  checkStatus() {
    this.getSummary(this.setStatus.bind(this));
  }

  getSummary(callback: (statusSummary: StatusSummary) => void) {
    $.getJSON(this.url, callback);
  }

  clearStatus() {
    this.div.slideUp().removeClass().addClass("status fixed-top").empty();
  }

  setStatus(statusSummary: StatusSummary) {
    const status = statusSummary.status;

    if (status.indicator == "none") {
      this.clearStatus();
    } else {
      const updates = statusSummary.incidents.map((incident) => {
        const latestUpdate = incident.incident_updates[0];
        const timestamp = moment(latestUpdate.created_at).fromNow();
        return `<p>${timestamp}: <strong>${latestUpdate.status}</strong> - ${latestUpdate.body}</p>`;
      });

      this.div.addClass(status.indicator).html(updates.join("\n")).slideDown();
    }
  }
}

$(($) => {
  // Legacy ?location= support
  const match = location.search.match(/\?location=(.*)$/);
  if (match) {
    const clock = $('<div class="clock"></div>');
    clock.append('<div class="time"></div>');
    clock.append(`<div class="location">${match[1]}</div>`);
    $(".clocks").append(clock);
  }

  for (const clock of Array.from($(".clock"))) {
    new SituationClock(clock);
  }

  new SituationClockResizer();
  new GitHubStatus();
});
