import jsQR from "jsqr";

const decodeQRCode = async (imageData: ImageData) : Promise<string> => {
    const qrCodeData = jsQR(imageData.data, imageData.width, imageData.height);
    if (qrCodeData) {
        console.log("QR Code Content:", qrCodeData.data);
        return qrCodeData.data;
    } else {
        console.error("No QR code found in the image.");
        return "";
    }
};

export const processImage = async (file: File) : Promise<string> => {
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    let s = "";

    if (ctx) {
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        ctx.drawImage(imageBitmap, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        s = await decodeQRCode(imageData);
    }

    return s;
};