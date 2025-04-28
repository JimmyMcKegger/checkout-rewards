import {   Page,
  Text,
  Card,
  FormLayout,
  TextField,
  DatePicker,
  Button,
  Select,
  Banner,
  Checkbox,
  Layout,
  Frame,
  Loading,
  BlockStack } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { api } from "../api";
import { useGlobalAction } from "@gadgetinc/react";

export default function Discounts() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState(null);
  const [title, setTitle] = useState("Checkout rewards Discount");
  const [code, setCode] = useState("SALE10" + Math.floor(Math.random() * 1000));
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumPurchase, setMinimumPurchase] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);


  const [{ data, fetching, error: apiError }, createAppDiscountCode] =
    useGlobalAction(api.createDiscountCode);

  const handleCreateDiscount = async () => {
    setIsLoading(true);
    setResult(null);
    setFormError(null);

    try {
      const response = await createAppDiscountCode({
        title: title,
        code: code,
        discountType: "percentage",
        discountValue: "10",
        pointsRequired: "100",
        minimumPurchase: "0",
        usageLimit: "100",
        onePerCustomer: true,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
      });

      console.log("Discount response:", response);
      setResult(response.data);

    } catch (err) {
      console.error("Error creating discount:", err);
      setFormError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      console.log("Received data:", data);
      setResult(data);
    }
  }, [data]);

  return (
    <Page
      title="Checkout rewards Discount"
      backAction={{
        content: "Back",
        onAction: () => navigate("/"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
              <Text variant="headingMd" as="h2">
                Test Discount Creation
              </Text>
              <Text variant="bodyMd">
                Click the button below to create a test discount code with 10% off.
              </Text>
              <div style={{ marginTop: "16px" }}>
                <Button
                  primary
                  onClick={handleCreateDiscount}
                  disabled={isLoading || fetching}
                >
                  Create Test Discount {fetching ? '(Loading...)' : ''}
                </Button>
              </div>
          </Card>
        </Layout.Section>

        {formError && (
          <Layout.Section>
            <Card>
                <Text variant="headingMd" as="h2" color="critical">
                  Error
                </Text>
                <Text variant="bodyMd">{formError}</Text>
            </Card>
          </Layout.Section>
        )}

        {apiError && (
          <Layout.Section>
            <Card>
                <Text variant="headingMd" as="h2" color="critical">
                  API Error
                </Text>
                <Text variant="bodyMd">{apiError.toString()}</Text>
            </Card>
          </Layout.Section>
        )}

        {result && (
          <Layout.Section>
            <Card>
                <Text variant="headingMd" as="h2">
                  Response
                </Text>
                {result.success ? (
                  <Text variant="bodyMd" color="success">
                    {result.message || "Discount code created successfully!"}
                  </Text>
                ) : (
                  <Text variant="bodyMd" color="critical">
                    {(result.apiError) || "Unknown error"}
                  </Text>
                )}

                <Text variant="headingMd" as="h3">
                  Response Details
                </Text>
                <div style={{
                  backgroundColor: "#f4f6f8",
                  padding: "12px",
                  borderRadius: "4px",
                  overflowX: "auto"
                }}>
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
