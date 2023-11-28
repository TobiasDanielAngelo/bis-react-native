import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MyIcon } from "./MyIcon";
import { MySearchInput } from "./MySearchInput";

export const SearchBar = (props: {
  onPressLabor?: () => void;
  onPressBNW?: () => void;
  onPressDate?: () => void;
  query: string;
  setQuery: (t: string) => void;
  showSearchBar: boolean;
  setShowSearchBar: (t: boolean) => void;
  hasNoBNW?: boolean;
  hasNoLabor?: boolean;
  hasNoDate?: boolean;
  hasNoSearch?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  focus?: boolean;
  setFocus?: (t: boolean) => void;
  small?: boolean;
}) => {
  const {
    onPressBNW,
    onPressLabor,
    hidden,
    hasNoBNW,
    hasNoLabor,
    hasNoSearch,
    query,
    setQuery,
    showSearchBar,
    setShowSearchBar,
    disabled,
    focus,
    setFocus,
    small,
  } = props;

  const onPressSearch = useCallback(() => {
    setQuery("");
    setShowSearchBar(true);
  }, []);

  // const onPressCode = useCallback(() => {
  //   setQuery("#");
  //   setShowSearchBar(true);
  // }, []);

  const onPressCancel = useCallback(() => {
    setFocus && setFocus(false);
    setQuery("");
    setShowSearchBar(false);
  }, []);

  return (
    !hidden && (
      <View style={styles.main}>
        {!showSearchBar ? (
          <>
            {!hasNoLabor && (
              <MyIcon
                name="work"
                label="Labor"
                color="white"
                onPress={onPressLabor}
                size={small ? "small" : undefined}
                noLabel={small}
              />
            )}
            {!hasNoSearch && (
              <>
                <MyIcon
                  name="search"
                  label="Search"
                  color="white"
                  onPress={onPressSearch}
                  size={small ? "small" : undefined}
                  noLabel={small}
                />
                {/* <MyIcon
                  name="tag"
                  label="Code"
                  color="white"
                  onPress={onPressCode}
                  size={small ? "small" : undefined}
                  noLabel={small}
                /> */}
              </>
            )}
            {!hasNoBNW && (
              <MyIcon
                name="drag-indicator"
                label="B/N/W"
                color="white"
                onPress={onPressBNW}
                size={small ? "small" : undefined}
                noLabel={small}
              />
            )}
          </>
        ) : (
          <>
            <MyIcon
              name="close"
              label="Cancel"
              color="white"
              onPress={onPressCancel}
            />
            <MySearchInput
              query={query}
              setQuery={setQuery}
              disabled={disabled}
              focus={focus}
              setFocus={setFocus}
            />
          </>
        )}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    flexDirection: "row-reverse",
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: "teal",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    backgroundColor: "teal",
    alignItems: "center",
  },
});
