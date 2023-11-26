import { Dimensions } from "react-native";

interface DurationDays {
  duration: "5Y" | "2Y" | "1Y" | "1B" | "1Q" | "1M" | "1W" | "3D";
  days: number;
  format: string;
}

export const doNothing = () => {};

const { height, width } = Dimensions.get("window");

export const winHeight = height;
export const winWidth = width;

export const monthYears = () => {
  let arr = Array.from(Array(18).keys()).map((s) => 100 * s + 202300);
  let newArr = [] as number[];

  arr.forEach((s) => {
    newArr.push(
      ...Array(12)
        .fill(s)
        .map((t, ind) => t + ind + 1)
    );
  });

  return newArr;
};

export const labors = [
  "Labor (Others)",
  "Rebore",
  "Press",
  "Tire Changer",
  "Overhaul",
  "Torno",
  "Asinta",
  "Palit Gulong",
  "Change Oil",
  "Honing",
  "Rimatse",
  "General",
];

export const defaultBills = {
  b1000: "",
  b500: "",
  b200: "",
  b100: "",
  b50: "",
  b20: "",
};

export const defaultCoins = {
  c20: "",
  c10: "",
  c5: "",
  c1: "",
};

export const defaultUser = {
  username: "",
  userId: "",
  firstName: "",
  lastName: "",
  privilege: "",
  isActive: true,
};

export const defaultProduct = {
  // part: "",
  brand: "",
  pieces: "1",
  unitPP: "",
  packPP: "",
  unitSP: "",
  packSP: "",
  miscInfo: "",
  location: "",
  minimum: "",
  unit: "pc.",
  isOrig: false,
};

export const defaultDatePrice = {
  date: new Date(),
  price: -1,
};

export const priceCodes = [
  { number: "1", code: "L" },
  { number: "2", code: "U" },
  { number: "3", code: "C" },
  { number: "4", code: "K" },
  { number: "5", code: "Y" },
  { number: "6", code: "S" },
  { number: "7", code: "T" },
  { number: "8", code: "O" },
  { number: "9", code: "R" },
  { number: "0", code: "E" },
];

export const durationDays = [
  { duration: "5Y", days: 1825, format: "YYYY" },
  { duration: "2Y", days: 730, format: "MMM 'YY" },
  { duration: "1Y", days: 365, format: "MMM" },
  { duration: "1B", days: 180, format: "MMM" },
  { duration: "1Q", days: 90, format: "M-D" },
  { duration: "1M", days: 30, format: "M-D" },
  { duration: "1W", days: 7, format: "DD" },
  { duration: "3D", days: 3, format: "MM-D hA" },
] as DurationDays[];

export const suppliers = [
  "NC Borja",
  "United Bearing",
  "Car Depot",
  "Northern Arrow",
  "Abergas",
  "Oceanic",
  "Jimmy",
  "Pado",
  "Long Hair",
  "Spring",
  "Rostam",
  "Autolube",
];
