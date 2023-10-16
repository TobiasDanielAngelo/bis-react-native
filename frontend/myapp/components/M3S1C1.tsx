import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native-elements";
import {
  M3S1Context,
  OrderItem,
  ProductQuantified,
  PurchaseOrder,
  SparePartInterface,
} from "../constants/interfaces";
import { useStore } from "../stores/Store";
import { OrderBar } from "./M3S1G1";
import { OrderProductMatches } from "./M3S1G2";
import { PurchaseOrderList } from "./M3S1G3";
import { PurchaseOrderModal } from "./M3S1P1";
import { StatusOrderBar } from "./M3S1S1";

export const OrderView = (props: { visible: boolean }) => {
  const { transactionStore, categoryStore, productStore, particularPOSStore } =
    useStore();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(-1);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [popup, setPopup] = useState("");
  const [part, setPart] = useState(-1);
  const [viewProducts, setViewProducts] = useState(true);
  const [parts, setParts] = useState<SparePartInterface[]>([]);
  const [products, setProducts] = useState<ProductQuantified[]>([]);

  const { sparePartStore } = useStore();

  const getSpareParts = async () => {
    await sparePartStore.fetchSpareParts();
    setParts(sparePartStore.spareParts);
    setPart(sparePartStore.spareParts[0].id);
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
    transactionStore.deleteTransactionHistory();
    try {
      setLoading(true);
      await transactionStore.fetchTransactions(`purchases/?mode=edit`);

      const orderTransactions = transactionStore.transactions.filter(
        (s) => s.category === categoryStore.categoryId("Purchase Parts")
      );

      const allOrders = orderTransactions.map((s) => {
        return {
          id: parseInt(s.pk),
          check: parseInt(s.description.split(", ")[3].replace("C#", "")) ?? 0,
          supplier: s.receiver,
          dueDate: new Date(s.description.split(", ")[4]).toDateString(),
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
          };
        });

      setOrderItems(particularOrderItems);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }, []);

  const getQuantities = async (itemId: number) => {
    setLoading(true);

    const resp = await particularPOSStore.fetchPOSQuantityOfProduct(itemId);

    // setItems((prev: POSItem[]) => {
    //   if ((prev.find((s) => s.id === itemId) ?? defaultPOSItem).quantity === -1)
    //     (prev.find((s) => s.id === itemId) ?? defaultPOSItem).quantity =
    //       resp.data?.quantity ?? 0;
    //   return [...prev];
    // });
    setLoading(false);
  };

  const getCategories = useCallback(async () => {
    await categoryStore.fetchCategories();
  }, []);

  useEffect(() => {
    if (part !== -1) getProducts();
  }, [part]);

  useEffect(() => {
    getCategories();
    getSpareParts();
    getPurchaseOrders();
  }, [props.visible]);

  const values = {
    viewProducts: viewProducts,
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
      <M3S1Context.Provider value={values}>
        <PurchaseOrderModal />
        {viewProducts && <OrderProductMatches />}
        <TouchableOpacity onPress={() => setViewProducts((prev) => !prev)}>
          <View
            style={{
              borderRadius: 25,
              marginHorizontal: 50,
              // marginVertical: 10,
              borderColor: "gray",
              backgroundColor: "teal",
              height: 30,
            }}
          >
            <Text style={{ color: "white", fontSize: 20, textAlign: "center" }}>
              {viewProducts ? "View Order" : "View Products"}
            </Text>
          </View>
        </TouchableOpacity>
        <OrderBar />

        {!viewProducts && (
          <>
            <PurchaseOrderList />
            <StatusOrderBar />
          </>
        )}
      </M3S1Context.Provider>
    )
  );
};
