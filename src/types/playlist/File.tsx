import { Audio } from "./Audio";
import { FileSet } from "./FileSet";

export class File {
  public title: string;
  public type: "Folder" | "File";
  public content: Audio | FileSet;
  public itemId?: string;
  constructor(
    title: string,
    type: "Folder" | "File",
    content: Audio | FileSet,
    itemId?: string
  ) {
    this.title = title;
    this.type = type;
    this.content = content;
    this.itemId = itemId;
  }
}
