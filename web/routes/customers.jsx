import { AutoTable } from "@gadgetinc/react/auto/polaris";
import { useNavigate } from "@remix-run/react";
import { Banner, Box, Card, Layout, Page, Text, TextField, Button, ButtonGroup, Spinner } from "@shopify/polaris";
import { useState } from "react";
import { useGlobalAction } from "@gadgetinc/react";
import { api } from "../api";

// Editable Points Cell Component
const EditablePointsCell = ({ record, onUpdate, updateCustomerPointsAction, localPoints, isUpdating }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [points, setPoints] = useState(record.points || 0);
  const [isLoading, setIsLoading] = useState(false);

  // Use local points if available, otherwise use record points
  const displayPoints = localPoints !== undefined ? localPoints : (record.points || 0);

  const handleSave = async () => {
    const newPoints = parseInt(points);
    if (newPoints === displayPoints) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      // Call the onUpdate callback first to update local state immediately
      onUpdate(record.id, newPoints);
      setIsEditing(false);

      await updateCustomerPointsAction({
        customerId: record.id,
        points: newPoints
      });
    } catch (error) {
      console.error("Error updating points:", error);
      // Reset to original value on error
      setPoints(displayPoints);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPoints(displayPoints);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TextField
          value={points.toString()}
          onChange={setPoints}
          type="number"
          min={0}
          autoComplete="off"
          disabled={isLoading}
          style={{ width: '80px' }}
        />
        <ButtonGroup>
          <Button
            size="micro"
            onClick={handleSave}
            loading={isLoading}
            primary
          >
            Save
          </Button>
          <Button
            size="micro"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </ButtonGroup>
      </div>
    );
  }

  return (
    <div
      style={{ 
        cursor: 'pointer', 
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        opacity: isUpdating ? 0.7 : 1,
        fontStyle: isUpdating ? 'italic' : 'normal'
      }}
      onClick={() => setIsEditing(true)}
      title="Click to edit points"
    >
      {displayPoints}
      {isUpdating && <Spinner size="small" />}
    </div>
  );
};

export default function Customers() {
  const navigate = useNavigate();
  const [tableKey, setTableKey] = useState(0);
  const [notificationBanner, setNotificationBanner] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localPointsUpdates, setLocalPointsUpdates] = useState({});
  const [updatingCustomers, setUpdatingCustomers] = useState(new Set());

  // Use the useGlobalAction hook for the updateCustomerPoints action
  const [{ data, fetching, error }, updateCustomerPointsAction] = useGlobalAction(api.updateCustomerPoints);

  const handlePointsUpdate = (customerId, newPoints) => {
    // Show notification banner
    setNotificationBanner(`Updated points to ${newPoints}. Refreshing table...`);
    setIsRefreshing(true);

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotificationBanner(null);
    }, 5000);

    // Force table refresh by changing the key after a delay
    // This gives the webhook time to update the database
    setTimeout(() => {
      setTableKey(prev => prev + 1);
      setIsRefreshing(false);
      setNotificationBanner(`Points updated to ${newPoints}`);

      // Hide the success message after 2 seconds
      setTimeout(() => {
        setNotificationBanner(null);
      }, 2000);
    }, 2000); // 2 second delay to allow webhook to complete
  };

  return (
    <Page
      title="Checkout Rewards Customers"
      backAction={{
        content: "Back",
        onAction: () => navigate("/"),
      }}
    >
      {notificationBanner && (
        <Layout.Section>
          <Banner status="success" onDismiss={() => setNotificationBanner(null)}>
            {notificationBanner}
          </Banner>
        </Layout.Section>
      )}

      <Layout>
        <Layout.Section>
          <Card background="bg-surface-secondary" padding="0">
            <AutoTable
              key={tableKey}
              model={api.shopifyCustomer}
              onClick={(row) => console.log("Row clicked:", row)}
              columns={[
                {
                  header: "Customer name",
                  render: ({ record }) => {
                    return (
                      <div>
                        {record?.firstName?.[0]?.toUpperCase() +
                          ". " +
                          record?.lastName}
                      </div>
                    );
                  },
                },
                "email",
                {
                  header: "Points",
                  render: ({ record }) => (
                    <EditablePointsCell
                      record={record}
                      onUpdate={handlePointsUpdate}
                      updateCustomerPointsAction={updateCustomerPointsAction}
                      localPoints={localPointsUpdates[record.id]}
                      isUpdating={updatingCustomers.has(record.id)}
                    />
                  ),
                },
              ]}
              sortBy="updatedAt"
              sortDirection="desc"
              live={true}
              refetchOnWindowFocus={true}
            />
          </Card>
        </Layout.Section>

        {error && (
          <Layout.Section>
            <Banner status="critical">
              Error updating customer points: {error.message}
            </Banner>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
