import { ICloudClient } from "./ICloudClient";
import { Dropbox } from "dropbox";
import { IDropboxFile } from "../playlist/IDropboxFile";
import { FileSet } from "../playlist/FileSet";
import { File } from "../playlist/File";
import { Audio } from "../playlist/Audio";
import { AudioPlaying } from "../AudioPlaying";
import { duration } from "moment";
import { Client } from "@microsoft/microsoft-graph-client";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { normalize } from "path";
import { User } from "../playlist/User";

export class OneDriveClient implements ICloudClient {
  client: Client;
  public readonly cloudSource = "OneDrive";
  mapOfFiles: File[] = [];

  constructor(client: Client) {
    this.client = client;
  }

  normalize = async (
    oneDriveItem: MicrosoftGraph.DriveItem
  ): Promise<FileSet> => {
    const fileSet = new FileSet();
    fileSet.files = [];
    if (oneDriveItem.children) {
      const children = oneDriveItem.children
        .filter(el => el.folder || el.audio)
        .sort((a, b) =>
          a.folder && b.audio ? 0 : a.folder && b.folder ? 0 : 1
        );
      for (let i = 0; i < children.length; i++) {
        const element = children[i];
        if (element.folder) {
          const disc = await this.client
            .api(`/me${element.parentReference!.path}/${element.name}`)
            .expand("children")
            .get();
          const file = new File(
            element.name!,
            "Folder",
            await this.normalize(disc)
          );
          fileSet.files.push(file);
        } else if (element.audio) {
          const file = new File(
            element.name!,
            "File",
            new Audio(
              element.audio.title || element.name!,
              element.audio.album || oneDriveItem.name!,
              element.audio.artist || oneDriveItem.name!,
              element.audio.duration!,
              (element as any)["@microsoft.graph.downloadUrl"]
            ),
            element.id
          );
          this.mapOfFiles.push(file);
          fileSet.files.push(file);
        }
      }
    }

    return fileSet;
  };

  getAllFiles = async () => {
    const folder: MicrosoftGraph.DriveItem = await this.client
      .api("/me/drive/root:/music")
      .expand("children")
      .get();

    const fileSet = await this.normalize(folder);
    return await fileSet;
  };

  playFile = async (path: string) => {
    const audioFile = this.mapOfFiles.find(
      el => (el.content as Audio).fullPath === path
    ) as File;
    this.client
      .api(`/me/drive/items/${audioFile.itemId}/thumbnails`)
      .select("small")
      .get();
    return new AudioPlaying(audioFile.content as Audio, path, path);
  };

  authorize = () => {};

  getMe = async () => {
    const odUser: MicrosoftGraph.User = await this.client.api("/me").get();
    return new User(
      odUser.displayName || (odUser.givenName + " " + odUser.surname)!
    );
  };

  getNext = async (path: string) => {
    let nextIndex = this.mapOfFiles.findIndex(
      el => (el.content as Audio).fullPath === path
    );
    nextIndex = nextIndex === this.mapOfFiles.length - 1 ? 0 : nextIndex + 1;
    return this.playFile(
      (this.mapOfFiles[nextIndex].content as Audio).fullPath
    );
  };

  getPrev = async (path: string) => {
    let nextIndex = this.mapOfFiles.findIndex(
      el => (el.content as Audio).fullPath === path
    );
    nextIndex = nextIndex === 0 ? 0 : nextIndex - 1;
    return this.playFile(
      (this.mapOfFiles[nextIndex].content as Audio).fullPath
    );
  };
}
