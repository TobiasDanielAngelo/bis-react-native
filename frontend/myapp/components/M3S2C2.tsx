import { useContext } from "react";
import { InventoryContext } from "../constants/interfaces";
import { ProductListMatches } from "./M3S2G1";
import { ProductForm } from "./M3S2P1";

export const AddProduct = () => {
  const { mode, item } = useContext(InventoryContext);
  return (
    mode === "create" && (
      <>
        <ProductForm item={item} />
        <ProductListMatches />
      </>
    )
  );
};
