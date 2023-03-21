import React, { useMemo } from "react";
import { currentScreenType } from "../utils";


export default function ForScreen({ children, mobile, desktop }) {

  const currentScreen = useMemo(currentScreenType, []);

  if(currentScreen === "mobile" && !mobile) return null;
  if(currentScreen === "desktop" && !desktop) return null;
  return (
    <>
      {children}
    </>
  );
}
