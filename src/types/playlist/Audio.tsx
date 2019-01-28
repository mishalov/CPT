import { observable } from "mobx";

export class Audio {
  public title: string;
  public album: string;
  public author: string;
  public fullPath: string;
  @observable public duration: number;
  constructor(
    title: string,
    album: string,
    author: string,
    duration: number,
    fullPath: string
  ) {
    this.title = title;
    this.album = album;
    this.author = author;
    this.duration = duration;
    this.fullPath = fullPath;
  }
}
