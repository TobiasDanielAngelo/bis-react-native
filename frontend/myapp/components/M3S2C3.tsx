import { useContext } from "react";
import { M3S2Context } from "../constants/interfaces";
import { ProductSearch } from "./M3S2A1";
import { ProductForm } from "./M3S2P1";

export const UpdateProduct = () => {
  const { item, mode } = useContext(M3S2Context);

  return (
    mode === "update" && (
      <>
        {item.id === "-1" && <ProductSearch />}
        {item.id !== "-1" && <ProductForm item={item} />}
      </>
    )
  );
};
