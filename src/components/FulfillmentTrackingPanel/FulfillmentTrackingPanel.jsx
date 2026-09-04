import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { customerDeliveryStatus, fulfillmentStatusLabel, fulfillmentTypeLabel, shipmentStatusLabel } from '../../utils/fulfillmentStatus';

const formatDateTime = (value) => value ? new Date(value).toLocaleString() : '';
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '';

const Detail = ({ label, value }) => (
  <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 1, p: 1.5, minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{value || 'Not available'}</Typography>
  </Box>
);

const LoadingLine = ({ children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
    <CircularProgress size={15} />
    <Typography variant="body2">{children}</Typography>
  </Box>
);

const FulfillmentTrackingPanel = ({ order, fulfillment, shipment, trackingEvents = [], loading = {}, errors = {}, refresh }) => {
  const hasFulfillment = Boolean(fulfillment?.id);
  const hasShipment = Boolean(shipment?.id);
  const deliveryStatus = customerDeliveryStatus({ fulfillment, shipment, order });
  const statusTone = ['Delivered', 'Cancelled', 'Failed', 'Returned'].includes(deliveryStatus) ? 'default' : 'success';

  return (
    <Box sx={{ bgcolor: 'white', border: '1px solid #dfe8e3', borderRadius: 2, p: 2.5, display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <LocalShippingOutlinedIcon sx={{ color: '#075F40' }} />
          <Box>
            <Typography variant="h6" fontWeight={800}>Delivery Tracking</Typography>
            <Typography variant="body2" color="text.secondary">{shipment?.trackingNumber ? `${shipment.carrier} ${shipment.trackingNumber}` : 'Shipment updates will appear here'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {refresh && <Button size="small" variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={refresh} sx={{ borderColor: '#d5e5dc', color: '#075F40', textTransform: 'none' }}>Refresh</Button>}
          <Chip label={deliveryStatus} color={statusTone} />
        </Box>
      </Box>

      {loading.fulfillment && <LoadingLine>Loading fulfillment...</LoadingLine>}
      {errors.fulfillment && <Typography role="alert" color="error">{errors.fulfillment}</Typography>}
      {!loading.fulfillment && !errors.fulfillment && !hasFulfillment && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
          <Inventory2OutlinedIcon fontSize="small" />
          <Typography>Preparing your order for fulfillment.</Typography>
        </Box>
      )}

      {hasFulfillment && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.25 }}>
          <Detail label="Fulfillment status" value={fulfillmentStatusLabel(fulfillment.status)} />
          <Detail label="Fulfillment type" value={fulfillmentTypeLabel(fulfillment.fulfillmentType, order?.deliveryMethod)} />
          <Detail label="Fulfillment reference" value={fulfillment.id} />
          <Detail label="Address reference" value={fulfillment.shippingAddressId} />
        </Box>
      )}

      {loading.shipment && <LoadingLine>Loading shipment...</LoadingLine>}
      {errors.shipment && <Typography role="alert" color="error">{errors.shipment}</Typography>}
      {!loading.shipment && !errors.shipment && !hasShipment && (
        <Typography color="text.secondary">Shipment details will appear once packing is complete.</Typography>
      )}

      {hasShipment && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.25 }}>
          <Detail label="Shipment status" value={shipmentStatusLabel(shipment.status)} />
          <Detail label="Carrier" value={shipment.carrier} />
          <Detail label="Tracking number" value={shipment.trackingNumber} />
          <Detail label="Estimated delivery" value={formatDate(shipment.estimatedDeliveryDate)} />
          <Detail label="Shipped date" value={formatDateTime(shipment.shippedAt)} />
          <Detail label="Delivered date" value={formatDateTime(shipment.deliveredAt)} />
        </Box>
      )}

      {hasShipment && (
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography fontWeight={800}>Tracking Timeline</Typography>
          {loading.tracking && <LoadingLine>Loading tracking...</LoadingLine>}
          {errors.tracking && <Typography role="alert" color="error">{errors.tracking}</Typography>}
          {!loading.tracking && !errors.tracking && trackingEvents.length === 0 && <Typography color="text.secondary">No tracking events yet.</Typography>}
          {trackingEvents.map((event) => (
            <Box key={event.id} sx={{ display: 'grid', gridTemplateColumns: '12px 1fr', gap: 1.25 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#087451', mt: .75 }} />
              <Box sx={{ pb: 1.25, borderBottom: '1px solid #eef2f0' }}>
                <Typography fontWeight={800}>{event.description || shipmentStatusLabel(event.status)}</Typography>
                <Typography variant="body2" color="text.secondary">{[event.location, formatDateTime(event.eventTime)].filter(Boolean).join(' | ')}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FulfillmentTrackingPanel;
