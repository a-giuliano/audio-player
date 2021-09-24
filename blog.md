In this tutorial, we are going to build an audio player component using [Stencil](https://stenciljs.com/). You’ll be introduced to many fundamental concepts in Stencil and by the end of the tutorial you’ll have a foundational audio player component that you can customize for your own apps.

Stencil is a great tool for building reusable web components and is especially suitable for building out design systems at scale. Stencil components can be incorporated into many front-end frameworks like React, Angular, and Vue—or no framework at all. By building our audio player with Stencil, we’ll have an incredibly versatile component that we can use anywhere.

<!--more-->

Here’s the final audio player component we’ll be building:

<img src="https://blog.ionicframework.com/wp-content/uploads/2021/09/AudioPlayerComponent.png">

Find all the code for this tutorial at the [Stencil audio player component GitHub repository here]<https://github.com/a-giuliano/audio-player>.

## Set Up Your Stencil Project

To create a new Stencil project, we'll want to open up the terminal and run the following command:

```bash
npm init stencil
```

After running this command, you may be prompted to give permission to install the `create-stencil` package. If so, answer “yes” to the prompt. Next, we'll be prompted for a starter. Select "component" as that's what we'll be building in this tutorial.

```bash
? Pick a starter › - Use arrow-keys. Return to submit.

   ionic-pwa     Everything you need to build fast, production ready PWAs
   app           Minimal starter for building a Stencil app or website
❯  component     Collection of web components that can be used anywhere
```

Next you'll be prompted for a project name. Feel free to name your project whatever you like. I named mine `audio-player-project`. Once you've named your project, you're all set up and ready to create a component.

## Generate a New Component

Once we've created the Stencil project and we've navigated inside the project directory, we can generate all of the boilerplate code for our component with the following command:

```bash
npm run generate
```

When prompted for the component tag name, feel free to name it whatever you like. Just make sure that the name uses dash-case (includes a hyphen). We'll be naming the component `audio-player`. After you name the component, press enter again to generate all of the additional files. These files are used for testing and styling. Finally, navigate to `src/components/audio-player/audio-player.tsx` (this will be different if you've named your component something else). This `audio-player.tsx` file is the core of our component and we'll also be using `audio-player.css` for styling.

## Props and State

In order to build this component, we need to think of all the required elements. We want to be able to provide any title and audio source for the player. Therefore, we need to use the [`@Prop` decorator](https://stenciljs.com/docs/properties) to expose these properties.

We also need a few pieces of state in our audio player. We want to know the total duration of the audio clip, the current time of the clip, and whether or not the audio is playing or paused. Because each of these aspects can change depending on how the user interacts with the component, we’ll add them as pieces of state with the [`@State` decorator](https://stenciljs.com/docs/state).

Finally, we need one last piece of state that we’ll use as a reference to our `audio` element in order to access certain properties of the audio clip. With all of that in mind, we can initialize our props and state.

```ts
Export class AudioPlayer {
  @Prop() title: string;
  @Prop() src: string;

  @State() isPlaying: boolean = false;
  @State() duration: number = 0;
  @State() currentTime: number = 0;
  @State() audioPlayer: HTMLAudioElement;
```

## Rendering the Audio Player

Now that we have all of our properties and states, we can begin to incorporate them into our render function to display them in the component.

```jsx
render() {
  return (
    <div class="container">
      <div class="title">{this.title}</div>
      <div class="player">
        <button class="play-button">
          {this.isPlaying ? 'Pause' : 'Play' }
        </button>
        {this.currentTime + "/" + this.duration}
        <audio
          src={this.src}
          preload="metadata"
          ref={(el) => this.audioPlayer = el as HTMLAudioElement}
        >
          Your browser does not support the HTML5 audio element
        </audio>
      </div>
    </div>
  );
}
```

Most of the component is simply displaying the values of our props and state. The play button uses conditional rendering to display “play” or “pause” depending on whether or not the audio is playing. Most importantly, we have the `audio` element at the bottom. Naturally, we set the source to the value of the prop passed into the component. By setting the `preload` attribute to `metadata`, we are specifying that the browser should load the audio metadata on page load. Finally, we use the `ref` attribute to create a reference to the `audio` element.

Of course, we’ll need to pass in attribute values for our `audio-player` in our `index.html` file.

```html
<audio-player title="My Audio Clip" src="https://blog.ionicframework.com/wp-content/uploads/2021/09/Theme-Song-Ferdinand-Souvenir.mp3" />
```

Feel free to use whatever audio source you want here.

## Playing Audio

Next, we want to add some functionality so we can actually play our audio. Luckily for us, our `audio` element has methods for doing just that. Using our reference to the `audio` element, and making sure to manage our `isPlaying` state, we can create a function to play and pause.

```ts
togglePlay = () => {
  if (this.isPlaying) {
    this.audioPlayer.pause();
    this.isPlaying = false;
  } else {
    this.audioPlayer.play();
    this.isPlaying = true;
  }
};
```

Then call that function when our button is pressed.

```jsx
<button class="play-button" onClick={this.togglePlay}>
  {this.isPlaying ? 'Pause' : 'Play'}
</button>
```

## Audio Duration

Both our `duration` and `currentTime` states will be numbers representing time in seconds. We want to display these values to the user, but we want the time in minutes and seconds. Let’s create a function that takes time in seconds and formats the time in a more human readable way.

```ts
formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
  return minutes + ':' + seconds;
};
```

`toLocaleString` is a convenient little method that allows us to prepend a 0 when the seconds value is a single digit. This way, one minute and three seconds is “1:03” instead of “1:3”.

Now let’s use this function to format our times.

```jsx
{
  this.formatTime(this.currentTime) + '/' + this.formatTime(this.duration);
}
```

Now that duration and current time are initialized and formatted, let’s actually set their values. First, we’ll set the duration. This is a property that we can access on our `audioPlayer` element. However, we can only access it after our `audioPlayer` reference has been attached to our `audio` element and the audio metadata has loaded. We can wait for both of those events like so:

```ts
@Watch('audioPlayer')
watchAudioPlayerHandler() {
  this.audioPlayer.onloadedmetadata = () => {
    this.duration = this.audioPlayer.duration;
  }
}
```

Here we use the [`@Watch` decorator](https://stenciljs.com/docs/reactive-data) which executes the attached function whenever the specified state changes. In our case, the `audioPlayer` state changes when it becomes a reference to the `audio` element. That change is our cue to grab the audio duration. To do that, we have to ensure the metadata has been loaded and is available, so we use the `onloadedmetadata` method.

## Current Time

The `currentTime` is a little more complex because it is constantly changing. For such a situation we can leverage `requestAnimationFrame()` which allows us to make a request to the browser to execute a specific function before the next repaint. The function is passed to `requestAnimationFrame()` as a callback. Most importantly, if that function contains another call to `requestAnimationFrame()`, it will create an animation loop. We’ll do this to continually increment our current time.

```ts
incrementTime = () => {
  this.currentTime = this.audioPlayer.currentTime;
  this.stopId = requestAnimationFrame(this.incrementTime);
};
```

You may be curious about `this.stopId`. This is a number that is returned by `requestAnimationFrame()` to identify the animation request. We can declare it towards the top of our component.

```ts
private stopId: number;
```

And we can use it in our `togglePlay` function to stop the animation:

```ts
togglePlay = () => {
  if (this.isPlaying) {
    this.audioPlayer.pause();
    this.isPlaying = false;
    cancelAnimationFrame(this.stopId);
  } else {
    this.audioPlayer.play();
    this.isPlaying = true;
    this.incrementTime();
  }
};
```

When we want to play the audio, we call our `incrementTime` function to start the animation loop, and when we pause, we call `cancelAnimationFrame` with our `stopId` to end the animation loop.

## Make it Pretty

Our play/pause button works well, but it doesn't look great. To use icons instead of text, we must first create a new folder under `src` called `assets`. We then have to reference our `assets` directory in our component.

```ts
@Component({
  tag: 'audio-player',
  styleUrl: 'audio-player.css',
  assetsDirs: ['assets'],
  shadow: true,
})
```

Next, we’ll add our [play](https://github.com/a-giuliano/audio-player/blob/master/src/assets/play.svg) and [pause](https://github.com/a-giuliano/audio-player/blob/master/src/assets/pause.svg) icons to our `assets` folder. Finally, we can use `getAssetPath()` in an `img` tag to display our icons.

```jsx
<div class="play-button" onClick={this.togglePlay}>
  {this.isPlaying ? <img src={getAssetPath('../../assets/pause.svg')} /> : <img src={getAssetPath('../../assets/play.svg')} />}
</div>
```

To top it all off, we’ll add some CSS in `audio-player.css`:

```css
:host {
  display: block;
  font-family: sans-serif;
}

.container {
  width: fit-content;
  padding: 12px;
  border-radius: 8px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

.title {
  font-weight: bold;
  margin-bottom: 8px;
}

.player {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.play-button {
  width: 16px;
}
```

And there you have it! We’ve built the foundation of an audio player component that you can now add all kinds of exciting features and styles to.Our audio player is one example, but you can build any component you want with Stencil, like a [calendar](https://ionicframework.com/blog/building-with-stencil-calendar-component/) or a [clock](https://ionicframework.com/blog/building-with-stencil-clock-component/). You can then use the components you build to create an entire design system that can be used across different frameworks. Needless to say, we’re excited to see what you decide to create!
