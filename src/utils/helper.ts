import crypto from "crypto";
import fs from "fs";
import path from "path";
import { SCORING_WEIGHT } from "../config/scoring";

export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

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

export const calculateWeightedScore = (
  scores: { criteria: string; score: number }[]
): number => {
  return scores.reduce((total, entry) => {
    const weight = SCORING_WEIGHT[entry.criteria] ?? 0;
    return total + entry.score * weight;
  }, 0);
};
