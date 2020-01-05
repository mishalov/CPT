import { FileSet } from "../types/playlist/FileSet";
import { Audio } from "../types/playlist/Audio";
import { File } from "../types/playlist/File";
/**
 *
 * @param filest Fileset that need to be flatten
 * @param list empty array where files will be pushed
 */
const filesetToFlat = function(filest: FileSet, list: File[]) {
  filest.files.forEach(file => {
    if (file.content instanceof Audio) {
      list.push(file);
    } else {
      filesetToFlat(file.content, list);
    }
  });
  return list;
};

export default filesetToFlat;
