import { Component, h, Prop, State, Watch, getAssetPath } from '@stencil/core';

@Component({
  tag: 'audio-player',
  styleUrl: 'audio-player.css',
  assetsDirs: ['assets'],
  shadow: true,
})
export class AudioPlayer {
  @Prop() playerTitle: string;
  @Prop() src: string;

  @State() isPlaying: boolean = false;
  @State() duration: number = 0;
  @State() currentTime: number = 0;
  @State() audioPlayer: HTMLAudioElement;

  private stopId: number;

  @Watch('audioPlayer')
  watchAudioPlayerHandler() {
    this.audioPlayer.onloadedmetadata = () => {
      this.duration = this.audioPlayer.duration;
    };
  }

  incrementTime = () => {
    this.currentTime = this.audioPlayer.currentTime;
    this.stopId = requestAnimationFrame(this.incrementTime);
  };

  formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    return minutes + ':' + seconds;
  };

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

  render() {
    return (
      <div class="container">
        <div class="title">{this.playerTitle}</div>
        <div class="player">
          <div class="play-button" onClick={this.togglePlay}>
            {this.isPlaying ? <img src={getAssetPath('../../assets/pause.svg')} /> : <img src={getAssetPath('../../assets/play.svg')} />}
          </div>
          {this.formatTime(this.currentTime) + '/' + this.formatTime(this.duration)}
          <audio src={this.src} preload="metadata" ref={el => (this.audioPlayer = el as HTMLAudioElement)}>
            Your browser does not support the HTML5 audio element
          </audio>
        </div>
      </div>
    );
  }
}
