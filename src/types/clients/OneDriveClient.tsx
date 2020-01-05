import { ICloudClient } from "./ICloudClient";
import { FileSet } from "../playlist/FileSet";
import { File } from "../playlist/File";
import { Audio } from "../playlist/Audio";
import { AudioPlaying } from "../AudioPlaying";
import { Client } from "@microsoft/microsoft-graph-client";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { User } from "../playlist/User";
import filesetToFlat from "../../helpers/filesetToFlat";

export class OneDriveClient implements ICloudClient {
  client: Client;
  public readonly cloudSource = "OneDrive";
  private mapOfFiles: File[] = [];

  public filesFlatList(): File[] {
    return this.mapOfFiles;
  }

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

  normalizeAlbums = async (): Promise<FileSet> => {
    const authors: File[] = [];
    this.mapOfFiles.forEach(song => {
      const audio = song.content as Audio;
      if (!authors.find(el => el.title === audio.author)) {
        authors.push(new File(audio.author, "Folder", new FileSet()));
      }
    });

    authors.forEach(author => {
      const albums = new FileSet();
      this.mapOfFiles.forEach(song => {
        const audio = song.content as Audio;
        if (
          !albums.files.find(el => el.title === audio.album) &&
          audio.author === author.title
        ) {
          albums.files.push(new File(audio.album, "Folder", new FileSet()));
        }
      });
      author.content = albums;
    });

    this.mapOfFiles.forEach(song => {
      const audio = song.content as Audio;
      const authorFolder = authors.find(el => el.title === audio.author);
      if (!authorFolder) {
        authors.push(song);
      } else {
        const albumFolder = authorFolder.content as FileSet;
        const songsFolder = albumFolder.files.find(
          el => el.title !== audio.album
        );
        if (!songsFolder) {
          (authorFolder.content as FileSet).files.push(song);
        } else {
          (songsFolder.content as FileSet).files.push(song);
        }
      }
    });

    const fileSet = new FileSet();
    fileSet.files = authors;
    return fileSet;
  };

  getAllFiles = async () => {
    const folder: MicrosoftGraph.DriveItem = await this.client
      .api("/me/drive/root:/music")
      .expand("children")
      .get();

    this.mapOfFiles = [];
    const fileSet = await this.normalize(folder);
    this.mapOfFiles = filesetToFlat(fileSet, []);
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

  getAllFilesAlbums = async () => {
    const fileSet = await this.normalizeAlbums();
    return await fileSet;
  };
}
