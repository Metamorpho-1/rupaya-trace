import EXIF from 'exif-js';

export const extractLocation = (file) => {
  return new Promise((resolve) => {
    EXIF.getData(file, function () {
      const lat = EXIF.getTag(this, "GPSLatitude");
      const lng = EXIF.getTag(this, "GPSLongitude");
      const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
      const lngRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";

      if (!lat || !lng) {
        resolve(null);
        return;
      }

      // Convert EXIF coordinate format to decimal degrees
      const convertToDegree = (coords) => {
        return coords[0] + coords[1] / 60 + coords[2] / 3600;
      };

      let latitude = convertToDegree(lat);
      let longitude = convertToDegree(lng);

      if (latRef === "S") latitude = -latitude;
      if (lngRef === "W") longitude = -longitude;

      resolve({ lat: latitude, lng: longitude });
    });
  });
};