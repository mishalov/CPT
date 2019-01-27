import { ICloudClient } from "./ICloudClient";
import { Dropbox } from "dropbox";
import { IDropboxFile } from "../playlist/IDropboxFile";
import { FileSet } from "../playlist/FileSet";
import { File } from "../playlist/File";
import { Audio } from "../playlist/Audio";

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

export class DropboxClient implements ICloudClient {
  client: Dropbox;
  public readonly cloudSource = "DropBox";
  constructor(client: Dropbox) {
    this.client = client;
  }

  getAllFiles = async () => {
    const files = await this.client.filesListFolder({
      recursive: true,
      path: ""
    });
    if (!files) throw new Error("Не удалось получить список файлов!");
    const normalized: FileSet = normalize(files.entries as IDropboxFile[]);
    return normalized;
  };

  authorize = () => {};
}
