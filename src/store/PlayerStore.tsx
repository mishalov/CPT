import { observable, action, toJS } from "mobx";
import { FileSet } from "../types/playlist/FileSet";
import { ICloudClient } from "../types/clients/ICloudClient";
import { AudioPlaying } from "../types/AudioPlaying";
import { Audio } from "../types/playlist/Audio";
import { File } from "../types/playlist/File";

export class PlayerStore {
  filesFlatList: File[] = [];
  @observable files!: FileSet;
  @observable sourceCloud: "OneDrive" | "Dropbox" | string = "";
  @observable client!: ICloudClient;
  @observable playNow: AudioPlaying = new AudioPlaying(
    new Audio("", "", "", 0, ""),
    "",
    ""
  );
  @observable isPlay: boolean = false;

  @action setCloud = (sourceCloud: "OneDrive" | "Dropbox" | "") => {
    this.sourceCloud = sourceCloud;
  };

  @action setClient = (client: ICloudClient) => {
    this.client = client;
  };

  @action fetchFiles = async () => {
    const client = this.client;
    this.files = await client.getAllFiles();
    this.filesFlatList = client.filesFlatList();
  };

  @action fetchFilesAlbum = async () => {
    if (this.files) {
      this.files = await this.client.getAllFilesAlbums();
    } else {
      await this.client.getAllFiles();
      this.files = await this.client.getAllFilesAlbums();
    }
    this.filesFlatList = this.client.filesFlatList();
  };

  @action playFile = async (path: string) => {
    this.client.playFile(path).then(result => {
      this.playNow = result;
      this.isPlay = true;
    });
  };
  @action setNowDuration = (dur: number) => {
    this.playNow.audio.duration = dur;
  };
  @action play = () => {
    this.isPlay = true;
  };
  @action pause = () => {
    this.isPlay = false;
  };
  @action switchPlay = () => {
    this.isPlay = !this.isPlay;
  };
  @action getNext = async () => {
    const path = this.playNow.fullPath;
    const { filesFlatList, client } = this;
    let nextIndex =
      filesFlatList.findIndex(el => (el.content as Audio).fullPath === path) +
      1;

    nextIndex = nextIndex >= filesFlatList.length ? 0 : nextIndex;
    const file = await client.playFile(
      (filesFlatList[nextIndex].content as Audio).fullPath
    );
    this.isPlay = true;
    this.playNow = file;
  };

  @action getPrev = async () => {
    const path = this.playNow.fullPath;
    let nextIndex = this.filesFlatList.findIndex(
      el => (el.content as Audio).fullPath === path
    );
    nextIndex = nextIndex === 0 ? 0 : nextIndex - 1;
    const file = await this.client.playFile(
      (this.filesFlatList[nextIndex].content as Audio).fullPath
    );

    this.isPlay = true;
    this.playNow = file;
  };
}

export default new PlayerStore();
