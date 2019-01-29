import { ICloudClient } from "./ICloudClient";
import { Dropbox } from "dropbox";
import { IDropboxFile } from "../playlist/IDropboxFile";
import { FileSet } from "../playlist/FileSet";
import { File } from "../playlist/File";
import { Audio } from "../playlist/Audio";
import { AudioPlaying } from "../AudioPlaying";
import { duration } from "moment";
import { Client } from "@microsoft/microsoft-graph-client";

const normalize = function(dropBox: IDropboxFile[]): FileSet {
  const fileSet: FileSet = new FileSet();

  const folders = dropBox.filter(el => el[".tag"] === "folder");

  // Создаем папки
  const folderNames: string[][] = folders
    .map(el => el.path_lower.split("/").filter(e => e))
    .sort((a, b) => (a.length > b.length ? 1 : a.length === b.length ? 0 : -1));

  folderNames.forEach((pathArr: string[]) => {
    let nodeNow = fileSet;

    pathArr.forEach((pathName: string) => {
      const newFolder = new FileSet();

      if (nodeNow.files) {
        const existingFolder = nodeNow.files.find(el => el.title === pathName);
        if (existingFolder) {
          nodeNow = existingFolder.content as FileSet;
        } else {
          nodeNow.files.push(new File(pathName, "Folder", newFolder));
          nodeNow = newFolder;
        }
      } else {
        nodeNow.files = [new File(pathName, "Folder", newFolder)];
        nodeNow = newFolder;
      }
    });
  });
  // Заполняем файлы
  const audios = dropBox.filter(el => el[".tag"] === "file");
  const audiosNames: string[][] = audios
    .map(el => el.path_lower.split("/").filter(e => e))
    .sort((a, b) => (a.length > b.length ? 1 : a.length === b.length ? 0 : -1));

  audiosNames.forEach((pathArr: string[]) => {
    let nodeNow = fileSet;
    const filePath = "/" + pathArr.join("/");
    const dropBoxFile = dropBox.find(
      el => el.path_lower === filePath
    ) as IDropboxFile;
    const newAudio = new File(
      dropBoxFile.name,
      "File",
      new Audio(
        dropBoxFile.name,
        "Не доступно для Dropbox",
        "Не доступно для Dropbox",
        300,
        filePath
      )
    );

    pathArr.forEach((pathName: string, index: number) => {
      if (pathArr.length === 1 || pathArr.length - 1 === index) {
        if (!nodeNow.files) nodeNow.files = [newAudio];
        else nodeNow.files.push(newAudio);
      } else {
        nodeNow = (nodeNow.files.find(el => el.title === pathName) as File)
          .content as FileSet;
      }
    });
  });

  return fileSet;
};

export class OneDriveClient implements ICloudClient {
  client: Client;
  public readonly cloudSource = "OneDrive";
  constructor(client: Client) {
    this.client = client;
  }

  getAllFiles = async () => {
    const disc = await this.client.api("/me/drive/root:/music").get();
    console.log("disc: ", disc);
    return await new FileSet();
  };

  playFile = async (path: string) => {
    // const pathArr = path.split("/");
    // const pseudoMeta = pathArr[pathArr.length - 2];

    // const file = await this.client.filesGetTemporaryLink({ path });
    // const { metadata } = file;
    // const audio = new Audio(
    //   metadata.name,
    //   pseudoMeta,
    //   pseudoMeta,
    //   0,
    //   file.metadata.path_lower || ""
    // );

    return new AudioPlaying(
      new Audio("sdf", "asdfas", "dsfaas", 34, "23fa"),
      "asdfasd",
      "asdfas"
    );
  };

  authorize = () => {};
}
