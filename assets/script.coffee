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

  @resize: =>
    windowHeight = window.innerHeight
    clocksHeight = $(".clocks").height()
    fontSize = parseInt $("body").css("font-size").replace( "px", '')

    while @tooBig() && fontSize > 1
      windowHeight = window.innerHeight
      clocksHeight = $(".clocks").height()
      fontSize = parseInt $("body").css("font-size").replace( "px", '')
      $("body").css "font-size", "#{fontSize - 1}px"

    while @tooSmall()
      windowHeight = window.innerHeight
      clocksHeight = $(".clocks").height()
      fontSize = parseInt $("body").css("font-size").replace( "px", '')
      $("body").css "font-size", "#{fontSize + 1}px"

  @tooBig: ->
    windowHeight = window.innerHeight
    clocksHeight = $(".clocks").height()
    return true if clocksHeight + 100 > windowHeight

    tooBig = false
    $(".clock").each (i, clock) ->
      tooBig = true if $(clock)[0].scrollWidth + 100 > window.innerWidth

    tooBig

  @tooSmall: ->
    return false if @tooBig()
    windowHeight = window.innerHeight
    clocksHeight = $(".clocks").height()
    clocksHeight + 150 < windowHeight

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

  # Bind resize event
  $(window).resize SituationClock.resize

  # Fade in after initial time is set
  setTimeout ->
    $(".clock").show()
    SituationClock.resize()
  , 1000
