import moment from "moment";
import { priceCodes } from "./constants";

export const formatDate = (date: Date) => {
  return (
    date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + date.getDate() + ""
  );
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

export const randomNameGen = () => {
  let firstName = [
    "Nathaniel",
    "James",
    "Jacob",
    "Gabriel",
    "Joshua",
    "Angelo",
    "John Mark",
    "Christian",
    "Daniel",
    "Arnel",
    "Dennis",
    "Diether",
    "Enrique",
    "Ferdinand",
    "Jericho",
    "John",
    "Jun",
    "Jun Mar",
    "Mark",
    "Jose",
    "Lou",
    "Manny",
    "Marcos",
    "Paulo",
    "Piolo",
    "Ramon",
    "Richard",
    "Antonio",
    "Bernardo",
    "Carlos",
    "Cesar",
    "Diego",
    "Ernesto",
    "Fernando",
    "Juan",
    "Luis",
    "Miko",
    "Ramon",
    "Rico",
    "Abel",
    "Abraham",
    "Alex",
    "Allan",
    "Andoy",
    "Andre",
    "Anthony",
    "Aristotle",
    "Arnel",
    "Atoy",
    "Bayani",
    "Benjamin",
    "Boy",
    "Boy",
    "Bryan",
    "Buddy",
    "Carlo",
    "Christian",
    "Cris",
    "Daniel",
    "Dante",
    "Dave",
    "Eddie",
    "Francis",
    "Freddie",
    "Gabriel",
    "Gerald",
    "Gil",
    "Lance",
    "Lloyd",
    "Mario",
    "Mike",
    "Prince",
    "Ronnie",
    "Tito",
    "Tony",
  ];
  let lastName = [
    "dela Cruz",
    "Garcia",
    "Reyes",
    "Ramos",
    "Mendoza",
    "Santos",
    "Flores",
    "Gonzales",
    "Bautista",
    "Villanueva",
    "Fernandez",
    "Cruz",
    "de Guzman",
    "Lopez",
    "Perez",
    "Castillo",
    "Francisco",
    "Rivera",
    "Aquino",
    "Castro",
    "Sanchez",
    "Torres",
    "de Leon",
    "Domingo",
    "Martinez",
    "Rodriguez",
    "Santiago",
    "Soriano",
    "Delos Santos",
    "Diaz",
    "Hernandez",
    "Tolentino",
    "Valdez",
    "Ramirez",
    "Morales",
    "Mercado",
    "Tan",
    "Aguilar",
    "Navarro",
    "Manalo",
    "Gomez",
    "Dizon",
    "del Rosario",
    "Javier",
    "Corpuz",
    "Gutierrez",
    "Salvador",
    "Velasco",
    "Miranda",
    "David",
    "Salazar",
    "Ferrer",
    "Alvarez",
    "Sarmiento",
    "Pascual",
    "Lim",
    "Delos Reyes",
    "Marquez",
    "Evangelista",
    "de Jesus",
    "Espinosa",
    "Medina",
    "Acosta",
    "Valenzuela",
    "Gregorio",
    "Magno",
    "Gabriel",
    "Ventura",
    "Herrera",
    "Ponce",
    "Esteban",
    "Guzman",
    "Carlos",
    "Guillermo",
    "Alfonso",
  ];
  let address = [
    "Aliaga",
    "Bongabon",
    "Cabiao",
    "Carranglan",
    "Cuyapo",
    "Gabaldon",
    "Gapan",
    "General Mamerto Natividad",
    "General Tinio",
    "Guimba",
    "Jaen",
    "Laur",
    "Licab",
    "Llanera",
    "Lupao",
    "Science City of Muñoz",
    "Nampicuan",
    "Palayan",
    "Pantabangan",
    "Peñaranda",
    "Quezon",
    "Rizal",
    "San Antonio",
    "San Isidro",
    "San Jose",
    "San Leonardo",
    "Santa Rosa",
    "Santo Domingo",
    "Talavera",
    "Talugtug",
    "Zaragoza",
    "Aduas Centro",
    "Aduas Norte",
    "Aduas Sur",
    "Bagong Sikat",
    "Bagong Buhay",
    "Bakero",
    "Bakod Bayan",
    "Balite",
    "Bangad",
    "Bantug Bulalo",
    "Bantug Norte",
    "Barlis",
    "Barrera District",
    "Bernardo District",
    "Bitas",
    "Bonifacio District",
    "Buliran",
    "Cabu",
    "Caudillo",
    "Calawagan",
    "Caalibangbangan",
    "Camp Tinio",
    "Caridad Village",
    "Cinco-Cinco",
    "City Supermarket",
    "Communal",
    "Cruz Roja",
    "Daan Sarile",
    "Dalampang",
    "Dicarma",
    "Dimasalang",
    "D.S. Garcia",
    "Fatima",
    "General Luna",
    "H. Concepcion",
    "Ibabao-Bana",
    "Imelda District",
    "Isla",
    "Kalikid Norte",
    "Kalikid Sur",
    "Kapitan Pepe Subdivision",
    "Lagare",
    "Lourdes",
    "M.S. Garcia",
    "Mabini Extension",
    "Mabini Homesite",
    "Macatbong",
    "Magsaysay District",
    "Magsaysay South",
    "Maria Theresa",
    "Matadero",
    "Mayapyap Norte",
    "Mayapyap Sur",
    "Melojavilla",
    "Nabao",
    "Obrero",
    "Padre Burgos",
    "Padre Crisostomo",
    "Pagas",
    "Palagay",
    "Pamaldan",
    "Pangatian",
    "Patalac",
    "Polilio",
    "Pula",
    "Quezon District",
    "Rizdelis",
    "Samon",
    "San Isidro",
    "San Josef Norte",
    "San Josef Sur",
    "San Juan Accfa",
    "San Roque Norte",
    "San Roque Sur",
    "Sanbermicristi",
    "Sangitan",
    "Sangitan East",
    "Santa Arcadia",
    "Santo Niño",
    "Sapang",
    "Sumacab Este",
    "Sumacab Norte",
    "Sumacab South",
    "Talipapa",
    "Valdefuente",
    "Valle Cruz",
    "Vijandre",
    "Villa Ofelia",
    "Zulueta",
    ...Array(30).fill("Cabanatuan"),
  ];
  let randFirst = Math.floor(Math.random() * firstName.length);
  let randLast = Math.floor(Math.random() * lastName.length);

  return `${firstName[randFirst]}${
    randFirst + randLast < 30 ? " " + lastName[randLast] : ""
  } (${address[randFirst + randLast - 1]})`;
};
