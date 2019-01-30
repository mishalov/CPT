import { observable, action } from "mobx";
import { FileSet } from "../types/playlist/FileSet";
import { ICloudClient } from "../types/clients/ICloudClient";
import { async } from "q";
import { AudioPlaying } from "../types/AudioPlaying";
import { Audio } from "../types/playlist/Audio";
import { checkIfStateModificationsAreAllowed } from "mobx/lib/internal";

export class FilesStore {
  @observable files!: FileSet;
  @observable sourceCloud: "OneDrive" | "Dropbox" | string = "";
  @observable client!: ICloudClient;
  @observable playNow: AudioPlaying = new AudioPlaying(
    new Audio("", "", "", 0, ""),
    "",
    ""
  );
  @observable isPlay: boolean = false;
  @action.bound setCloud = (sourceCloud: "OneDrive" | "Dropbox" | "") => {
    this.sourceCloud = sourceCloud;
  };
  @action.bound setClient = (client: ICloudClient) => {
    this.client = client;
  };
  @action.bound fetchFiles = async () => {
    this.files = await this.client.getAllFiles();
  };
  @action.bound playFile = async (path: string) => {
    this.client.playFile(path).then(result => {
      this.playNow = result;
      this.isPlay = true;
    });
  };
  @action.bound setNowDuration = (dur: number) => {
    this.playNow.audio.duration = dur;
  };
  @action.bound play = () => {
    this.isPlay = true;
  };
  @action.bound pause = () => {
    this.isPlay = false;
  };
  @action.bound switchPlay = () => {
    this.isPlay = !this.isPlay;
  };
  @action.bound getNext = () => {
    this.client.getNext(this.playNow.fullPath).then(file => {
      this.isPlay = true;
      this.playNow = file;
    });
  };

  @action.bound getPrev = () => {
    this.client.getPrev(this.playNow.fullPath).then(file => {
      this.isPlay = true;
      this.playNow = file;
    });
  };
}

export default new FilesStore();
