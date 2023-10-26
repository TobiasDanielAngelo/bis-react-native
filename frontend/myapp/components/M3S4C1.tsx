import { useCallback, useContext, useEffect, useState } from "react";
import {
  defaultProductFullyQuantified,
  defaultSession,
} from "../constants/constants";
import {
  CountSession,
  M3S4Context,
  MainContext,
  ProductFullyQuantified,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { CheckBar } from "./M3S4G1";
import { ProductsPlaced } from "./M3S4G2";
import { LabelPrintModal } from "./M3S4P1";

export const CheckView = (props: { visible: boolean }) => {
  const { currentScreen } = useContext(MainContext);
  const { sparePartStore, transactionStore, categoryStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductFullyQuantified[]>([]);
  const [product, setProduct] = useState<ProductFullyQuantified>(
    defaultProductFullyQuantified
  );
  const [sessions, setSessions] = useState<CountSession[]>([]);
  const [session, setSession] = useState<CountSession>(defaultSession);
  const [location, setLocation] = useState("");

  const [popup, setPopup] = useState("");

  const getActiveCountSessions = async () => {
    const resp = await transactionStore.fetchTransactions(
      "transactions/?counting=1"
    );

    setSessions(
      resp.data?.map((s) => ({
        counter: s.encoder,
        isOngoing: s.description.split(", ")[2] === "Pending",
        location: s.description.split(", ")[1],
        id: s.pk ?? "-1",
      })) ?? []
    );

    if (resp.data && resp.data?.length > 0) {
      setSession({
        counter: resp.data[0].encoder,
        isOngoing: resp.data[0].description.split(", ")[2] === "Pending",
        location: resp.data[0].description.split(", ")[1],

        id: resp.data[0].pk ?? "-1 ",
      });
    }
  };

  const getCategories = useCallback(async () => {
    await categoryStore.fetchCategories();
  }, []);

  const getSpareParts = useCallback(async () => {
    await sparePartStore.fetchSpareParts();
  }, []);

  const values = {
    visible: props.visible,
    popup: popup,
    setPopup: setPopup,
    products: products,
    setProducts: setProducts,
    productDetails: product,
    setProductDetails: setProduct,
    loading: loading,
    setLoading: setLoading,
    sessions: sessions,
    setSessions: setSessions,
    session: session,
    setSession: setSession,
    location: location,
    setLocation: setLocation,
  };

  useEffect(() => {
    setProduct(defaultProductFullyQuantified);
  }, [location]);

  useEffect(() => {
    getCategories();
    getSpareParts();
    getActiveCountSessions();
  }, [props.visible, currentScreen]);

  return (
    props.visible && (
      <M3S4Context.Provider value={values}>
        <LabelPrintModal />
        <CheckBar />
        <ProductsPlaced />
      </M3S4Context.Provider>
    )
  );
};
