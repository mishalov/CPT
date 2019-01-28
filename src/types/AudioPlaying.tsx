import { Audio } from "./playlist/Audio";

export class AudioPlaying {
  public audio: Audio;
  public fullPath: string;
  public URL: string;
  constructor(audio: Audio, fullPath: string, URL: string) {
    this.audio = audio;
    this.fullPath = fullPath;
    this.URL = URL;
  }
}
