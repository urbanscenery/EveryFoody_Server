module.exports = function(lat1, lon1, lat2, lon2) {

  let radlat1 = Math.PI * lat1 / 180
  let radlat2 = Math.PI * lat2 / 180
  let theta = lon1 - lon2
  let radtheta = Math.PI * theta / 180
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180 / Math.PI
  dist = dist * 60 * 1.1515;
  dist = parseInt(dist * 1609.344, 10);
  let distData = {
    distance: dist,
    unit: 'm'
  };
  if (dist >= 1000) {
    dist = dist / 1000;
    distData.distance = dist.toFixed(2);
    distData.unit = 'Km';
  }
  return distData;
}
