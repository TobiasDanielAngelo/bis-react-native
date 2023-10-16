import { useContext } from "react";
import { InventoryContext, M3S2Context } from "../constants/interfaces";
import { ProductSearch } from "./M3S2A1";
import { ProductForm } from "./M3S2P1";

export const UpdateProduct = () => {
  const { mode, item } = useContext(InventoryContext);

  return (
    mode === "update" && (
      <>
        {item.id === "-1" && <ProductSearch />}
        {item.id !== "-1" && <ProductForm item={item} />}
      </>
    )
  );
};
