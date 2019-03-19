let express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 8081;

let app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/api/stations/:lat/:long/:range", async (req, res) => {
    console.log(`GET request received, lat: ${req.params.lat} long: ${req.params.long} range: ${req.params.range}, fetching data`);
    let results = await fetch(
        "https://feeds.citibikenyc.com/stations/stations.json"
    );
    let data = await results.json();
    console.log("Data received, processing data");
    let allStations = cleanData(data);
    let payload = getNearbyStations(allStations, req.params.lat, req.params.long, req.params.range);
    console.log("sending data");
    res.send(payload);
});

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

const cleanData = data => {
    let stationList = data.stationBeanList.map(s => ({
        id: s.id,
        name: s.stationName,
        bikes: s.availableBikes,
        totalDocks: s.totalDocks,
        status: s.statusValue,
        coords: {
            lat: s.latitude,
            long: s.longitude
        }
    }));
    return stationList;
};

const getNearbyStations = (stations, lat, long, range) => {
    // console.log(stations);
    console.log(lat, long);
    let results = stations.filter(s => calculateDistance(lat, long, s.coords.lat, s.coords.long, "M") <= range);
    return results;
}

const calculateDistance = (lat1, lon1, lat2, lon2, unit) => {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}
