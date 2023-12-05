# notes

## nodmailer app password

- `ulqd hqcv wljo hpry`

## figma UIs link (mahmoud sobhy)

- <https://www.figma.com/file/nHx2JHTZHGIioOccX7oCC2/Graduation-project?type=design&node-id=0%3A1&mode=design&t=zoIaIQAaGZjfgpCo-1>

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

========================================

## multer error handling

```js
  app.post('/profile', function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
    } else if (err) {
      // An unknown error occurred when uploading.
    }

    // Everything went fine.
  })
})
```

========================================

## unused codes

```js
// let uploadPath
// if (req.file) {
//     const customId = nanoid()
//     uploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
//     const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
//         folder: uploadPath
//     })
//     if (!secure_url || !public_id) {
//         return next(new Error("couldn't save the image!", { cause: 400 }))
//     }
//     getUser.profilePicture = { secure_url, public_id }
//     getUser.customId = customId
// }

// req.imagePath = uploadPath

// let uploadPath
// if (req.file) {
//     const customId = nanoid()
//     uploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
//     const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
//         folder: uploadPath
//     })
//     if (!secure_url || !public_id) {
//         return next(new Error("couldn't save the image!", { cause: 400 }))
//     }
//     getUser.profilePicture = { secure_url, public_id }
//     getUser.customId = customId
// }

// if (req.file) {
//     const customId = nanoid()
//     uploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
//     const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
//         folder: uploadPath
//     })
//     if (!secure_url || !public_id) {
//         return next(new Error("couldn't save the image!", { cause: 400 }))
//     }
//     image = { secure_url, public_id }
//     userData.profilePicture = image
//     userData.customId = customId
// }

// file: joi.object({
//     fieldname: joi.string(),
//     originalname: joi.string(),
//     encoding: joi.string(),
//     mimetype: joi.string(),
//     destination: joi.string(),
//     filename: joi.string(),
//     path: joi.string(),
//     size: joi.number()
// }).unknown(true).presence('optional')

// for (const file in req.files) {
//     console.log(file)
//     console.log({ typeOfFile: typeof (file) })
//     console.log({ fileFieldName: file.fieldname })
//     if (file['profilePicture'] === 'profilePicture') {
//         const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
//             folder: profileUploadPath
//         })
//         if (!secure_url || !public_id) {
//             return next(new Error("couldn't save the profile picture!", { cause: 400 }))
//         }
//         profilePic = { secure_url, public_id }
//         userData.profilePicture = profilePic
//     }
//     else if (file['coverPicture'] === 'coverPicture') {
//         const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
//             folder: coverUploadPath
//         })
//         if (!secure_url || !public_id) {
//             return next(new Error("couldn't save the image!", { cause: 400 }))
//         }
//         coverPic = { secure_url, public_id }
//         userData.coverPicture = coverPic
//     }
//     else {
//         return next(new Error('invalid file fieldName!', { cause: 400 }))
//     }
// }

  // files: joi.array().items(joi.object({
  //     fieldname: joi.string(),
  //     originalname: joi.string(),
  //     encoding: joi.string(),
  //     mimetype: joi.string(),
  //     destination: joi.string(),
  //     filename: joi.string(),
  //     path: joi.string(),
  //     size: joi.number()
  // }).unknown(true).presence('optional')).options({ presence: 'optional' })

  // no email message , no extra token

    // const passToken = generateToken({ payload: { email: getUser.email }, signature: process.env.change_password_secret_key, expiresIn: '1h' })

    // const changePassLink = `${req.protocol}://${req.headers.host}/tourist/changeoldPass${passToken}`
    // const message = `<a href = ${changePassLink} >PLEASE USE THIS LINK TO CHANGE YOUR PASSWORD !</a>`
    // const subject = 'password changing'
    // const sendEMail = emailService({ message, to: getUser.email, subject })
    // if (!sendEMail) {
    //     return next(new Error('sending email failed!', { cause: 500 }))
    // }
```

- req.file code (.single()) :

```js
  if (req.file) {
        console.log({
            request_file: req.file
        })
        // we must check that if you have a custom id but you don't have an image on the cloud
        let customId
        let flag = false
        if (getUser.customId) { // if you have a custom id then you surely have uploaded images before
            customId = getUser.customId
            console.log({
                message: "user has a customId"
            })
        }
        else { // else means that you don't have
            customId = nanoid()
            getUser.customId = customId
            await getUser.save()
            flag = true
            console.log({
                message: "a customId is generated"
            })
        }
        profileUploadPath = `${process.env.PROJECT_UPLOADS_FOLDER}/tourists/${customId}/profilePicture`
        console.log({
            profilePath: profileUploadPath
        })
        console.log({ accessed: true })
        if (flag == false) {
            let isFileExists
            try {
                isFileExists = await cloudinary.api.resource(getUser.profilePicture?.public_id)
            } catch (error) {
                console.log({
                    message: "file isn't found!",
                    error: error
                })
            }
            if (isFileExists) { // if there is a file
                console.log({
                    existing_file_to_be_deleted: isFileExists
                })
                await cloudinary.api.delete_resources_by_prefix(profileUploadPath).catch(async (err) => {
                    console.log(err)
                })
                await cloudinary.api.delete_folder(profileUploadPath).catch(async (err) => {
                    console.log(err)
                })
                console.log({ profilePicDeleted: true })
            }
        }
        console.log({ message: "about to upload" })
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: profileUploadPath
        })
        if (!secure_url || !public_id) {
            return next(new Error("couldn't save the profile picture!", { cause: 400 }))
        }
        profilePic = { secure_url, public_id }
        getUser.profilePicture = profilePic
    }
    else {
        return next(new Error('file must exist!', { cause: 400 }))
    }
```
