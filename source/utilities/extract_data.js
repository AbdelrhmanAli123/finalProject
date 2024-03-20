export const getRestaurant = function (res) {
    const data = {
        name: res.name || null,
        description: res.description || null,
        website: res.website || null,
        web_url: res.web_url || null,
        email: res.email || null,
        phone: res.phone || null,
        features: res.features || null,
        rating: res.rating || null,
        price_level: res.price_level || null,
        cuisine: res.cuisine || null,
        rating_image_url: res.rating_image_url || null,
        num_reviews: res.num_reviews || null,
        address_obj: {
            address_string: res.address_obj?.address_string || null
        },
        hours: {
            weekday_text: res.hours?.weekday_text || null
        }
    }
    return data
}

export const getHotel = function (res) {
    const data = {
        name: res.name || null,
        website: res.website || null,
        web_url: res.web_url || null,
        email: res.email || null,
        amenities: res.amenities || null,
        rating: res.rating || null,
        price_level: res.price_level || null,
        address_obj: {
            address_string: res.address_obj?.address_string || null
        }
    }
    return data
}

export const getImages = function (res) {
    let images = []
    for (const image of res.data.data) {
        if (image.images.original) {
            images.push(image.images.original.url || null)
        } else if (image.images.medium) {
            images.push(image.images.medium.url || null)
        } else {
            images.push(image.images.small.url || null)
        }
    }
    return images
}