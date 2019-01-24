import { Audio } from "./Audio";
import { FileSet } from "./FileSet";

export class File {
  public title: string;
  public type: "Folder" | "File";
  public content: Audio | FileSet;
  constructor(
    title: string,
    type: "Folder" | "File",
    content: Audio | FileSet
  ) {
    this.title = title;
    this.type = type;
    this.content = content;
  }
}
