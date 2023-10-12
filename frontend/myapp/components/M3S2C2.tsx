import { useContext } from "react";
import { ProductListMatches } from "./M3S2G1";
import { ProductForm } from "./M3S2P1";
import { M3S2Context } from "../constants/interfaces";

export const AddProduct = () => {
  const { mode } = useContext(M3S2Context);
  return (
    mode === "create" && (
      <>
        <ProductForm />
        <ProductListMatches />
      </>
    )
  );
};
