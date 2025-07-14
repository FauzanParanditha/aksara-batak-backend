import fs from "fs";
import path from "path";

export const deleteLocalFile = (photoUrl: string) => {
  const filePath = path.join(
    __dirname,
    "../../uploads/payments",
    path.basename(photoUrl)
  );
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

export const deleteLocalFileTeam = (photoUrl: string) => {
  const filePath = path.join(
    __dirname,
    "../../uploads/payments",
    path.basename(photoUrl)
  );
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};
