import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { HView } from "../blueprints/HView";
import { MyCheckBox } from "../blueprints/MyCheckBox";
import { MyDropdownPicker } from "../blueprints/MyDropdownPicker";
import { MyDropdownPickers } from "../blueprints/MyDropdownPickers";
import { MyForm } from "../blueprints/MyForm";
import { MyText } from "../blueprints/MyText";
import { MyTextInput } from "../blueprints/MyTextInput";
import { useStore } from "../stores/Store";
import { roundToCash, toNumString, toNumber } from "../constants/helpers";
import { MyIcon } from "../blueprints/MyIcon";
import { MyOverlay } from "../blueprints/MyOverlay";

const defaultProduct = {
  part: -1,
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
  id: -1,
};

type ProductInput = typeof defaultProduct;

export const ProductForm = observer(
  (props: {
    hidden?: boolean;
    btn1Label?: string;
    btn2Label?: string;
    onPressBtn2?: () => void;
    setDetails: React.Dispatch<React.SetStateAction<ProductInput>>;
    details: ProductInput;
    mode: number;
    motors: number[];
    setMotors: React.Dispatch<React.SetStateAction<number[]>>;
  }) => {
    const {
      hidden,
      btn1Label,
      btn2Label,
      onPressBtn2,
      mode,
      details,
      setDetails,
      motors,
      setMotors,
    } = props;

    const { sparePartStore, motorStore, productStore } = useStore();
    const [status, setStatus] = useState({
      message: "",
      status: "",
    });
    const [motor, setMotor] = useState("");
    const [isVisible1, setVisible1] = useState(false);

    const onChangePart = (t: number) => {
      setDetails({ ...details, part: t });
    };

    const onChangeInfo = (t: string) => {
      setDetails({ ...details, miscInfo: t });
    };

    const onChangeBrand = (t: string) => {
      setDetails({ ...details, brand: t });
    };

    const onChangeLocation = (t: string) => {
      setDetails({ ...details, location: t });
    };

    const onChangeOrig = (t: boolean | ((u: boolean) => boolean)) => {
      if (typeof t === "function")
        setDetails({ ...details, isOrig: t(details.isOrig) });
      else setDetails({ ...details, isOrig: t });
    };

    const onChangeUnit = (t: string) => {
      setDetails({
        ...details,
        unit: t,
        pieces: "",
        unitPP: "",
        unitSP: "",
        packPP: "",
        packSP: "",
      });
    };

    const onChangePieces = (t: string) => {
      setDetails({
        ...details,
        pieces: toNumString(t),
        unitPP: "",
        unitSP: "",
        packPP: "",
        packSP: "",
      });
    };

    const onChangeMinimum = (t: string) => {
      setDetails({
        ...details,
        minimum: toNumString(t),
      });
    };

    const onChangeUnitPP = (t: string) => {
      setDetails({
        ...details,
        unitPP: toNumString(t, true),
        packPP: roundToCash(
          toNumber(toNumString(t, true)) * toNumber(details.pieces)
        ).toString(),
      });
    };

    const onChangePackPP = (t: string) => {
      setDetails({
        ...details,
        packPP: toNumString(t, true),
        unitPP: toNumber(details.pieces)
          ? roundToCash(
              toNumber(toNumString(t, true)) / toNumber(details.pieces)
            ).toString()
          : "",
      });
    };

    const onChangeUnitSP = (t: string) => {
      setDetails({
        ...details,
        unitSP: toNumString(t, true),
        packSP: roundToCash(
          toNumber(toNumString(t, true)) * toNumber(details.pieces)
        ).toString(),
      });
    };

    const onChangePackSP = (t: string) => {
      setDetails({
        ...details,
        packSP: toNumString(t, true),
        unitSP: toNumber(details.pieces)
          ? roundToCash(
              toNumber(toNumString(t, true)) / toNumber(details.pieces)
            ).toString()
          : "",
      });
    };

    const resultantProduct =
      details.part === -1
        ? ""
        : `Details: ${sparePartStore.sparePartName(details.part)}${
            details.miscInfo !== "" ? " " + details.miscInfo : ""
          }${
            motors[0] &&
            sparePartStore.spareParts.find((s) => s.id === details.part)
              ?.is_motor_shown
              ? " " + motorStore.motorName(motors[0])?.replaceAll("_", " ")
              : ""
          }${details.brand !== "" ? " " + details.brand : ""}${
            details.isOrig
              ? " ORIG."
              : sparePartStore.spareParts.find((s) => s.id === details.part)
                  ?.is_semi_shown
              ? " SEMI."
              : ""
          }`.toUpperCase();

    const onPressCreate = async () => {
      let productDetails = {
        piece_count: parseInt(details.pieces),
        unit: details.unit.toUpperCase(),
        description: details.miscInfo.toUpperCase(),
        brand: details.brand.toUpperCase(),
        part: details.part,
        motors: motors.map((s) => motorStore.motorName(s)).join(", "),
        datetime_added: new Date().toISOString(),
        is_active: true,
        location: details.location.toUpperCase(),
        purchase_price: parseFloat(details.packPP),
        sell_price: parseFloat(details.packSP),
        min_quantity: parseInt(details.minimum),
        is_orig: details.isOrig,
        print_count: 0,
        datetime_updated: new Date().toISOString(),
      };

      const resp = await productStore.addProduct(productDetails);
      if (!resp.ok) {
        setStatus({
          ...status,
          message: "Error adding this product",
          status: "error",
        });
      } else {
        setStatus({
          ...status,
          message: `Added Product # ${resp.data?.id}`,
          status: "success",
        });
        setDetails(defaultProduct);
        setMotors([]);
      }
    };

    const onPressUpdate = async () => {
      let productDetails = {
        piece_count: parseInt(details.pieces),
        unit: details.unit.toUpperCase(),
        description: details.miscInfo.toUpperCase(),
        brand: details.brand.toUpperCase(),
        part: details.part,
        motors: motors.map((s) => motorStore.motorName(s)).join(", "),
        location: details.location.toUpperCase(),
        purchase_price: parseFloat(details.packPP),
        sell_price: parseFloat(details.packSP),
        min_quantity: parseInt(details.minimum),
        is_orig: details.isOrig,
      };

      const resp = await productStore.updateProduct(details.id, productDetails);
      if (!resp.ok) {
        setStatus({
          ...status,
          message: "Error updating this product",
          status: "error",
        });
      } else {
        setDetails(defaultProduct);
        setMotors([]);
      }
    };

    const onPressAdd = () => {
      if (motor === "") return;
      motorStore.addItem({
        name: motor.toUpperCase(),
        maker: "NEW",
      });
    };
    const noBtn =
      details.part === -1 ||
      toNumber(details.unitPP) === 0 ||
      toNumber(details.unitSP) === 0 ||
      toNumber(details.unitPP) >= toNumber(details.unitSP) ||
      details.minimum === "" ||
      details.location === "";

    useEffect(() => {
      if (mode === 0) {
        setDetails(defaultProduct);
        setMotors([]);
      }
    }, [mode]);

    return (
      <>
        <MyOverlay
          title="Add New Motor"
          isVisible={isVisible1}
          setVisible={setVisible1}
          onPressCheck={onPressAdd}
        >
          <MyTextInput
            label="Motor name"
            value={motor}
            onChangeValue={setMotor}
          />
        </MyOverlay>
        <MyText
          text={status.message}
          size="medium"
          success={status.status === "success"}
          error={status.status === "error"}
          hidden={status.status === ""}
        />
        <MyForm
          hidden={hidden}
          btn1Label={mode === 1 ? "Create" : "Update"}
          onPressBtn1={mode === 1 ? onPressCreate : onPressUpdate}
          onPressBtn2={onPressBtn2}
          noBtn1={noBtn}
          noBtn2={noBtn}
        >
          <MyDropdownPicker
            items={sparePartStore.spareParts.map((s) => ({
              value: s.id,
              label: s.name,
            }))}
            value={details.part}
            setValue={onChangePart}
            label="Part Category"
          />
          <MyTextInput
            label="Additional Information"
            value={details.miscInfo}
            onChangeValue={onChangeInfo}
            placeholder={`e.g 'Red', 'Front', '20W-50', '1L' 'BH6x20'`}
          />
          <HView>
            <MyDropdownPickers
              items={motorStore.motors.map((s) => ({
                value: s.id,
                label: s.name.replaceAll("_", " "),
              }))}
              values={motors}
              setValues={setMotors}
              label="Suitable for Motors"
              flex
            />
            <MyIcon name="add" onPress={() => setVisible1(true)} label="New" />
          </HView>
          <HView>
            <MyTextInput
              label="Brand of Item"
              value={details.brand}
              onChangeValue={onChangeBrand}
              flex={1}
              placeholder={`e.g. Makoto/Takasago`}
            />
            <MyCheckBox
              isSelected={details.isOrig}
              setSelection={onChangeOrig}
              color="lightcyan"
              title="Orig?"
            />
          </HView>
          <HView>
            <MyTextInput
              label="Pieces per Package"
              value={details.pieces}
              onChangeValue={onChangePieces}
              flex={1}
              numeric
              centered
              placeholder={`1, 2, 3...`}
            />
            <MyTextInput
              label="Package Unit"
              value={details.unit}
              onChangeValue={onChangeUnit}
              flex={1}
              placeholder={`pc.`}
            />
          </HView>
          <HView>
            <MyTextInput
              label={`Purchasing \u20b1 per Piece`}
              value={details.unitPP}
              onChangeValue={onChangeUnitPP}
              flex={1}
              numeric
              centered
              placeholder={`1 pc = \u20b1500`}
            />
            <MyTextInput
              label={`Purchasing \u20b1 per Set`}
              value={details.packPP}
              onChangeValue={onChangePackPP}
              flex={1}
              numeric
              centered
              placeholder={
                details.pieces === ""
                  ? "4 pc = \u20b12000"
                  : `${details.pieces} pc = \u20b1${
                      500 * toNumber(details.pieces)
                    }`
              }
            />
          </HView>
          <HView>
            <MyTextInput
              label={`Selling \u20b1 per Piece`}
              value={details.unitSP}
              onChangeValue={onChangeUnitSP}
              flex={1}
              numeric
              centered
              placeholder={`1 pc = \u20b1600`}
            />
            <MyTextInput
              label={`Selling \u20b1 per Set`}
              value={details.packSP}
              onChangeValue={onChangePackSP}
              flex={1}
              numeric
              centered
              placeholder={
                details.pieces === ""
                  ? "4 pc = \u20b12000"
                  : `${details.pieces} pc = \u20b1${
                      600 * toNumber(details.pieces)
                    }`
              }
            />
          </HView>
          <HView>
            <MyTextInput
              label="Minimum Set Count"
              value={details.minimum}
              onChangeValue={onChangeMinimum}
              flex={1}
              numeric
              centered
              placeholder="1, 2, 3..."
            />
            <MyTextInput
              label="Location"
              value={details.location}
              onChangeValue={onChangeLocation}
              flex={1}
              centered
              placeholder={`"A" for Shelf A`}
              autoCapitalize
              maxLength={1}
            />
          </HView>
          <MyText text={resultantProduct} size="medium" />
        </MyForm>
      </>
    );
  }
);
