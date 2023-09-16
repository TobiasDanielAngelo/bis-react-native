import { useCallback, useEffect, useState } from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { Icon, Overlay } from "react-native-elements";

const randomNameGen = () => {
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
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
    "Cabanatuan",
  ];
  let randFirst = Math.floor(Math.random() * firstName.length);
  let randLast = Math.floor(Math.random() * lastName.length);

  return `${firstName[randFirst]}${
    randFirst + randLast < 30 ? " " + lastName[randLast] : ""
  } (${address[randFirst + randLast - 1]})`;
};

export const NewCustomerOverlay = (props: {
  handleNameSubmit: (name: string) => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
}) => {
  const [name, setName] = useState("");

  const handleChange = useCallback((text: any) => {
    setName(text);
  }, []);

  useEffect(() => {
    setName("");
  }, [props.visible]);

  return (
    <>
      <Overlay
        isVisible={props.visible}
        onBackdropPress={() => props.setVisible(false)}
      >
        <View style={styles.msgBox}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16 }}>Add New Customer</Text>
            <Icon
              name={"close"}
              size={30}
              color={"#aaa"}
              onPress={() => props.setVisible(false)}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 20, color: "#888" }}>Name</Text>
            <TextInput
              style={{
                marginTop: -5,
                padding: 5,
                borderWidth: 1,
                width: 200,
                borderColor: "#aaa",
                fontSize: 15,
                height: 40,
              }}
              value={name}
              onChangeText={handleChange}
            />
            <Icon
              name={"shuffle"}
              size={30}
              color={"#aaa"}
              onPress={() => setName(randomNameGen())}
            />
          </View>

          <View style={{ flexDirection: "row-reverse" }}>
            <Icon
              name={"check"}
              size={40}
              color={"#aaa"}
              onPress={() => {
                props.handleNameSubmit(name);
                // setName("");
                props.setVisible(false);
              }}
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  msgBox: {
    height: 200,
    width: 300,
    justifyContent: "space-between",
  },
});
