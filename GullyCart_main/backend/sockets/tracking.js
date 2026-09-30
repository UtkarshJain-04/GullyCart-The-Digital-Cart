require('dotenv').config();

const jwt = require('jsonwebtoken');
const { userRepository, vendorRepository } = require('../repositories');

const MAX_RADIUS_METERS = 10000;
const watchers = new Map();

function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token || !process.env.JWT_SECRET) {
    return next(new Error('Authentication required.'));
  }

  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (_error) {
    return next(new Error('Invalid or expired token.'));
  }
}

function validateCoordinates(longitude, latitude) {
  return Number.isFinite(Number(longitude)) &&
    Number.isFinite(Number(latitude)) &&
    Number(longitude) >= -180 && Number(longitude) <= 180 &&
    Number(latitude) >= -90 && Number(latitude) <= 90;
}

function distanceInMeters(first, second) {
  const earthRadius = 6371000;
  const latitudeDelta = (second.latitude - first.latitude) * Math.PI / 180;
  const longitudeDelta = (second.longitude - first.longitude) * Math.PI / 180;
  const latitudeOne = first.latitude * Math.PI / 180;
  const latitudeTwo = second.latitude * Math.PI / 180;
  const value = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function approximateLocation(longitude, latitude) {
  return {
    longitude: Number(Number(longitude).toFixed(3)),
    latitude: Number(Number(latitude).toFixed(3)),
  };
}

async function broadcastVendorLocation(io, vendor, longitude, latitude) {
  const location = approximateLocation(longitude, latitude);
  const payload = {
    vendorId: vendor._id.toString(),
    businessName: vendor.businessName,
    location,
    updatedAt: vendor.lastLocationUpdate,
  };

  for (const [socketId, watcher] of watchers) {
    if (distanceInMeters(watcher, location) <= watcher.radius) {
      io.to(socketId).emit('vendor:location-updated', payload);
    }
  }
}

function registerTrackingSockets(io) {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    socket.on('customer:watch-nearby', ({ longitude, latitude, radius = 2000 } = {}, acknowledge) => {
      if (socket.user.role !== 'user' || !validateCoordinates(longitude, latitude)) {
        return acknowledge?.({ ok: false, message: 'Valid customer coordinates are required.' });
      }

      watchers.set(socket.id, {
        longitude: Number(longitude),
        latitude: Number(latitude),
        radius: Math.min(Math.max(Number(radius) || 2000, 100), MAX_RADIUS_METERS),
      });
      return acknowledge?.({ ok: true });
    });

    socket.on('vendor:location-update', async ({ longitude, latitude } = {}, acknowledge) => {
      try {
        if (socket.user.role !== 'vendor' || !validateCoordinates(longitude, latitude)) {
          return acknowledge?.({ ok: false, message: 'Valid vendor coordinates are required.' });
        }

        const vendor = await vendorRepository.findByUserId(socket.user.id);
        if (!vendor || vendor.verificationStatus !== 'approved' || !vendor.isActive) {
          return acknowledge?.({ ok: false, message: 'Vendor selling session is not active.' });
        }

        const updatedVendor = await vendorRepository.updateLocation(
          vendor._id,
          Number(longitude),
          Number(latitude)
        );
        await broadcastVendorLocation(io, updatedVendor, longitude, latitude);
        return acknowledge?.({ ok: true });
      } catch (_error) {
        return acknowledge?.({ ok: false, message: 'Unable to update vendor location.' });
      }
    });

    socket.on('update_vendor_location', async ({ coordinates } = {}, acknowledge) => {
      try {
        if (!coordinates || coordinates.length !== 2) {
          return acknowledge?.({ ok: false, message: 'Invalid payload.' });
        }
        
        if (socket.user.role !== 'vendor') {
          return acknowledge?.({ ok: false, message: 'Only vendors can update location.' });
        }

        const vendor = await vendorRepository.findByUserId(socket.user.id);
        if (!vendor) {
           return acknowledge?.({ ok: false, message: 'Vendor not found.' });
        }
        const vendorId = vendor._id.toString();
        
        const [longitude, latitude] = coordinates;
        if (!validateCoordinates(longitude, latitude)) {
          return acknowledge?.({ ok: false, message: 'Valid vendor coordinates are required.' });
        }

        const updatedVendor = await vendorRepository.updateLocation(
          vendorId,
          Number(longitude),
          Number(latitude)
        );
        
        if (updatedVendor) {
          const locationData = approximateLocation(longitude, latitude);
          const payload = {
            vendorId: updatedVendor._id.toString(),
            businessName: updatedVendor.businessName,
            location: locationData,
            updatedAt: updatedVendor.lastLocationUpdate,
          };
          io.emit(`vendor_location_${vendorId}`, payload);
        }
        
        return acknowledge?.({ ok: true });
      } catch (error) {
        return acknowledge?.({ ok: false, message: 'Unable to update vendor location.' });
      }
    });

    socket.on('disconnect', () => watchers.delete(socket.id));
  });
}

module.exports = { registerTrackingSockets, distanceInMeters, approximateLocation };