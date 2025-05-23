import {   Page,
  Text,
  Card,
  FormLayout,
  TextField,
  DatePicker,
  Button,
  Banner,
  Popover,
  Layout,
  BlockStack } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { useGlobalAction } from "@gadgetinc/react";

export default function Discounts() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [title, setTitle] = useState("Checkout rewards Discount");
  const [code, setCode] = useState("SALE10" + Math.floor(Math.random() * 1000));
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [pointsRequired, setPointsRequired] = useState("100");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [{ month: startMonth, year: startYear }, setStartMonthYear] = useState(() => ({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  }));
  const [{ month: endMonth, year: endYear }, setEndMonthYear] = useState(() => {
    const today = new Date();
    return {
      month: today.getMonth(),
      year: today.getFullYear(),
    };
  });

  const [startDatePopoverActive, setStartDatePopoverActive] = useState(false);
  const [endDatePopoverActive, setEndDatePopoverActive] = useState(false);

  const toggleStartDatePopoverActive = useCallback(
    () => setStartDatePopoverActive((active) => !active),
    [],
  );

  const toggleEndDatePopoverActive = useCallback(
    () => setEndDatePopoverActive((active) => !active),
    [],
  );

  const [{ data, fetching, error: apiError }, createAppDiscountCode] =
    useGlobalAction(api.createDiscountCode);

  const handleCreateDiscount = async () => {
    setIsLoading(true);
    setResult(null);
    setFormError(null);
    setFieldErrors({});

    try {
      await createAppDiscountCode({
        title: title,
        code: code,
        discountType: discountType,
        discountValue: discountValue,
        pointsRequired: pointsRequired,
        minimumRequirement: null,
        usageLimit: null,
        onePerCustomer: false,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
      });
    } catch (err) {
      console.error("Error creating discount:", err);
      setFormError(err.message || "No Error Message");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      if (data.success === false) {
        setFormError(data.apiError || "Failed to create discount code");
        if (data.errors) {
          setFieldErrors(data.errors);
        }
      } else {
        setResult(data);
      }
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
            <BlockStack gap="500">
              <Text variant="headingMd" as="h2">
                Create Percentage Discount
              </Text>
              <FormLayout>
                <TextField
                  label="Discount Title"
                  value={title}
                  onChange={setTitle}
                  autoComplete="off"
                  error={fieldErrors.title}
                />

                <TextField
                  label="Discount Code"
                  value={code}
                  onChange={setCode}
                  autoComplete="off"
                  helpText="The app will apply this code at checkout"
                  error={fieldErrors.code}
                />

                <TextField
                  label="Discount Percentage"
                  value={discountValue}
                  onChange={setDiscountValue}
                  type="number"
                  autoComplete="off"
                  suffix="%"
                  helpText="Percentage off the order"
                  error={fieldErrors.discountValue}
                />

                <TextField
                  label="Points Required"
                  value={pointsRequired}
                  onChange={setPointsRequired}
                  type="number"
                  autoComplete="off"
                  helpText="Number of points customer needs to redeem for this discount"
                  error={fieldErrors.pointsRequired}
                />

                <FormLayout.Group>
                  <div>
                    <Text variant="bodyMd" as="p">Start Date</Text>
                    <Popover
                      active={startDatePopoverActive}
                      activator={
                        <TextField
                          label="Start Date"
                          labelHidden
                          value={startDate ? startDate.toLocaleDateString() : ""}
                          onFocus={toggleStartDatePopoverActive}
                          autoComplete="off"
                        />
                      }
                      autofocusTarget="none"
                      onClose={toggleStartDatePopoverActive}
                    >
                      <Popover.Pane>
                        <DatePicker
                          month={startMonth}
                          year={startYear}
                          onChange={({start}) => {
                            setStartDate(start);
                            toggleStartDatePopoverActive();
                          }}
                          onMonthChange={(month, year) => setStartMonthYear({ month, year })}
                          selected={startDate ? {start: startDate, end: startDate} : null}
                        />
                      </Popover.Pane>
                    </Popover>
                  </div>

                  <div>
                    <Text variant="bodyMd" as="p">End Date (Optional)</Text>
                    <Popover
                      active={endDatePopoverActive}
                      activator={
                        <TextField
                          label="End Date"
                          labelHidden
                          value={endDate ? endDate.toLocaleDateString() : ""}
                          onFocus={toggleEndDatePopoverActive}
                          autoComplete="off"
                          placeholder="No Expiry Date"
                        />
                      }
                      autofocusTarget="none"
                      onClose={toggleEndDatePopoverActive}
                    >
                      <Popover.Pane>
                        <DatePicker
                          month={endMonth}
                          year={endYear}
                          onChange={({start}) => {
                            setEndDate(start);
                            toggleEndDatePopoverActive();
                          }}
                          onMonthChange={(month, year) => setEndMonthYear({ month, year })}
                          selected={endDate ? {start: endDate, end: endDate} : undefined}
                        />
                      </Popover.Pane>
                    </Popover>
                  </div>
                </FormLayout.Group>

                <Button
                  primary
                  onClick={handleCreateDiscount}
                  disabled={isLoading || fetching}
                >
                  Create Discount {fetching ? '(Loading...)' : ''}
                </Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        {formError && (
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2" color="critical">
                  Error
                </Text>
                <Banner status="critical">
                  <Text variant="bodyMd">{formError}</Text>
                </Banner>
              </BlockStack>
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
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Discount Created Successfully
                </Text>

                <Banner status="success">
                  <Text variant="bodyMd">
                    {result.message || "Discount code created successfully!"}
                  </Text>
                </Banner>

                <BlockStack gap="200">
                  <div style={{
                    backgroundColor: "#f9fafb",
                    padding: "16px",
                    borderRadius: "4px"
                  }}>
                    <BlockStack gap="300">
                      <Text variant="headingSm">Discount Details</Text>

                      <dl style={{ margin: 0 }}>
                        <dt style={{ fontWeight: "500", marginBottom: "4px" }}>Code:</dt>
                        <dd style={{ margin: "0 0 12px 0" }}>
                          <Text variant="bodyMd" fontWeight="bold">{result.code}</Text>
                        </dd>

                        {result.title && (
                          <>
                            <dt style={{ fontWeight: "500", marginBottom: "4px" }}>Title:</dt>
                            <dd style={{ margin: "0 0 12px 0" }}>
                              <Text variant="bodyMd">{result.title}</Text>
                            </dd>
                          </>
                        )}

                        {result.status && (
                          <>
                            <dt style={{ fontWeight: "500", marginBottom: "4px" }}>Status:</dt>
                            <dd style={{ margin: "0 0 12px 0" }}>
                              <Text variant="bodyMd">{result.status}</Text>
                            </dd>
                          </>
                        )}

                        {result.summary && (
                          <>
                            <dt style={{ fontWeight: "500", marginBottom: "4px" }}>Summary:</dt>
                            <dd style={{ margin: "0 0 12px 0" }}>
                              <Text variant="bodyMd">{result.summary}</Text>
                            </dd>
                          </>
                        )}

                        {result.discountId && (
                          <>
                            <dt style={{ fontWeight: "500", marginBottom: "4px" }}>ID:</dt>
                            <dd style={{ margin: "0" }}>
                              <Text variant="bodyMd" fontWeight="medium">
                                {result.discountId}
                              </Text>
                            </dd>
                          </>
                        )}
                      </dl>
                    </BlockStack>
                  </div>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
