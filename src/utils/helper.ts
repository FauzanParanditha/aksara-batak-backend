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
  scores: { criteria: string; score: number }[],
  decimals = 2
): number | null => {
  // Filter hanya kriteria yang punya bobot & skor valid
  const valid = scores.filter(
    (s) =>
      typeof s.score === "number" &&
      Number.isFinite(s.score) &&
      SCORING_WEIGHT[s.criteria] != null
  );

  if (valid.length === 0) return null;

  // Hitung total bobot kriteria yang TERISI
  const weightSum = valid.reduce(
    (acc, s) => acc + SCORING_WEIGHT[s.criteria],
    0
  );
  if (weightSum <= 0) return null;

  // Hitung skor tertimbang dengan normalisasi bobot
  const weighted = valid.reduce(
    (acc, s) => acc + s.score * (SCORING_WEIGHT[s.criteria] / weightSum),
    0
  );

  return Number(weighted.toFixed(decimals));
};
