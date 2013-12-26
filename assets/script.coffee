class SituationClock

  constructor: (clock) ->
    @clock = $ clock
    @timezone = @clock.data "timezone"
    @time = @clock.find ".time"

    if @timezone is "EPOCH"
      setInterval @updateTimeEpoch, 1000
    else
      setInterval @updateTime, 1000

  # Updates the time for the current timezone
  updateTime: =>

    # Default to system if no timezone is given
    if @timezone
      time = new timezoneJS.Date new Date, @timezone
    else
      time = new Date

    h = @leadingZero time.getHours()
    m = @leadingZero time.getMinutes()
    @setTime "#{h}:#{m}"

  # Updates the time with the current EPOCH timestamp
  updateTimeEpoch: =>
    @setTime Math.round new Date().valueOf() / 1000

  # Padds all integers < 10 with a leading zero
  leadingZero: (num) ->
    if num < 10
      "0#{num}"
    else
      num

  # Update the time div with a given string
  setTime: (time) ->
    @time.html time.toString()

$ ->
  # Init timezone support
  timezoneJS.timezone.zoneFileBasePath = './tz'
  timezoneJS.timezone.init "async": false

  # Legacy ?location= support
  if match = location.search.match /\?location=(.*)$/
    clock = $ "<div class=\"clock\"></div>"
    clock.append "<div class=\"time\"></div>"
    clock.append "<div class=\"location\">#{match[1]}</div>"
    $('.clocks').append clock

  # Init clocks
  $(".clock").each (i,clock) ->
    new SituationClock clock

  # Fade in after initial time is set
  setTimeout ->
    $(".clock").fadeIn()
  , 1000
