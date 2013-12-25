# Situation Clock

*LED-style situation room clock formatted for iPads*. [Live example](http://ben.balter.com/situation-clock/).

Forked from https://github.com/schacon/situation-clock, which states:

> If you want to build a Situation Room, you'll need some sweet red clocks in the walls.  
>
> You could end up with something like this:
>
> ![img_1399](https://f.cloud.github.com/assets/70/1504950/e0d8ca26-48c8-11e3-874f-5e0bbad613ed.jpg)

## This modified version does a few things:

* Full, native timezone support
* Ability to have multiple clocks per iPad
* Jekyllification
* CoffeeScript and Bower ALL THE THINGS

## Usage

1. Get an iPad, and fire up Safari
2. Visit [ben.balter.com/situation-clock](http://ben.balter.com/situation-clock) in Safari, or fork this repository and open the GitHub Pages published version of your fork
3. Click the share button
4. Clock add to home screen
5. Give your situation clock a name
6. Open the newly created shortcut
7. (optional) use Velcro or similar to mount to the wall

## Adding/modifying a clock

Clocks are stored in the YAML frontmatter of `index.html`. To add/modify a clock, simply follow the format of `"label": timezone`. Example:

```yaml
---
clocks:
  "Washington DC": America/New_York
  "San Francisco": America/Los_Angeles
  "EPOCH": EPOCH
---
```

## Developing

1. Establish your development environment by running `script/bootstrap`
2. Spin up a local version by running `script/server`
3. Visit [localhost:4000](http://localhost:4000) in your favorite browser

## Contributing

1. Fork the project
2. Create a new, descriptively named feature branch
3. Make your changes
4. Submit a pull request
