import { useFindFirst, useFindMany, useActionForm, Controller } from "@gadgeting/react";
import { Banner, FooterHelp, Layout, Link, Page, Select, Spinner, Form, Button, FormLayout, SkeletonDisplayText } from "@shopify/polaris";
import { api } from "../api";
import { useEffect, useState } from "react";

const freeGiftForm = ({ products, shop }) => {
  // handles form state and submission
  const { submit, control, formState, error, setValue, watch } = useActionForm(api.shopifyShop.savePrePurchaseProduct, {
    findBy: shop.id,
    slect: {
      id: true,
      prePu
    }
  })
}

export default function () {
  return <></>
}
