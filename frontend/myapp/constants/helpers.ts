import moment from "moment";
import { defaultBills, defaultCoins, priceCodes } from "./constants";
import { Product } from "../stores/ProductStore";
import { observer } from "mobx-react-lite";
import { SparePartStore } from "../stores/SparePartStore";
import { MotorStore } from "../stores/MotorStore";

export type Bills = typeof defaultBills;

export type Coins = typeof defaultCoins;

export const popItemFromListState = <T>(
  itemId: number,
  setItems: (t: T[] | ((u: T[]) => T[])) => void
) => {
  setItems((prev) => prev.filter((s) => s !== itemId));
};

export const moveItemToFirstFromListState = <T>(
  itemId: number,
  setItems: (t: T[] | ((u: T[]) => T[])) => void
) => {
  setItems((prev) => {
    let item = prev.find((s) => s === itemId);
    if (item) return [item, ...prev.filter((s) => s !== itemId)];
    else return [...prev.filter((s) => s !== itemId)];
  });
};

export const toNumString = (t: string, withDecimal?: boolean) => {
  let regex = withDecimal ? /[^.0-9]/g : /[^0-9]/g;
  return isNaN(parseFloat(t.replace(regex, ""))) ? "" : t.replace(regex, "");
};

export const toNumber = (t: string) => {
  return isNaN(parseFloat(t)) ? 0 : parseFloat(t);
};

export const roundToCash = (t: number) => {
  return Math.round(t * 100) / 100;
};

export const totalValue = (numArr?: number[]) => {
  return numArr?.reduce((a, b) => a + b, 0) ?? 0;
};

export const formatDate = (date: Date) => {
  return (
    date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + date.getDate() + ""
  );
};

export const totalBillAmt = (bills: Bills) => {
  return (
    1000 * (isNaN(parseInt(bills.b1000)) ? 0 : parseInt(bills.b1000)) +
    500 * (isNaN(parseInt(bills.b500)) ? 0 : parseInt(bills.b500)) +
    200 * (isNaN(parseInt(bills.b200)) ? 0 : parseInt(bills.b200)) +
    100 * (isNaN(parseInt(bills.b100)) ? 0 : parseInt(bills.b100)) +
    50 * (isNaN(parseInt(bills.b50)) ? 0 : parseInt(bills.b50)) +
    20 * (isNaN(parseInt(bills.b20)) ? 0 : parseInt(bills.b20))
  );
};

export const totalCoinAmt = (coins: Coins) => {
  return (
    20 * (isNaN(parseInt(coins.c20)) ? 0 : parseInt(coins.c20)) +
    10 * (isNaN(parseInt(coins.c10)) ? 0 : parseInt(coins.c10)) +
    5 * (isNaN(parseInt(coins.c5)) ? 0 : parseInt(coins.c5)) +
    1 * (isNaN(parseInt(coins.c1)) ? 0 : parseInt(coins.c1))
  );
};

export const toMoney = (n: number) => {
  return n >= 0
    ? n
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : "(" +
        Math.abs(n)
          .toFixed(2)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        ")";
};

export const addDays = (date: Date, days: number) => {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const priceToCode = (price: number) => {
  let priceString = Math.floor(price).toString();

  priceCodes.forEach((s) => {
    priceString = priceString.replaceAll(s.number, s.code);
  });

  return priceString;
};

export const getMonthName = (month: number, long?: boolean) => {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return long ? months[month - 1] : months[month - 1].substring(0, 3);
};

export const isEqualDate = (
  datetimeString1: string,
  datetimeString2: string
) => {
  return (
    moment(new Date(datetimeString1)).format("YYYYMMDD") ===
    moment(new Date(datetimeString2)).format("YYYYMMDD")
  );
};

export const laborDueToMechanic = (laborType: string, amount: number) => {
  if (laborType === "Rebore")
    return 0.5 * (amount > 300 ? amount - 300 : 0) + 100;
  if (laborType === "Press") return 0.5 * amount;
  if (laborType === "Tire Changer") return amount - 50;
  return amount;
};

export const toProductShortName = (
  sparePartStore: SparePartStore,
  t?: Product
) => {
  if (!t) return "";

  const sparePart = sparePartStore.getItem(t.part)?.name;
  const motors = sparePartStore.getItem(t.part)?.is_motor_shown
    ? t.motors.split(", ")[0].replaceAll("_", " ")
    : "";
  const type = t.is_orig
    ? "ORIG."
    : sparePartStore.getItem(t.part)?.is_semi_shown
    ? "SEMI."
    : "";
  const allNames = [sparePart, t.description, motors, t.brand, type]
    .filter((s) => s !== "")
    .join(" ");

  return allNames.toUpperCase();
};
