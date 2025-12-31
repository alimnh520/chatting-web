import cloudinary from "./cloudConfig";

export const UploadImage = async (file) => {
    const buffer = await file.arrayBuffer();
    const bytes = Buffer.from(buffer);
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                folder: 'images'
            },
            async (error, result) => {
                if (error) {
                    return reject(error)
                }
                return resolve(result);
            }).end(bytes);
    })
}