import { useCallback, useEffect, useState } from "react";
import {
  M3S3Context,
  OrderItem,
  ProductQuantified,
  PurchaseOrder,
  SparePartInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { OrderBar } from "./M3S3G1";
import { PurchaseOrderList } from "./M3S3G2";
import { StatusOrderBar } from "./M3S3S1";
import { ProductSearch } from "./M3S3A1";
import { FinishOrderModal } from "./M3S3P1";

export const DeliveryView = (props: { visible: boolean }) => {
  const { motorStore, transactionStore, categoryStore, productStore } =
    useStore();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(-1);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [query, setQuery] = useState("");
  const [focus, setFocused] = useState(false);
  const [popup, setPopup] = useState("");
  const [part, setPart] = useState(-1);
  const [parts, setParts] = useState<SparePartInterface[]>([]);
  const [products, setProducts] = useState<ProductQuantified[]>([]);
  const [search, setSearch] = useState(false);

  const { sparePartStore } = useStore();

  const getSpareParts = async () => {
    await sparePartStore.fetchSpareParts();
    setParts(sparePartStore.spareParts);
    setPart(sparePartStore.spareParts[0].id);
  };

  const getMotors = async () => {
    await motorStore.fetchMotors();
  };

  const getProducts = useCallback(async () => {
    productStore.deleteProductHistory();
    setLoading(true);
    if (part !== -1) {
      const resp = (await productStore.fetchProductByPart(part)).data;
      setProducts(
        (resp ?? []).map((s) => ({
          product: s,
          quantity: 0,
        }))
      );
    } else {
      setProducts([]);
    }
    setLoading(false);
  }, [part]);

  const getPurchaseOrders = useCallback(async () => {
    if (!props.visible) return;
    transactionStore.deleteTransactionHistory();

    try {
      setLoading(true);
      await transactionStore.fetchTransactions(`purchases/?mode=processing`);
      await transactionStore.fetchTransactions(`purchases/?mode=delivered`);

      const orderTransactions = transactionStore.transactions.filter(
        (s) => s.category === categoryStore.categoryId("Purchase Parts")
      );

      const allOrders = orderTransactions.map((s) => {
        return {
          id: parseInt(s.pk),
          check: parseInt(s.description.split(", ")[3].replace("C#", "")) ?? 0,
          supplier: s.receiver,
          dueDate: new Date(s.description.split(", ")[4]).toDateString(),
          creationDate: new Date(s.datetime_transacted).toDateString(),
          status: s.description.split(", ")[1].toLowerCase() as
            | "editing"
            | "processing"
            | "delivered"
            | "closed",
          toPrint: s.description.split(", ")[2] === "Print",
        };
      });

      setOrders(allOrders);

      const particularOrderItems = orderTransactions
        .map((s) => {
          return s.particular_transaction.map((t) => {
            return { id: s.pk, part: t };
          });
        })
        .flat(1)
        .map((u) => {
          return {
            id: parseInt(u.part.id ?? "-1"),
            productId: parseInt(
              u.part.description?.split("***")[0].replace("PPU", "") ?? "-1"
            ),
            orderId: parseInt(u.id),
            qty: u.part.quantity ?? 0,
            purchasePrice: 0,
            sellPrice: 0,
            brandType: u.part.remarks?.toLowerCase() as "" | "none" | "any",
          };
        })
        .filter((s) => s.brandType === "");

      setOrderItems(particularOrderItems);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }, [props.visible]);

  const getCategories = useCallback(async () => {
    await categoryStore.fetchCategories();
  }, []);

  const onQueryChange = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const onFocusChange = useCallback((f: boolean) => {
    setFocused(f);
  }, []);

  useEffect(() => {
    if (part !== -1) getProducts();
  }, [part]);

  useEffect(() => {
    setOrder(-1);
    getCategories();
    getSpareParts();
    getPurchaseOrders();
    getMotors();
  }, [props.visible]);

  const values = {
    search: search,
    setSearch: setSearch,
    query: query,
    onQueryChange: onQueryChange,
    focus: focus,
    onFocusChange: onFocusChange,
    popup: popup,
    setPopup: setPopup,
    loading: loading,
    setLoading: setLoading,
    products: products,
    part: part,
    setPart: setPart,
    parts: parts,
    order: order,
    setOrder: setOrder,
    orders: orders,
    setOrders: setOrders,
    orderItems: orderItems,
    setOrderItems: setOrderItems,
  };

  return (
    props.visible && (
      <M3S3Context.Provider value={values}>
        <FinishOrderModal />
        <OrderBar />
        <ProductSearch />
        <PurchaseOrderList />
        <StatusOrderBar />
      </M3S3Context.Provider>
    )
  );
};
