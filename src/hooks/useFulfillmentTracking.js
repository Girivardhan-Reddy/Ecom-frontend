import { useCallback, useEffect, useState } from 'react';
import {
  getFulfillmentByOrderId,
  getShipmentByOrderId,
  getTrackingEvents,
  isFulfillmentNotFound,
  isFulfillmentServiceUnavailable,
  normalizeFulfillment,
  normalizeShipment,
  normalizeTrackingEvent,
} from '../services/fulfillmentApi';

const requestMessage = (error, subject) => {
  if (isFulfillmentNotFound(error)) return '';
  if (isFulfillmentServiceUnavailable(error)) return `Unable to load ${subject}. Please try again.`;
  return error?.message || `Unable to load ${subject}. Please try again.`;
};

export const useFulfillmentTracking = (orderId) => {
  const [fulfillment, setFulfillment] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [loading, setLoading] = useState({ fulfillment: false, shipment: false, tracking: false });
  const [errors, setErrors] = useState({ fulfillment: '', shipment: '', tracking: '' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!orderId) {
      return undefined;
    }

    let ignore = false;
    Promise.resolve().then(() => {
      if (ignore) return;
      setFulfillment(null);
      setShipment(null);
      setTrackingEvents([]);
      setErrors({ fulfillment: '', shipment: '', tracking: '' });
      setLoading({ fulfillment: true, shipment: true, tracking: false });
    });

    Promise.resolve()
      .then(() => getFulfillmentByOrderId(orderId))
      .then((payload) => {
        if (!ignore) setFulfillment(normalizeFulfillment(payload));
      })
      .catch((error) => {
        if (!ignore) setErrors((current) => ({ ...current, fulfillment: requestMessage(error, 'fulfillment information') }));
      })
      .finally(() => {
        if (!ignore) setLoading((current) => ({ ...current, fulfillment: false }));
      });

    Promise.resolve()
      .then(() => getShipmentByOrderId(orderId))
      .then((payload) => {
        if (!ignore) setShipment(normalizeShipment(payload));
      })
      .catch((error) => {
        if (!ignore) setErrors((current) => ({ ...current, shipment: requestMessage(error, 'shipment information') }));
      })
      .finally(() => {
        if (!ignore) setLoading((current) => ({ ...current, shipment: false }));
      });

    return () => { ignore = true; };
  }, [orderId, refreshKey]);

  useEffect(() => {
    const shipmentId = shipment?.id || shipment?.shipmentId;
    if (!shipmentId) {
      return undefined;
    }

    let ignore = false;
    Promise.resolve().then(() => {
      if (ignore) return;
      setLoading((current) => ({ ...current, tracking: true }));
      setErrors((current) => ({ ...current, tracking: '' }));
    });
    Promise.resolve()
      .then(() => getTrackingEvents(shipmentId))
      .then((payload) => {
        if (ignore) return;
        const rows = Array.isArray(payload) ? payload : payload?.events || payload?.content || [];
        setTrackingEvents(rows.map(normalizeTrackingEvent).sort((a, b) => new Date(a.eventTime || 0) - new Date(b.eventTime || 0)));
      })
      .catch((error) => {
        if (!ignore) setErrors((current) => ({ ...current, tracking: requestMessage(error, 'tracking information') }));
      })
      .finally(() => {
        if (!ignore) setLoading((current) => ({ ...current, tracking: false }));
      });

    return () => { ignore = true; };
  }, [shipment?.id, shipment?.shipmentId, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);

  return { fulfillment, shipment, trackingEvents, loading, errors, refresh };
};
