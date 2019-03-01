let express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const bodyParser = require('body-parser')

let app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/api/test/:lat/:long", async (req, res) => {
    let results = await fetch(
        "https://feeds.citibikenyc.com/stations/stations.json"
    );
    let data = await results.json();
    let allStations = cleanData(data);
    let payload = getNearbyStations(allStations, req.params.lat, req.params.long);
    console.log(payload);
    res.send(payload);
});

app.listen(3001, () => console.log("listening on port 3001"));

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

const getNearbyStations = (stations, lat, long) => {
    // console.log(stations);
    console.log(lat, long);
    let results = stations.filter(s => calculateDistance(lat, long, s.coords.lat, s.coords.long, "M") <= 1.5);
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
