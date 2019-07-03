import { ICloudClient } from "./ICloudClient";
import { Dropbox } from "dropbox";
import { IDropboxFile } from "../playlist/IDropboxFile";
import { FileSet } from "../playlist/FileSet";
import { File } from "../playlist/File";
import { Audio } from "../playlist/Audio";
import { AudioPlaying } from "../AudioPlaying";
import { User } from "../playlist/User";

export class DropboxClient implements ICloudClient {
  client: Dropbox;
  public readonly cloudSource = "DropBox";
  public mapOfFiles: File[] = [];
  constructor(client: Dropbox) {
    this.client = client;
  }

  normalize = (dropBox: IDropboxFile[]): FileSet => {
    const fileSet: FileSet = new FileSet();

    const folders = dropBox.filter(el => el[".tag"] === "folder");

    // Создаем папки
    const folderNames: string[][] = folders
      .map(el => el.path_lower.split("/").filter(e => e))
      .sort((a, b) =>
        a.length > b.length ? 1 : a.length === b.length ? 0 : -1
      );

    folderNames.forEach((pathArr: string[]) => {
      let nodeNow = fileSet;

      pathArr.forEach((pathName: string) => {
        const newFolder = new FileSet();

        if (nodeNow.files) {
          const existingFolder = nodeNow.files.find(
            el => el.title === pathName
          );
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
    const audios = dropBox.filter(
      el =>
        el[".tag"] === "file" &&
        el.name.lastIndexOf(".mp3") === el.name.length - 4
    );
    const audiosNames: string[][] = audios
      .map(el => el.path_lower.split("/").filter(e => e))
      .sort((a, b) =>
        a.length > b.length ? 1 : a.length === b.length ? 0 : -1
      );

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
          pathArr[pathArr.length - 2],
          pathArr[pathArr.length - 2],
          300,
          filePath
        )
      );
      this.mapOfFiles.push(newAudio);
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

  getAllFiles = async () => {
    const files = await this.client.filesListFolder({
      recursive: true,
      path: ""
    });
    if (!files) throw new Error("Не удалось получить список файлов!");
    const normalized: FileSet = this.normalize(files.entries as IDropboxFile[]);
    return normalized;
  };

  playFile = async (path: string) => {
    const pathArr = path.split("/");
    const pseudoMeta = pathArr[pathArr.length - 2];

    const file = await this.client.filesGetTemporaryLink({ path });
    const { metadata } = file;
    const audio = new Audio(
      metadata.name,
      pseudoMeta,
      pseudoMeta,
      0,
      file.metadata.path_lower || ""
    );
    return new AudioPlaying(audio, metadata.path_lower || "", file.link);
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

  authorize = () => {};

  getMe = async () => {
    const dbUser = await this.client.usersGetCurrentAccount();
    return new User(dbUser.name.display_name);
  };

  getAllFilesAlbums = async () => {
    return await this.getAllFiles();
  };
}
