import fs from "fs";
import ini from "ini";

export const readIniSetting = (
  iniPath: string,
  section: string,
  parameter: string
) => {
  const config = ini.parse(fs.readFileSync(`${iniPath}`, "utf-8"));
  return config[section][parameter] as string;
};
