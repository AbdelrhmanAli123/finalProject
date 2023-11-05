# notes

## nodmailer app password

- `ulqd hqcv wljo hpry`

========================================

## geoSpatial queries

### code

```js
    const pointSchema = new Schema({
    location: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [[[Number]]],
        required:true
    }
    })
    const city = new Schema({
        address: pointSchema
    })
```

### geoJSON

- npm command : `npm install mongoose-geojson`

- schema definition :

```js
    const mongoose = require('mongoose');
const GeoJSON = require('mongoose-geojson');

const locationSchema = new mongoose.Schema({
  name: String,  // A name or description for the location
  coordinates: { type: GeoJSON.Point, coordinates: [Number] },  // Geospatial point
});

const Location = mongoose.model('Location', locationSchema);

```

- storing location data :

```js
    const newLocation = new Location({
  name: 'Central Park',
  coordinates: {
    type: 'Point',
    coordinates: [40.785091, -73.968285], // Latitude and longitude
  },
});

newLocation.save((err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Location saved:', result);
  }
});

```

- geospatial queries (including operators) :

```js
    Location.find({
  coordinates: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [40.7808, -73.9653], // Target coordinates
      },
      $maxDistance: 1000, // Maximum distance (in meters)
    },
  },
}).exec((err, locations) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Locations near the target:', locations);
  }
});

```

===========================

## how to clone a repo on the aws host

### if the directory on the host has no sub directory with the same repo name , command

- `git clone -b phaseOne cloning link (https)`

### if the directory on the host has a sub directory with the same repo name , commands

- `mkdir directory's_name`
- `cd new_directory`
- `mkdir configs` -> inside the new backend directory
- `cp old_directory's_.env_file_from_it's_path new_directories_.env_file_in_the_new_path`
- `git clone -b phaseOne cloning link (https)`

===========================

## how to get the users ip and location from it

```js
  npm install geoip-lite
```

```js
  const geoip = require('geoip-lite');

app.get('/get-location', (req, res) => {
  const ip = req.ip; // Get the client's IP address from the request

  // Use geoip-lite to get location information
  const location = geoip.lookup(ip);

  if (location) {
    const { ll, city, country } = location;
    const [latitude, longitude] = ll;

    res.json({
      city,
      country,
      latitude,
      longitude,
    });
  } else {
    res.json({ error: 'Location not found' });
  }
});
```
