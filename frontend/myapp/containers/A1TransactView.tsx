import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyOverlay } from "../blueprints/MyOverlay";
import { MyTextInput } from "../blueprints/MyTextInput";
import { SearchBar } from "../blueprints/SearchBar";
import { SearchResultList } from "../blueprints/SearchResultList";
import { SelectionBar } from "../blueprints/SelectionBar";
import { toNumString, toNumber } from "../constants/helpers";
import { SalesAndLaborList } from "../components/SalesAndLaborList";
import { SalesCreatePopup } from "../components/SalesCreatePopup";
import { SalesStatusBar } from "../components/SalesStatusBar";
import { labors } from "../constants/constants";
import { laborDueToMechanic } from "../constants/helpers";
import { useStore } from "../stores/Store";
import { Product } from "../stores/ProductStore";

export const A1TransactView = observer((props: { isVisible?: boolean }) => {
  const { isVisible } = props;
  const { saleStore, mechanicStore, sparePartStore, productStore, userStore } =
    useStore();
  const [selectedItem, setSelectedItem] = useState(-1);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [isVisible3, setVisible3] = useState(false);
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [laborCost, setLaborCost] = useState("");
  const [labor, setLabor] = useState(-1);
  const [mechanic, setMechanic] = useState(-1);
  const [matches, setMatches] = useState<number[]>([]);

  const getSales = useCallback(async () => {
    saleStore.deleteAll();
    const resp = await saleStore.fetchAll({ isActive: true });
    if (!resp.data) return;
    if (resp.data.length === 0) {
      setSelectedItem(-1);
      return;
    }
    setSelectedItem(resp.data[0].id);
  }, []);

  const sales = saleStore.sales
    .map((s) => ({
      id: s.id,
      payment: s.payment,
      status: s.status,
      to_print: s.to_print,
      name: s.customer_name,
      color: s.status === "2" ? "pink" : s.status === "3" ? "gold" : undefined,
      customer_name: s.customer_name,
      datetime_opened: s.datetime_opened,
      datetime_closed: s.datetime_closed,
      is_active: s.is_active,
      discount: s.discount,
      user_adder: s.user_adder,
      user_validator: s.user_validator,
      user_closer: s.user_closer,
      sales_item: s.sales_item,
      labor_item: s.labor_item,
      returned_item: s.returned_item,
    }))
    .filter((s) => s.is_active);

  const sale = sales.find((s) => s.id === selectedItem);

  let status = "";

  switch (sale?.status) {
    case "1":
      status = "Not Paid";
      break;
    case "2":
      status = "Processing";
      break;
    case "3":
      status = "Paid";
      break;
    default:
      status = "";
      break;
  }

  const total =
    (sale?.sales_item
      ?.map((s) => s.selling_price * s.quantity)
      .reduce((a, b) => a + b, 0) ?? 0) +
    (sale?.labor_item
      ?.map((s) => s.amount_received)
      .reduce((a, b) => a + b, 0) ?? 0);

  const onPressCheck = () => {
    if (!sale?.id) return;
    saleStore.updateItem(sale?.id, {
      customer_name: `${name} (${address})`,
    });
  };

  const onPressCheck3 = () => {
    if (!sale?.id) return;
    let laborName = labors.find((s, ind) => ind === labor);
    if (!laborName || mechanic === -1 || toNumber(laborCost) === 0) return;

    saleStore.addItemParticularLabor({
      labor_name: laborName,
      amount_received: parseFloat(laborCost),
      amount_owed: laborDueToMechanic(laborName, parseFloat(laborCost)),
      amount_returned: 0,
      sales: sale.id,
      mechanic: mechanic,
    });
  };

  const toProductShortName = (t: Product) => {
    return `${sparePartStore.sparePartName(t.part)}${
      t.description !== "" ? " " + t.description : ""
    }${
      t.motors !== "" &&
      sparePartStore.spareParts.find((s) => s.id === t.part)?.is_motor_shown
        ? " " + t.motors.split(", ")[0].replaceAll("_", " ")
        : ""
    }${t.brand !== "" ? " " + t.brand : ""}${
      t.is_orig
        ? " ORIG."
        : sparePartStore.spareParts.find((s) => s.id === t.part)?.is_semi_shown
        ? " SEMI."
        : ""
    }`.toUpperCase();
  };

  const onChangeLaborCost = (qty: string) => {
    let quantity = toNumString(qty);
    setLaborCost(quantity);
  };

  const onPressResult = (t: Product) => {
    if (!sale?.id) return;
    saleStore.addItemParticularSale({
      description: toProductShortName(t),
      unit: t.unit,
      selling_price: Math.round(t.sell_price / t.piece_count),
      product: t.id,
      sales: sale.id,
      quantity: t.piece_count,
      user_adder: userStore.currentUser.user_id,
    });
    setFocus(false);
    setQuery("");
    setShowSearchBar(false);
  };

  const productMatches = productStore.products.filter((s) =>
    matches.includes(s.id)
  );

  const getMatches = async () => {
    const resp = await productStore.fetchMatches(query);
    let missingProdIds = [];
    if (resp.data) {
      missingProdIds.push(
        ...resp.data.ids.filter(
          (t) => !productStore.products.map((s) => s.id).includes(t)
        )
      );
    }
    for (let i = 0; i < missingProdIds.length; i++) {
      await productStore.fetchProduct(missingProdIds[i]);
    }
  };

  useEffect(() => {
    if (query !== "" && query.length > 4) {
      const getData = setTimeout(() => {
        getMatches();
      }, 100);

      return () => clearTimeout(getData);
    } else {
      setMatches([]);
    }
  }, [query]);

  useEffect(() => {
    getSales();
  }, [refresh]);

  useEffect(() => {
    if (isVisible2 && sale) {
      setName(sale.customer_name.split("(")[0] ?? "");
      setAddress(sale.customer_name.split("(")[1]?.replace(")", "") ?? "");
    } else {
      setName("");
      setAddress("");
    }
  }, [isVisible2]);

  useEffect(() => {
    setFocus(false);
    setShowSearchBar(false);
    setQuery("");
  }, [sale?.id]);

  return (
    isVisible && (
      <View style={styles.main}>
        <SalesCreatePopup
          isVisible={isVisible1}
          setVisible={setVisible1}
          setSelectedItem={setSelectedItem}
        />
        <MyOverlay
          title="Edit Customer Name"
          onPressCheck={onPressCheck}
          isVisible={isVisible2}
          setVisible={setVisible2}
        >
          <MyTextInput
            label="Name of Customer"
            value={name}
            onChangeValue={setName}
          />
          <MyTextInput
            label="Address of Customer"
            value={address}
            onChangeValue={setAddress}
          />
        </MyOverlay>
        <MyOverlay
          title="Add Labor"
          isVisible={isVisible3}
          setVisible={setVisible3}
          onPressCheck={onPressCheck3}
        >
          <MyDropdownPicker
            items={labors.map((s, ind) => ({
              value: ind,
              label: s,
            }))}
            label="Labor"
            value={labor}
            setValue={setLabor}
          />
          <MyDropdownPicker
            items={mechanicStore.mechanics.map((s) => ({
              value: s.id,
              label: s.name,
            }))}
            label="Mechanic"
            value={mechanic}
            setValue={setMechanic}
          />
          <MyTextInput
            value={laborCost}
            onChangeValue={onChangeLaborCost}
            label="Labor Cost"
            numeric
            centered
          />
        </MyOverlay>
        <SelectionBar
          selectedItem={selectedItem}
          items={sales}
          onPressItem={setSelectedItem}
          onPressAdd={() => setVisible1(true)}
          onPressRefresh={() => setRefresh((t) => t + 1)}
        />
        <SearchBar
          query={query}
          setQuery={setQuery}
          showSearchBar={showSearchBar}
          setShowSearchBar={setShowSearchBar}
          focus={focus}
          setFocus={setFocus}
          hasNoBNW
          hasNoSearch={selectedItem === -1}
          hasNoLabor={selectedItem === -1}
          hidden={sale?.status !== "1"}
          onPressLabor={() => setVisible3(true)}
        />
        <SearchResultList
          onPressItem={onPressResult}
          results={productMatches}
          hidden={!showSearchBar || !focus}
          inputFocus={focus}
          setInputFocus={setFocus}
        />
        <View style={styles.body}>
          <SalesAndLaborList
            sale={sale}
            saleItems={sale?.sales_item}
            laborItems={sale?.labor_item}
            hidden={focus || selectedItem === -1}
          />
        </View>
        <SalesStatusBar
          sale={sale}
          leftText={`#${sale?.id} - ${sale?.name.substring(0, 20)}... \u270e`}
          rightText={status}
          amount={total}
          hidden={selectedItem === -1}
          leftAction={() => setVisible2(true)}
          setSelectedItem={setSelectedItem}
        />
      </View>
    )
  );
});

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  body: {
    flex: 1,
    margin: 3,
  },
});
