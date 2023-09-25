export const formatDate = (date: Date) => {
  return (
    date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + date.getDate() + ""
  );
};

export const formatDate2 = (date: Date) => {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

export const formatTime = (date: Date) => {
  return `${date.getHours()}:${date.getMinutes()}`;
};

export const laborDueToMechanic = (laborType: string, amount: number) => {
  if (laborType === "Rebore")
    return 0.5 * (amount > 300 ? amount - 300 : 0) + 100;
  if (laborType === "Press") return 0.5 * amount;
  if (laborType === "Tire Changer") return amount - 50;
  return amount;
};
